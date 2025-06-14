const hospitalModel = require('../models/hospitalModel');
const notificationSettingModel = require('../models/notificationSettingModel');
const User = require('../models/userModel');
const sendEmail = require('../services/mailService');
const sendResponse = require('../utils/response.formatter');
const generateSubscriptionToken = require('../utility/subscriptionToken');
const Subscription = require('../models/subscriptionModel');
const mongoose = require('mongoose');
const offerPlanModel = require('../models/offerPlanModel');


const template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>{{hospitalName}} Registration Certificate</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f9f9f9;font-family:Arial,sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
      <tr>
        <td align="center">
          <table width="700" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:8px solid #4CAF50;border-radius:10px;padding:30px;">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <h1 style="color:#4CAF50;margin:0;">Hospital Registration Certificate</h1>
                <p style="color:#555;font-size:14px;margin:5px 0 0;">Issued by <strong>ThunderGits Healthcare Platform</strong></p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 40px;">
                <table width="100%" style="font-size:14px;color:#333;line-height:1.6;">
                  <tr>
                    <td style="padding:10px 0;"><strong>Hospital Name:</strong></td>
                    <td>{{hospitalName}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;"><strong>Owner Name:</strong></td>
                    <td>{{ownerName}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;"><strong>Registration Number:</strong></td>
                    <td>{{registrationNumber}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;"><strong>Year Established:</strong></td>
                    <td>{{yearEstablished}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;"><strong>Location:</strong></td>
                    <td>{{address}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;"><strong>License Number:</strong></td>
                    <td>{{licenseNumber}}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;"><strong>Accreditations:</strong></td>
                    <td>{{accreditations}}</td>
                  </tr>
                </table>

                <div style="background-color:#f1f8f1;padding:20px;margin-top:30px;border-left:5px solid #4CAF50;">
                  <h3 style="margin:0 0 10px;color:#4CAF50;">Login Credentials</h3>
                  <p style="margin:0;color:#333;"><strong>Email:</strong> {{email}}</p>
                  <p style="margin:0;color:#333;"><strong>Password:</strong> {{password}}</p>
                 
                </div>

                <p style="text-align:center;font-size:13px;color:#888;margin-top:40px;">© {{year}} ThunderGits. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`

exports.createHospital = async (req, res) => {
  const session = await hospitalModel.startSession();

  try {
    session.startTransaction();

    // 1. Create hospital
    const [hospital] = await hospitalModel.create([req.body], { session });

    if (!hospital) {
      await session.abortTransaction();
      return sendResponse(res, { status: 400, message: 'Pharmacy is not created' });
    }

    // 2. Create user
    const randomPass = 'adminBhai';
    const [user] = await User.create(
      [{
        email: req.body.adminEmail,
        username: req.body.name,
        role: 'admin',
        password: randomPass,
        hospital: hospital._id,
      }],
      { session }
    );

    // 3. Create notification setting
    await notificationSettingModel.create(
      [{
        hospital: hospital._id,
        emailNotifications: false,
        inAppNotifications: true,
      }],
      { session }
    );

    // 4. Create subscription
    const subscriptionToken = generateSubscriptionToken(hospital._id);
    const defaultPlan = await offerPlanModel.findOne({ name: 'free_trial' });

    console.log(defaultPlan)
    if (!defaultPlan) {
      await session.abortTransaction();
      return sendResponse(res, { status: 400, message: 'Default plan not found' });
    }
    console.log(defaultPlan)
    // Fix date calculation
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (defaultPlan.scheme[0]?.validityInDays ?? 7));
    await Subscription.create(
      [{
        hospital: hospital._id,
        offerPlanId: defaultPlan._id,
        plan: defaultPlan.name ?? "free_trial",
        price: defaultPlan.scheme[0]?.price ?? 0,
        startDate: new Date(),
        endDate: endDate,
        isActive: true,
        isCancelled: false,
        paymentMethod: 'wallet',
        transactionId: 'xxxxxxxxxxxxxx',
      }],
      { session }
    );

    // 5. Send email
    const html = template
      .replace('{{hospitalName}}', hospital.name)
      .replace('{{ownerName}}', hospital.ownerName)
      .replace('{{registrationNumber}}', hospital.registrationNumber)
      .replace('{{yearEstablished}}', hospital.yearEstablished || 'N/A')
      .replace('{{licenseNumber}}', hospital.licenseNumber || 'N/A')
      .replace('{{accreditations}}', hospital.accreditation.join(', '))
      .replace('{{email}}', user.email)
      .replace('{{password}}', randomPass)
      .replace('{{year}}', new Date().getFullYear())
      .replace('{{address}}', `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state} - ${hospital.address.zipCode}, ${hospital.address.country}`);

    await sendEmail(user.email, 'Pharmacy Registration Certificate', html);

    // 6. Commit and end session
    await session.commitTransaction();
    session.endSession();

    return sendResponse(res, {
      data: hospital,
      status: 201,
      message: 'Pharmacy created successfully',
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Pharmacy creation error:', err);

    return sendResponse(res, {
      error: true,
      status: 400,
      data: err,
    });
  }
};


// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalModel.find().sort({ createdAt: -1 });
    sendResponse(res, { data: hospitals, status: 200, message: 'Pharmacy fetched successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error fetching Pharmacy', data: err.message });
  }
};

// Get a single hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.id);
    if (!hospital) {
      return sendResponse(res, { error: true, status: 404, message: 'Pharmacy not found' });
    }
    sendResponse(res, { data: hospital, status: 200, message: 'Pharmacy fetched successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error fetching Pharmacy', data: err.message });
  }
};

// Update a hospital
exports.updateHospital = async (req, res) => {
  try {
    console.log(req.body)
    const hospital = await hospitalModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) {
      return sendResponse(res, { error: true, status: 404, message: 'Pharmacy not found' });
    }
    sendResponse(res, { data: hospital, status: 200, message: 'Pharmacy updated successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error updating Pharmacy', data: err.message });
  }
};

// Delete a hospital
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await hospitalModel.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return sendResponse(res, { error: true, status: 404, message: 'Pharmacy not found' });
    }
    sendResponse(res, { status: 200, message: 'Pharmacy deleted successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error deleting Pharmacy', data: err.message });
  }
};
