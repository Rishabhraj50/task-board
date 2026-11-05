require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const User = require('./models/User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const [name, email] of [['Demo One', 'demo1@example.com'], ['Demo Two', 'demo2@example.com']])
    await User.updateOne({ email }, { name, email, password: await bcrypt.hash('password123', 10) }, { upsert: true });
  console.log('Seeded demo1@example.com / demo2@example.com, password: password123'); process.exit(0);
})();
