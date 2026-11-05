const bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken');
const User = require('../models/User'); const httpError = require('../utils/httpError');
const issue = (u) => ({ token: jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '1d' }), user: { id: u.id, name: u.name, email: u.email } });
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw httpError(409, 'Email already registered');
  res.status(201).json(issue(await User.create({ name, email, password: await bcrypt.hash(password, 10) })));
};
exports.login = async (req, res) => {
  const u = await User.findOne({ email: req.body.email }).select('+password');
  if (!u || !(await bcrypt.compare(req.body.password, u.password))) throw httpError(401, 'Wrong email or password');
  res.json(issue(u));
};
