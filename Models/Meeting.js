const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  topic: String,
  start_url: String,
  join_url: String,
  created_at: Date,
  createdBy: mongoose.Schema.Types.ObjectId,
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
