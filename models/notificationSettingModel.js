const mongoose = require('mongoose');

const notificationSettingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // required if user isn't set
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    // required: true, // required if user isn't set
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
  },
  inAppNotifications: {
    type: Boolean,
    default: true,
  },
 
}, { timestamps: true }); // adds createdAt, updatedAt

// Prevent duplicate settings for the same user or hospital
// notificationSettingSchema.index({ user: 1, hospital: 1 }, { unique: true });

module.exports = mongoose.model('NotificationSetting', notificationSettingSchema);
