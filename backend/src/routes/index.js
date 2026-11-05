const r = require('express').Router();
const A = require('../controllers/auth'), B = require('../controllers/boards'), T = require('../controllers/tasks');
const { auth, member, owner } = require('../middleware/auth');
const v = require('../middleware/validate'), s = require('../validators');
const w = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

r.post('/auth/signup', v(s.signup), w(A.signup));
r.post('/auth/login', v(s.login), w(A.login));

r.use(auth);
r.get('/boards', w(B.list));
r.post('/boards', v(s.board), w(B.create));
const b = '/boards/:id';
r.get(b, member, w(B.get));
r.patch(b, member, owner, v(s.board), w(B.update));
r.delete(b, member, owner, w(B.remove));
r.post(`${b}/invite`, member, owner, v(s.invite), w(B.invite));
r.get(`${b}/stats`, member, w(B.stats));
r.post(`${b}/columns`, member, v(s.column), w(B.addColumn));
r.patch(`${b}/columns/:colId`, member, v(s.column), w(B.editColumn));
r.delete(`${b}/columns/:colId`, member, w(B.deleteColumn));
r.get(`${b}/tasks`, member, w(T.list));
r.post(`${b}/tasks`, member, v(s.task), w(T.create));
r.patch(`${b}/tasks/:taskId`, member, v(s.taskUpdate), w(T.update));
r.delete(`${b}/tasks/:taskId`, member, w(T.remove));
r.patch(`${b}/tasks/:taskId/move`, member, v(s.move), w(T.move));
module.exports = r;
