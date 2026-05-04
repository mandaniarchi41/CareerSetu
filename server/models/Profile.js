const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skills: [{
    name: { type: String, required: true },
    level: { type: Number, default: 50 } // 0-100 proficiency
  }],
  experience: {
    type: String,
  },
  education: {
    type: String,
  },
  extractedFrom: {
    type: String,
    enum: ['LinkedIn', 'Resume', 'Manual'],
    default: 'Manual',
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
