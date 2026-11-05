require('dotenv').config();
const mongoose = require('mongoose'), app = require('./app');
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 5000, () => console.log('API running'));
}).catch((e) => { console.error(e); process.exit(1); });
