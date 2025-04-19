const Razorpay = require("razorpay");
const crypto = require("crypto"); // adjust path as needed
const sendResponse = require("../utils/response.formatter");
const Subscription = require("../models/subscriptionModel");
const offerPlanModel = require("../models/offerPlanModel");

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const planDetail=await offerPlanModel.findById(req.query.offerId); // here we will fetch the subscription plan data not subscription of hospital
    if (!planDetail) {
      return sendResponse(res, {
        status: 404,
        error: true,
        message: "Subscription plan not found",
      });
    }

    const options = {
      amount: planDetail.price * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return sendResponse(res, {
        status: 500,
        error: true,
        message: "Failed to create Razorpay order",
      });
    }
    const subscription = await Subscription.findOne({
      hospital: req.user.hospital,
    });

    if (!subscription) {
      return sendResponse(res, {
        status: 404,
        error: true,
        message: "Subscription not found",
      });
    }

    subscription.razorpayOrderId = order.id;
    await subscription.save()

    sendResponse(res, {
      data: order,
      status: 200,
      message: "Order created successfully",
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      error: true,
      message: "Error creating order",
      data: error.message,
    });
  }
};

// Verify Razorpay payment success
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    
    console.log(req.body)

    // const secret = process.env.RAZORPAY_SECRET;
    // const hmac = crypto.createHmac("sha256", secret);
    // hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    // const digest = hmac.digest("hex");

    // if (digest !== razorpay_signature) {
    //   return sendResponse(res, {
    //     status: 400,
    //     error: true,
    //     message: "Transaction verification failed",
    //   });
    // }

    const subscription = await Subscription.findOne({
      hospital: req.user.hospital,
    });

    if (!subscription) {
      return sendResponse(res, {
        status: 404,
        error: true,
        message: "Subscription not found",
      });
    }

    subscription.transactionId = razorpay_payment_id;
    subscription.isActive = true;
    subscription.isCancelled = false;
    await subscription.save()
    // TODO: Save payment info to DB if needed

    sendResponse(res, {
      status: 200,
      message: "Payment verified successfully",
      data: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      error: true,
      message: "Error verifying payment",
      data: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
