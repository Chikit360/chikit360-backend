const cron = require('node-cron');
const Inventory = require('../models/inventoryModel');
const sendEmail = require('./mailService');
const User = require('../models/userModel');
const notificationModel = require('../models/notificationModel');
const hospitalModel = require('../models/hospitalModel');

// HTML Templates
const lowStockAlertTemp = `...`; // as provided above
const expirySoonTemp = `...`;    // as provided above

// ===============================
// 🛑 Low Stock Alert Service
// ===============================

const lowStockAlert = async () => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ['$quantityInStock', '$minimumStockLevel'] }
    }).populate('medicineId hospital');

    // Group by hospital
    const groupedByHospital = {};
    for (const item of lowStockItems) {
      const hospitalId = item.hospital?._id;
      if (!groupedByHospital[hospitalId]) groupedByHospital[hospitalId] = [];
      groupedByHospital[hospitalId].push(item);
    }

    for (const [hospitalId, items] of Object.entries(groupedByHospital)) {
      const hospital = items[0].hospital;
      const adminEmail = hospital?.contact?.email || "fallback@example.com"; // fallback if no email
      
      const rows = lowStockItems.map(item => `
        <tr>
          <td style="border: 1px solid #ccc; padding: 10px; text-align: left;">${item.medicineId.name}</td>
          <td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${item.quantityInStock}</td>
          <td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${item.minimumStockLevel}</td>
        </tr>
      `).join('');
      
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>🚨 Low Stock Alert</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; padding: 30px;">
        <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.06);">
          <div style="background-color: #d9534f; padding: 20px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <h2 style="color: white; margin: 0;">🚨 Low Stock Alert</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px; color: #333;">The following medicines are <strong>below their minimum stock levels</strong> and need your attention:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Medicine Name</th>
                  <th style="border: 1px solid #ccc; padding: 10px; text-align: center;">Current Quantity</th>
                  <th style="border: 1px solid #ccc; padding: 10px; text-align: center;">Minimum Required</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <p style="margin-top: 25px; font-size: 14px; color: #555;">Consider restocking these items to maintain sufficient inventory levels.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      await sendEmail(adminEmail, `🚨 Low Stock Alert - ${hospital.name}`, html);

      await notificationModel.create({
        hospital: hospital._id,
        title: "Low Stock Alert",
        message: `Found ${items.length} low stock items. Check your email.`
      });

      console.log(`Sent alert to ${adminEmail} for ${hospital.name}`);
    }

  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};


// ===============================
// ⏳ Expiring Soon Alert Service
// ===============================

const expiringSoonAlert = async () => {
  try {
    const today = new Date();
    const nextTenDays = new Date();
    nextTenDays.setDate(today.getDate() + 10);

    const expiringItems = await Inventory.find({
      expiryDate: { $gte: today, $lte: nextTenDays }
    }).populate('medicineId hospital');

    const groupedByHospital = {};
    for (const item of expiringItems) {
      const hospitalId = item.hospital?._id;
      if (!groupedByHospital[hospitalId]) groupedByHospital[hospitalId] = [];
      groupedByHospital[hospitalId].push(item);
    }

    for (const [hospitalId, items] of Object.entries(groupedByHospital)) {
      const hospital = items[0].hospital;
      const adminEmail = hospital?.contact?.email || "fallback@example.com";
      
      const rows = expiringItems.map(item => `
        <tr>
          <td style="border: 1px solid #ccc; padding: 10px; text-align: left;">${item.medicineId.name}</td>
          <td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${item.expiryDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}</td>
          <td style="border: 1px solid #ccc; padding: 10px; text-align: center;">${item.quantityInStock}</td>
        </tr>
      `).join('');
      
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>⚠️ Expiring Medicines Alert</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
        <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); overflow: hidden;">
          <div style="background-color: #f0ad4e; padding: 20px; color: white;">
            <h2 style="margin: 0;">⚠️ Medicines Expiring Soon</h2>
          </div>
          <div style="padding: 20px;">
            <p style="font-size: 16px;">The following medicines in your inventory will expire within the next <strong>10 days</strong>:</p>
            <table style="border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 15px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Medicine Name</th>
                  <th style="border: 1px solid #ccc; padding: 10px; text-align: center;">Expiry Date</th>
                  <th style="border: 1px solid #ccc; padding: 10px; text-align: center;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <p style="margin-top: 30px; font-size: 14px; color: #555;">Please take appropriate action to manage or remove expiring stock.</p>
          </div>
        </div>
      </body>
      </html>
      `;

      await sendEmail(adminEmail, `⚠️ Expiring Soon - ${hospital.name}`, html);

      await notificationModel.create({
        hospital: hospital._id,
        title: "Expiring Soon Alert",
        message: `Found ${items.length} expiring items. Check your email.`
      });

      console.log(`Sent expiring alert to ${adminEmail} for ${hospital.name}`);
    }

  } catch (error) {
    console.error('Error fetching expiring items:', error);
    throw error;
  }
};
const runLowStockCheck = async () => {
  console.log(`[${new Date().toLocaleString()}] Running low stock check...`);
  try {
    const alerts = await lowStockAlert();
    
    console.log(alerts)
  } catch (err) {
    console.error('Error during low stock cron job:', err);
  }
};

const runExpiryCheck = async () => {
  console.log(`[${new Date().toLocaleString()}] Running expiry check...`);
  try {
    const alerts = await expiringSoonAlert();
    console.log(alerts)
  } catch (err) {
    console.error('Error during expiry cron job:', err);
  }
};



module.exports = {
  runLowStockCheck,
  runExpiryCheck
};
