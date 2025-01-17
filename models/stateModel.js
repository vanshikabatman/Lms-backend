const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  status: { type: Boolean, default: true }, // Active or inactive
}, { timestamps: true });

module.exports = mongoose.model('State', StateSchema);
