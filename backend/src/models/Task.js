const { Schema, model } = require('mongoose');
// Tasks are referenced (unbounded growth, moved between columns, filtered directly).
// labels and activity are embedded: small, owned by the task, never queried alone.
const s = new Schema({
  board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  column: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignee: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: { type: Date, default: null },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  labels: [String],
  position: { type: Number, default: 0 },
  activity: [{ text: String, by: { type: Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }],
}, { timestamps: true });
s.index({ board: 1, column: 1, position: 1 });
s.index({ board: 1, assignee: 1 });
s.index({ board: 1, dueDate: 1 });
module.exports = model('Task', s);
