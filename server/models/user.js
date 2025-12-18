const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  senhaHash: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' }
});

module.exports = mongoose.model('User', UserSchema);