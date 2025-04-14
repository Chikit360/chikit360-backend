const mongoose = require('mongoose');

// Define the schema for the Hospital
const HospitalSchema = new mongoose.Schema({
  name: { type: String, required: false },
  type: { type: String, required: false },  // General, Specialty, Super Specialty, etc.
  ownerName: { type: String, required: false },
  registrationNumber: { type: String, required: false },
  accreditation: [{ type: String }],  // List of accreditation numbers
  yearEstablished: { type: Number },
  licenseNumber: { type: String },

  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },
    landmark: { type: String },
    coordinates: {
      lat: { type: String },
      lng: { type: String },
    },
  },

  // doctors:[{type:mongoose.Schema.ObjectId,ref:"Doctor"}],

  contact: {
    phone: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    website: { type: String },
  },

  operationalDetails: {
    openDays: [{ type: String }],
    openTime: { type: String },
    closeTime: { type: String },
    emergencyAvailable: { type: Boolean, default: false },
    is24x7: { type: Boolean, default: false },
  },

//  departments: [{ type: mongoose.Schema.ObjectId,ref:"ClinicDropdownOption" }],

  servicesOffered: [{ type: String }],

  staffCount: {
    doctors: { type: Number, default: 0 },
    nurses: { type: Number, default: 0 },
    technicians: { type: Number, default: 0 },
    otherStaff: { type: Number, default: 0 },
  },

  medicalEquipment: [
    { 
      name: { type: String }, 
      quantity: { type: Number },
      brand: { type: String },
    },
  ],

  bedCapacity: { type: Number, default: 0 },

  media: {
    logo: { type: String },
    photos: [{ type: String }],
    videos: [{ type: String }],
  },

  bankDetails: {
    accountHolderName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
  },

  legalDocuments: {
    registrationCertificate: { type: String },
    gstCertificate: { type: String },
    ownerIdProof: { type: String },
    licenses: [{ type: String }],
    insurance: [{ type: String }],
  },

  insuranceDetails: [
    {
      provider: { type: String },
      plansOffered: [{ type: String }],
    },
  ],

  financials: {
    annualRevenue: { type: Number },
    hospitalFunding: { type: String },  // Private, Public
    billPaymentModes: [{ type: String }],  // E.g., Cash, Card, Insurance, etc.
  },

  governmentSchemes: [{ type: String }],  // List of government health schemes

  branchCode: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hospital', HospitalSchema);
