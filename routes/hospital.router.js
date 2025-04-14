const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

// Create a new hospital
router.post('/', hospitalController.createHospital);

// Get all hospitals
router.get('/', hospitalController.getAllHospitals);

// Get a single hospital by ID
router.get('/:id', hospitalController.getHospitalById);

// Update a hospital by ID
router.patch('/:id', hospitalController.updateHospital);

// Delete a hospital by ID
router.delete('/:id', hospitalController.deleteHospital);

module.exports = router;
