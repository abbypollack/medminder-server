const express = require('express');
const router = express.Router();
const drugInteractionController = require('../controllers/drugInteractionController');

router.post('/interactions', drugInteractionController.checkInteractions);

module.exports = router;
