const offerPlanModel = require("../models/offerPlanModel");
const sendResponse = require("../utils/response.formatter");

exports.getOfferPlans = async (req, res) => {
  try {
    const offers = await offerPlanModel.find({ name: { $ne: "free_trial" } });
    sendResponse(res, {
      data: offers,
      status: 200,
      message: 'Fetched all offers'
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      message: 'Failed to fetch subscriptions',
      data: error.message,
      error: true
    });
  }
};

exports.createOfferPlan = async (req, res) => {
  try {
    console.log(req.body)
    const offerPlan = new offerPlanModel(req.body);
    await offerPlan.save();
    sendResponse(res, {
      status: 200,
      message: "Offer plan created",
      data: offerPlan
    });
    
  } catch (error) {
    console.error("Error creating offer plan:", error);
    
    sendResponse(res, {
      status: 500,
      message: "Server error while fetching plan",
      data: error.message,
      error: true
    });
  }
};

exports.getOfferPlanById = async (req, res) => {
  try {
    const plan = await offerPlanModel.findById(req.params.id);
    if (!plan) {
      return sendResponse(res, {
        status: 404,
        message: "Plan not found",
        error: true
      });
    }

    sendResponse(res, {
      status: 200,
      message: "Plan fetched successfully",
      data: plan
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    sendResponse(res, {
      status: 500,
      message: "Server error while fetching plan",
      data: error.message,
      error: true
    });
  }
};

exports.updateOfferPlan = async (req, res) => {
  try {
    delete req.body._id;
    const updatedPlan = await offerPlanModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedPlan) {
      return sendResponse(res, {
        status: 404,
        message: "Plan not found",
        error: true
      });
    }

    sendResponse(res, {
      status: 200,
      message: "Plan updated successfully",
      data: updatedPlan
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    sendResponse(res, {
      status: 500,
      message: "Server error while updating plan",
      data: error.message,
      error: true
    });
  }
};

exports.deleteOfferPlan = async (req, res) => {
  try {
    const deleted = await offerPlanModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return sendResponse(res, {
        status: 404,
        message: "Plan not found",
        error: true
      });
    }

    sendResponse(res, {
      status: 200,
      message: "Plan deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting plan:", error);
    sendResponse(res, {
      status: 500,
      message: "Server error while deleting plan",
      data: error.message,
      error: true
    });
  }
};
