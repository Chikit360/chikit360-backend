const hospitalModel = require('../models/hospitalModel');
const User = require('../models/userModel');
const sendEmail = require('../services/mailService');
const sendResponse = require('../utils/response.formatter');


const template=`<!DOCTYPE html>
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
// Create a new hospital
exports.createHospital = async (req, res) => {
  try {
   

    // first create hospital 
    const hospital = new hospitalModel(req.body);
    await hospital.save();

     // create user for hospital
     const randomPass="adminBhai"
     const user=await User.create({
       email:req.body.adminEmail,
       username:req.body.name,
       role:'admin',
       password:randomPass,
       hospital:hospital._id,
     })
    //  notification setting create 

    await notificationSettingModel.create({
      hospital: hospital._id,
      emailNotifications: false,
      inAppNotifications: true,
    });

    // send an email to organization with full in
    console.log(hospital)
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

  await sendEmail(user.email, "Hospital Registration Certificate", html);
  sendResponse(res, { data: hospital, status: 201, message: 'Hospital created successfully' });

  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error creating hospital', data: err.message });
  }
};

// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalModel.find();
    sendResponse(res, { data: hospitals, status: 200, message: 'Hospitals fetched successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error fetching hospitals', data: err.message });
  }
};

// Get a single hospital by ID
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.params.id);
    if (!hospital) {
      return sendResponse(res, { error: true, status: 404, message: 'Hospital not found' });
    }
    sendResponse(res, { data: hospital, status: 200, message: 'Hospital fetched successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error fetching hospital', data: err.message });
  }
};

// Update a hospital
exports.updateHospital = async (req, res) => {
  try {
    console.log(req.body)
    const hospital = await hospitalModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) {
      return sendResponse(res, { error: true, status: 404, message: 'Hospital not found' });
    }
    sendResponse(res, { data: hospital, status: 200, message: 'Hospital updated successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error updating hospital', data: err.message });
  }
};

// Delete a hospital
exports.deleteHospital = async (req, res) => {
  try {
    const hospital = await hospitalModel.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return sendResponse(res, { error: true, status: 404, message: 'Hospital not found' });
    }
    sendResponse(res, { status: 200, message: 'Hospital deleted successfully' });
  } catch (err) {
    sendResponse(res, { error: true, status: 400, message: 'Error deleting hospital', data: err.message });
  }
};
