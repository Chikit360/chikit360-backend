// models/Inquiry.js
const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNumber: { type: String, required: true },
  message: { type: String, required: true },
  preferredDate: { type: String, required: true },
  inquiryType: { type: String, enum: ['demo', 'inquiry'], default: 'inquiry' },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  resolver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Inquiry', InquirySchema);





