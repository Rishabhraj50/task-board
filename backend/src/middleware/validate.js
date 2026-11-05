const httpError = require('../utils/httpError');
module.exports = (schema) => (req, res, next) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return next(httpError(400, p.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')));
  req.body = p.data; next();
};
