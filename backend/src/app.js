const express = require('express'), cors = require('cors');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/api', require('./routes'));
app.use(require('./middleware/error'));
module.exports = app;
