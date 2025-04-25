const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema({
  key: { type: String, required: false },          // e.g., 'billing', 'create_medicine'
  label: { type: String, required: false },        // e.g., 'Billing', 'Create Medicine'
  description: { type: String },                  // Optional: to explain what this feature does
  isEnabled: { type: Boolean, default: false },   // True if this feature is accessible in this plan
});
const schemeSchema = new mongoose.Schema({

  price: { type: Number, required: true },        // e.g., 'Billing', 'Create Medicine'
  discount: { type: Number ,required: false},                  // Optional: to explain what this feature does
  validityInDays: { type: Number, required: true},   // True if this feature is accessible in this plan
});


const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    scheme: [schemeSchema],
    description: {
      type: String,
    },
    color: {
      type: String,
    },
    features: [featureSchema], // All the features enabled/disabled in this plan
    initialSetUpPrice: Number,
    extraAddOn:[
      {
        title:String,
        price:Number,
      }
    ],
    limits: {
      userLimit: { type: Number, default: 1 },
      departmentLimit: { type: Number, default: 1 },
      medicineLimit: { type: Number, default: 50 },
      saleLimitPerDay: { type: Number, default: 100 },
    },

    isVisible: {
      type: Boolean,
      default: true, // Can toggle whether this plan is shown on frontend or not
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfferPlan", planSchema);
