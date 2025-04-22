const Subscription = require("../models/subscriptionModel");
const sendResponse = require("../utils/response.formatter");


// Get curr subscriptions
exports.getCurrSubscriptions = async (req, res) => {
  try {
    const hospitalId = req.query.hospitalId || req.user?.hospital;

    if (!hospitalId) {
      return sendResponse(res, {
        status: 400,
        message: 'Hospital ID is required',
        error: true,
      });
    }

    const subscriptions = await Subscription.findWithExpiryCheck({ hospital: hospitalId });
const populatedSubscriptions = await Subscription.populate(subscriptions, { path: 'hospital offerPlanId' });


    sendResponse(res, {
      data: populatedSubscriptions,
      status: 200,
      message: 'Fetched current subscriptions',
    });
  } catch (error) {
    console.error("Error fetching current subscriptions:", error);
    sendResponse(res, {
      status: 500,
      message: 'Failed to fetch subscriptions',
      data: process.env.NODE_ENV === 'production' ? null : error.message,
      error: true,
    });
  }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find().populate('hospital');
    sendResponse(res, { data: subscriptions, status: 200, message: 'Fetched all subscriptions' });
  } catch (error) {
    sendResponse(res, { status: 500, message: 'Failed to fetch subscriptions', data: error.message, error: true });
  }
};

// Get subscription by hospital ID
exports.getSubscriptionByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const subscription = await Subscription.findOne({ hospital: hospitalId });

    if (!subscription) {
      return sendResponse(res, { status: 404, message: 'Subscription not found', error: true });
    }

    sendResponse(res, { data: subscription, status: 200, message: 'Subscription found' });
  } catch (error) {
    sendResponse(res, { status: 500, message: 'Failed to fetch subscription', data: error.message, error: true });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Subscription.findByIdAndUpdate(
      id,
      { isCancelled: true, isActive: false },
      { new: true }
    );

    if (!updated) {
      return sendResponse(res, { status: 404, message: 'Subscription not found', error: true });
    }

    sendResponse(res, { data: updated, message: 'Subscription cancelled' });
  } catch (error) {
    sendResponse(res, { status: 500, message: 'Failed to cancel subscription', data: error.message, error: true });
  }
};

exports.getAllSubscriptionsPlan = async (req, res) => {
    try {
      const subscriptions = await Subscription.find();
      sendResponse(res, { data: subscriptions, status: 200, message: 'Fetched all subscriptions' });
    } catch (error) {
      sendResponse(res, { status: 500, message: 'Failed to fetch subscriptions', data: error.message, error: true });
    }
  };