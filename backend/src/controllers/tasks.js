const Task = require('../models/Task'), Column = require('../models/Column');
const httpError = require('../utils/httpError');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const log = (text, by) => ({ text, by });
async function checkRefs(board, body) {
  if (body.assignee && !board.members.some((m) => String(m) === body.assignee)) throw httpError(400, 'Assignee must be a board member');
  if (body.column && !(await Column.exists({ _id: body.column, board: board._id }))) throw httpError(400, 'Invalid column');
}
// Filtering happens in MongoDB, not in the browser.
exports.list = async (req, res) => {
  const { assignee, priority, label, overdue, q } = req.query;
  const f = { board: req.board._id };
  if (assignee) f.assignee = assignee;
  if (priority) f.priority = priority;
  if (label) f.labels = label;
  if (overdue === 'true') f.dueDate = { $lt: new Date() };
  if (q) f.title = new RegExp(esc(String(q)), 'i');
  res.json(await Task.find(f).sort('position').populate('assignee', 'name email'));
};
exports.create = async (req, res) => {
  if (!req.body.column) throw httpError(400, 'column is required');
  await checkRefs(req.board, req.body);
  const last = await Task.findOne({ column: req.body.column }).sort('-position');
  const t = await Task.create({ ...req.body, board: req.board._id, position: last ? last.position + 1 : 0, activity: [log('created', req.user.id)] });
  res.status(201).json(await t.populate('assignee', 'name email'));
};
exports.update = async (req, res) => {
  delete req.body.column; // moving goes through /move
  await checkRefs(req.board, req.body);
  const t = await Task.findOne({ _id: req.params.taskId, board: req.board._id });
  if (!t) throw httpError(404, 'Task not found');
  Object.assign(t, req.body); t.activity.push(log('edited', req.user.id)); await t.save();
  res.json(await t.populate('assignee', 'name email'));
};
exports.remove = async (req, res) => {
  const t = await Task.findOneAndDelete({ _id: req.params.taskId, board: req.board._id });
  if (!t) throw httpError(404, 'Task not found'); res.status(204).end();
};
// Move = insert before `beforeId` in target column (or at end), then renumber the column so order persists.
exports.move = async (req, res) => {
  const { columnId, beforeId } = req.body;
  const t = await Task.findOne({ _id: req.params.taskId, board: req.board._id });
  const to = await Column.findOne({ _id: columnId, board: req.board._id });
  if (!t || !to) throw httpError(404, 'Task or column not found');
  const from = await Column.findById(t.column);
  const ids = (await Task.find({ column: to._id, _id: { $ne: t._id } }).sort('position').select('_id')).map((x) => String(x._id));
  const idx = beforeId ? ids.indexOf(beforeId) : -1;
  ids.splice(idx === -1 ? ids.length : idx, 0, String(t._id));
  await Task.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { position: i, ...(id === String(t._id) ? { column: to._id } : {}) } } } })));
  if (from && String(from._id) !== String(to._id))
    await Task.updateOne({ _id: t._id }, { $push: { activity: log(`moved from ${from.name} to ${to.name}`, req.user.id) } });
  res.json({ ok: true });
};
