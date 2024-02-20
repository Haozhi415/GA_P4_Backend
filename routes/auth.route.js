var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth.controller.js');

router.post('/signup', authController.signup);

router.post('/signin', authController.signin);

router.get('/signout', authController.signout);

module.exports = router;