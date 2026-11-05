module.exports = (err, req, res, next) => {
  let status = err.status || 500, message = err.message;
  if (err.name === 'CastError' || err.name === 'ValidationError') status = 400;
  if (err.code === 11000) { status = 409; message = 'Already exists'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Server error' : message });
};
