const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const httpError = require('../utils/httpError');
exports.auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch { next(httpError(401, 'Invalid or expired token')); }
};
// Non-members get 404 so board existence isn't leaked.
exports.member = async (req, res, next) => {
  try {
    const b = await Board.findOne({ _id: req.params.id, members: req.user.id });
    if (!b) return next(httpError(404, 'Board not found'));
    req.board = b; next();
  } catch (e) { next(e); }
};
exports.owner = (req, res, next) =>
  String(req.board.owner) === req.user.id ? next() : next(httpError(403, 'Only the owner can do this'));
