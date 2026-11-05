const Board = require('../models/Board'), Column = require('../models/Column'), Task = require('../models/Task'), User = require('../models/User');
const httpError = require('../utils/httpError');
exports.list = async (req, res) => res.json(await Board.find({ members: req.user.id }).sort('-createdAt'));
exports.create = async (req, res) => {
  const b = await Board.create({ name: req.body.name, owner: req.user.id, members: [req.user.id] });
  await Column.insertMany(['To Do', 'Doing', 'Done'].map((name, order) => ({ board: b._id, name, order })));
  res.status(201).json(b);
};
exports.get = async (req, res) => {
  const [columns, board] = await Promise.all([Column.find({ board: req.board._id }).sort('order'), req.board.populate('members', 'name email')]);
  res.json({ board, columns });
};
exports.update = async (req, res) => { req.board.name = req.body.name; await req.board.save(); res.json(req.board); };
exports.remove = async (req, res) => {
  await Promise.all([Task.deleteMany({ board: req.board._id }), Column.deleteMany({ board: req.board._id }), req.board.deleteOne()]);
  res.status(204).end();
};
exports.invite = async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u) throw httpError(404, 'No user with that email');
  await Board.updateOne({ _id: req.board._id }, { $addToSet: { members: u._id } });
  res.json({ message: 'Member added' });
};
exports.addColumn = async (req, res) => {
  const order = await Column.countDocuments({ board: req.board._id });
  res.status(201).json(await Column.create({ board: req.board._id, name: req.body.name, order }));
};
exports.editColumn = async (req, res) => {
  const c = await Column.findOneAndUpdate({ _id: req.params.colId, board: req.board._id }, { name: req.body.name }, { new: true });
  if (!c) throw httpError(404, 'Column not found'); res.json(c);
};
exports.deleteColumn = async (req, res) => {
  const c = await Column.findOneAndDelete({ _id: req.params.colId, board: req.board._id });
  if (!c) throw httpError(404, 'Column not found');
  await Task.deleteMany({ column: c._id }); res.status(204).end();
};
exports.stats = async (req, res) => {
  const [r] = await Task.aggregate([
    { $match: { board: req.board._id } },
    { $facet: {
      perColumn: [
        { $group: { _id: '$column', count: { $sum: 1 } } },
        { $lookup: { from: 'columns', localField: '_id', foreignField: '_id', as: 'c' } },
        { $project: { count: 1, name: { $arrayElemAt: ['$c.name', 0] } } }],
      perAssignee: [
        { $group: { _id: '$assignee', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
        { $project: { count: 1, name: { $ifNull: [{ $arrayElemAt: ['$u.name', 0] }, 'Unassigned'] } } }],
    } }]);
  res.json(r);
};
