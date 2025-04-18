const offerPlanModel = require("../models/offerPlanModel");
const sendResponse = require("../utils/response.formatter");

exports.getOfferPlans = async (req, res) => {
    try {
      
        const offers = await offerPlanModel.find({ name: { $ne: "free_trial" } });
      sendResponse(res, { data: offers, status: 200, message: 'Fetched all offers' });
    } catch (error) {
      sendResponse(res, { status: 500, message: 'Failed to fetch subscriptions', data: error.message, error: true });
    }
  };