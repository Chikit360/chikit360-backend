const mongoose = require('mongoose');

// export interface ISubscription extends Document {
//   hospital: mongoose.Schema.Types.ObjectId;
//   plan: 'basic' | 'standard' | 'premium';
//   price: number;
//   startDate: Date;
//   endDate: Date;
//   isActive: boolean;
//   isCancelled: boolean;
//   paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
//   transactionId?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

const SubscriptionSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
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

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports= Subscription;
