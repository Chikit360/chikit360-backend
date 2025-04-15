const notificationSettingModel = require("../models/notificationSettingModel");
const sendResponse = require("../utils/response.formatter");


const getNotificationSettings = async (req, res) => {
  try {
    const setting = await notificationSettingModel.findOne({user: req.user._id});

    if (!setting) {
      return sendResponse(res, {
        status: 404,
        message: 'Notification settings not found',
        data: null
      });
    }

    return sendResponse(res, {
      status: 200,
      message: 'Settings retrieved successfully',
      data: setting
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      message: 'Error fetching settings',
      data: { error: error.message }
    });
  }
};

const updateNotificationSettings = async (req, res) => {
  try {

    console.log(req.body)
    const updated = await notificationSettingModel.findOneAndUpdate(
      { user: req.user._id },
      { ...req.body},
      { new: true }
    );

    return sendResponse(res, {
      status: 200,
      message: 'Settings updated successfully',
      data: updated
    });
  } catch (error) {
    return sendResponse(res, {
      status: 500,
      message: 'Error updating settings',
      data: { error: error.message }
    });
  }
};

module.exports = {
  getNotificationSettings,
  updateNotificationSettings
};
