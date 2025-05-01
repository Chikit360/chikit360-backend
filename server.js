require('dotenv').config(); // Load environment variables from .env file
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const helmet = require('helmet');
const passportJWT = require('./config/passport-jwt');
const userRouter = require('./routes/user.router');
const medicineRouter = require('./routes/medicine.router');
const stockRouter = require('./routes/stock.router');
const inventoryRouter = require('./routes/inventory.router');
const customerRouter = require('./routes/customerRouter');
const dropDownRouter = require('./routes/dropDownRoute');
const dashboardRouter = require('./routes/dashboardRouter');
const notificationRouter = require('./routes/notificationRouter');
const hospitalRouter = require('./routes/hospital.router');
const notificationSettingdRouter = require('./routes/notificationSettingRouter');
const subscriptionRouter = require('./routes/subscriptionRouter');
const superAdminRouter = require('./routes/superAdminDashboardRouter');
const offerPlanRouter = require('./routes/offerPlanRouter');
const inquiryRouter = require('./routes/inquiryRouter');
const paymentRouter = require('./routes/paymentRouter');
const bulkUploadRouter = require('./routes/bulkUploadRouter');
const authMiddleware = require('./middlewares/authMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const { runLowStockCheck, runExpiryCheck } = require('./services/inventoryService');
const checkActiveSubscription = require('./middlewares/subscriptionMiddleware');

const app = express();

// Security with Helmet
app.use(helmet());

// Enable CORS
app.use(cors());

// Middleware for parsing JSON bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Enable File Uploads
app.use(fileUpload());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// cloudinary.config({ 
//   cloud_name: 'dibrrvvih', 
//   api_key: '956683266391358', 
//   api_secret: '1mjv3W8avGYXhggEnTNfNA_vuyc'
// });



// Schedule cron jobs
// Schedule both tasks
cron.schedule('0 6,12,20 * * *', () => {
  runLowStockCheck();
  runExpiryCheck();
});







// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport JWT
passportJWT(passport);

// Load environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Database connection
mongoose.connect(MONGO_URI,)
  .then(() => {
    console.log('MongoDB connected');
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log('MongoDB connection error:', err));

// Mount the user router on /users path
app.use('/users',  userRouter);

// Mount the medicine router on /medicines path
app.use('/medicines', authMiddleware.verifyToken,checkActiveSubscription, medicineRouter);


app.use('/sales', authMiddleware.verifyToken,checkActiveSubscription, stockRouter);

// app.use('/inventories', authMiddleware.verifyToken, inventoryRouter);
app.use('/inventories',authMiddleware.verifyToken,checkActiveSubscription, inventoryRouter);
app.use('/customers',authMiddleware.verifyToken,checkActiveSubscription, customerRouter);
app.use('/dropdowns',authMiddleware.verifyToken,checkActiveSubscription, dropDownRouter);
app.use('/notifications',authMiddleware.verifyToken,checkActiveSubscription, notificationRouter);
app.use('/notification-settings',authMiddleware.verifyToken, checkActiveSubscription,notificationSettingdRouter);
app.use('/subscription',authMiddleware.verifyToken,subscriptionRouter);

// admin
app.use('/dashboard',authMiddleware.verifyToken, dashboardRouter);


// super admin
app.use('/super-admin',authMiddleware.verifyToken, superAdminRouter);
app.use('/hospitals',authMiddleware.verifyToken, hospitalRouter);
app.use('/inquiries', inquiryRouter);

app.use('/payment', authMiddleware.verifyToken,paymentRouter);

// open api 
app.use('/offers-plan',offerPlanRouter);
app.use('/bulk-upload', bulkUploadRouter);

// Error handling middleware
app.use(errorMiddleware);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
