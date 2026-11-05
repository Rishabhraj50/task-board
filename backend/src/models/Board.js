const { Schema, model } = require('mongoose');
// members is an array of refs: users are shared across boards and need their own lifecycle.
const s = new Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
s.index({ members: 1 });
module.exports = model('Board', s);
