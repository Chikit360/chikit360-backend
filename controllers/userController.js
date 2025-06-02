const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/response.formatter');
const tokenModel = require('../models/tokenModel');
const createAndStoreToken = require('../utility/generateToken');
const hospitalModel = require('../models/hospitalModel');

const userController = {};

// User login
userController.login = async (req, res) => {
  const { username, password } = req.body;
  console.log("login")
  try {
    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return sendResponse(res, {
        data: null,
        status: 404,
        message: 'User not found',
        error: true
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendResponse(res, {
        data: null,
        status: 400,
        message: 'Invalid password',
        error: true
      });
    }

    // Generate JWT token
    const token = req.headers["scanner"] !== "true" ? await createAndStoreToken(user._id, "access") : null;
    let hospitalDetail;
    if (user.hospital) {
      hospitalDetail = await hospitalModel.findById(user.hospital);
    }
    return sendResponse(res, {
      data: { ...user.toObject(), hospitalDetail: hospitalDetail && { _id: hospitalDetail._id, name: hospitalDetail.name, address: hospitalDetail.address }, token },
      status: 200,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return sendResponse(res, {
      data: null,
      status: 500,
      message: 'Internal server error',
      error: true
    });
  }
};

// Get current logged-in user info
userController.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendResponse(res, {
        data: null,
        status: 404,
        message: 'User not found',
        error: true
      });
    }
    let hospitalDetail;
    if (user.hospital) {
      hospitalDetail = await hospitalModel.findById(user.hospital);
    }
    return sendResponse(res, {
      data: { ...user.toObject(), hospitalDetail: hospitalDetail && { _id: hospitalDetail._id, name: hospitalDetail.name, address: hospitalDetail.address } },
      status: 200,
      message: 'User info retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return sendResponse(res, {
      data: null,
      status: 500,
      message: 'Internal server error',
      error: true
    });
  }
};

// Update user
userController.updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return sendResponse(res, {
        data: null,
        status: 404,
        message: 'User not found',
        error: true
      });
    }

    return sendResponse(res, {
      data: updatedUser,
      status: 200,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return sendResponse(res, {
      data: null,
      status: 500,
      message: 'Internal server error',
      error: true
    });
  }
};

// Delete user
userController.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return sendResponse(res, {
        data: null,
        status: 404,
        message: 'User not found',
        error: true
      });
    }

    return sendResponse(res, {
      data: null,
      status: 200,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return sendResponse(res, {
      data: null,
      status: 500,
      message: 'Internal server error',
      error: true
    });
  }
};

/**
 * Logs out the user by blacklisting their current JWT token.
 */
userController.logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
      return sendResponse(res, {
        status: 401,
        message: 'Token not provided',
        error: true
      });
    }
    const tokenDoc = await tokenModel.findOne({ token });
    if (!tokenDoc) {
      return sendResponse(res, {
        status: 400,
        message: 'Token not found or already invalidated',
        error: true
      });
    }

    // Blacklist the token instead of deleting it
    tokenDoc.blacklisted = true;
    await tokenDoc.save();

    return sendResponse(res, {
      status: 200,
      message: 'Logged out successfully',
      data: null
    });
  } catch (error) {
    console.error('Logout error:', error);
    return sendResponse(res, {
      status: 500,
      message: 'An error occurred while logging out',
      error: true
    });
  }
};

userController.createUser = async (req, res) => {
  try {
    console.log("here huhuhiu")
    const generateUsername = req.body.email.split("@")[0];
    const userData = { ...req.body, hospital: req.user.hospital, username: generateUsername }
    const user = await User.create(userData);
    if (!user) {
      return sendResponse(res, {
        data: null,
        status: 400,
        message: 'User creation failed',
        error: true
      });
    }

    return sendResponse(res, {
      status: 200,
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    console.error('user create error:', error);
    return sendResponse(res, {
      status: 500,
      message: 'An error occurred while creating user' + String(error),
      error: true
    });
  }
}
userController.allUsers = async (req, res) => {
  try {
    console.log(req.user._id)
    const users = await User.find({
      hospital: req.user.hospital,
      _id: { $ne: req.user._id }
    }).select('-password');


    return sendResponse(res, {
      status: 200,
      message: 'User fetch successfully',
      data: users
    });

  } catch (error) {
    console.error('user fetch error:', error);
    return sendResponse(res, {
      status: 500,
      message: 'An error occurred while logging out',
      error: true
    });
  }
}

userController.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return sendResponse(res, {
        data: null,
        status: 404,
        message: 'User not found',
        error: true
      });
    }

    return sendResponse(res, {
      data: user,
      status: 200,
      message: 'User found successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return sendResponse(res, {
      data: null,
      status: 500,
      message: 'Internal server error',
      error: true
    });
  }
};

module.exports = userController;
