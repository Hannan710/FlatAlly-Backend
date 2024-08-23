const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meetingTime: { type: Date, required: true },
  meetingLink: { type: String, required: true },
  status: { type: String, default: 'Scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);
