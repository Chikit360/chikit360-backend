// controllers/inquiryController.js
const InquiryModel = require('../models/InquiryModel');
const sendResponse = require('../utils/response.formatter');


exports.createInquiry = async (req, res) => {
  try {
    const inquiry = await InquiryModel.create(req.body);
    return sendResponse(res, {
      data: inquiry,
      message: 'Inquiry submitted successfully',
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      message: err.message,
      error: true,
    });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await InquiryModel.find().populate('resolver', 'name email');
    return sendResponse(res, { data: inquiries });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      message: err.message,
      error: true,
    });
  }
};

exports.updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const resolver = req.user._id
    const updateData = {
      status,
      resolver,
      resolvedAt: status === 'resolved' ? new Date() : null,
    };
    const inquiry = await InquiryModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!inquiry) throw new Error('Inquiry not found');

    return sendResponse(res, {
      data: inquiry,
      message: 'Inquiry updated successfully',
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      message: err.message,
      error: true,
    });
  }
};