const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    offerPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfferPlan',
      required: true,
    },
    plan: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount:{
      type:Number,
      default:0
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    subscriptionToken: {
      type: String,
      default: null,
    },
    extraAddOn:[
      {
        title:String,
        price:Number,
      }
    ],
    razorpayOrderId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet'],
      required: true,
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 🔍 Static method to fetch and validate expiry
SubscriptionSchema.statics.findWithExpiryCheck = async function (filter = {}) {
  // Fetch one subscription
  const subscription = await this.findOne(filter);

  if (!subscription) return null;

  const now = new Date();

  // Check and update if expired
  if (subscription.endDate < now && subscription.isActive) {
    subscription.isActive = false;
    await subscription.save();
  }

  return subscription;
};


const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
