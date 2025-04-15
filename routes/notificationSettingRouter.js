const express = require('express');
const { getNotificationSettings, updateNotificationSettings } = require('../controllers/notificationSettingController');
const router = express.Router();


router.get('/',  getNotificationSettings);
router.put('/',  updateNotificationSettings);

module.exports = router;
