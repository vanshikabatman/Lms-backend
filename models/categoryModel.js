const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  collegeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }], // Array of college IDs
  keyword: { type: String, required: true }, // Example: A searchable keyword
  description: { type: String }, // Description of the category
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
