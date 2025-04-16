const Razorpay = require("razorpay");
const crypto = require("crypto"); // adjust path as needed
const sendResponse = require("../utils/response.formatter");
const Subscription = require("../models/subscriptionModel");

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    // const planDetail=await Subscription.findById(req.params.id).populate('hospital'); // here we will fetch the subscription plan data not subscription of hospital
    // if (!planDetail) {
    //   return sendResponse(res, {
    //     status: 404,
    //     error: true,
    //     message: "Subscription plan not found",
    //   });
    // }

    const options = {
      amount: 100 * 100, // convert to paise
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

    const secret = process.env.RAZORPAY_SECRET;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest("hex");

    if (digest !== razorpay_signature) {
      return sendResponse(res, {
        status: 400,
        error: true,
        message: "Transaction verification failed",
      });
    }

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
