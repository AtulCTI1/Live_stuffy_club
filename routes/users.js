const express = require('express');
const userController = require('../controller/userController');
const auth = require('../middleware/auth');
const upload_profile = require('../middleware/upload_profile');
// const upload_share_QR_code = require('../middleware/share_QR_code');
const router = express.Router();

router.post('/signUp', userController.signUp);

router.post('/login', userController.loginUser);

router.post('/verifyUser', userController.verifyUser);

router.get('/verifyUser/:id', userController.verifyUserEmail);

router.post('/forgotPassword', userController.forgotPassword);

router.get('/verifyPassword/:token', userController.verifyPassword);

router.post('/changePassword', userController.changePassword);

router.post('/myProfile', auth, userController.myProfile);

router.post('/delete_myProfile', auth, userController.delete_myProfile);

router.post('/editProfile', auth, upload_profile.single('file'), userController.editProfile);

router.post('/updateplan', userController.updateplan);

// router.post('/sharing', upload_share_QR_code.single('file'),userController.sharing);

module.exports = router;  
