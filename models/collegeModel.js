const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
  region: { type: String, required: true }, // Example: North, South, East, West
  thumbnail: { type: String }, // Link to the college's image
}, { timestamps: true });

module.exports = mongoose.model('College', CollegeSchema);
