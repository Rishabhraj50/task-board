const { Schema, model } = require('mongoose');
// Columns are their own collection (referenced by board) so they can be renamed/deleted independently.
const s = new Schema({
  board: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  name: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
});
s.index({ board: 1, order: 1 });
module.exports = model('Column', s);
