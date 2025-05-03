const Razorpay = require("razorpay");
const crypto = require("crypto"); // adjust path as needed
const sendResponse = require("../utils/response.formatter");
const Subscription = require("../models/subscriptionModel");
const offerPlanModel = require("../models/offerPlanModel");
const hospitalModel = require("../models/hospitalModel");

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const extraAddOn=req.body.extraAddOn ?? []
    const schemeData=req.body.schemeData
    console.log(extraAddOn)

    const planDetail=await offerPlanModel.findById(req.query.offerId); // here we will fetch the subscription plan data not subscription of hospital
    if (!planDetail) {
      return sendResponse(res, {
        status: 404,
        error: true,
        message: "Subscription plan not found",
      });
    }

    const addOnprice = extraAddOn.reduce((total, record) => {
      return total + record.price;
    }, 0);
    

    const hospitalDetail=await hospitalModel.findById(req.user.hospital);
    const subscription = await Subscription.findOne({
      hospital: req.user.hospital,
    });

    if(subscription.name!=="free_trial"  && subscription.isActive){
      return sendResponse(res, {
        status: 400,
        error: true,
        message: "You have already active subscription",
      });
    }

    // initial set-up once paid then user will not paid on re-new the subscription
    const finalAmount=addOnprice+ (schemeData.price- (schemeData.price * schemeData.discount * 0.01)) + (hospitalDetail.initialSetUpPaid===false ?planDetail.initialSetUpPrice:0 );
    const options = {
      amount: finalAmount * 100, // convert to paise
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
  

    if (!subscription) {
      return sendResponse(res, {
        status: 404,
        error: true,
        message: "Subscription not found",
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (scheme?.validityInDays ?? 7));

    const newSubscription=new Subscription({
      hospital: hospitalDetail._id,
      offerPlanId: planDetail._id,
      plan: planDetail.name ?? "free_trial",
      price: schemeData?.price ?? 0,
      startDate: new Date(),
      endDate: endDate,
      isActive: false,
      isCancelled: false,
      paymentMethod: 'wallet',
      transactionId: 'xxxxxxxxxxxxxx',
      razorpayOrderId : order.id,
      extraAddOn:extraAddOn
    })

    await newSubscription.save()
    // subscription.razorpayOrderId = order.id;
    // subscription.extraAddOn=extraAddOn;
    // await subscription.save()

    sendResponse(res, {
      data: order,
      status: 200,
      message: "Order created successfully",
    });
  } catch (error) {
    console.log(error)
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
      subscription_plan_id,
      schemeData,
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
      razorpayOrderId:razorpay_order_id,
      isActive:false
    });

    if (!subscription) {
      return sendResponse(res, {
        status: 404,
        error: true,
        message: "Subscription not found",
      });
    }
   
    
    subscription.discount = schemeData.discount;
   
    subscription.isActive = true;
    
    subscription.transactionId = razorpay_payment_id;
    await subscription.save();
    
    const hospitalDetail=await hospitalModel.findById(req.user.hospital);
    if(hospitalDetail.initialSetUpPaid===false){
      hospitalDetail.initialSetUpPaid=true;
      await hospitalDetail.save()
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
