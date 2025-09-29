const express = require('express');
const { userController } = require('../controller');
const { auth } = require('../middleware');

const router = express.Router();

const {
    index,
    store,
    getByEmamil,
    destroy,
    update,
    login,
    getMe,
    updatePassword,
    forgetPassword,
    resetPassword,
    checkIfAdmin,
    checkIfUser,
} = userController;

// user application routes here...

router.route('/').get(index).post(auth, store);
router.route('/login').post(login);
router.route('/me').get(auth, getMe);
router.route('/users').get(auth, checkIfUser);
router.route('/admin').get(auth, checkIfAdmin);
router.route('/update-password').post(auth, updatePassword);
router.route('/forget-password').post(forgetPassword);
router.route('/reset-password').post(resetPassword);

router
    .route('/:email')
    .get(auth, getByEmamil)
    .put(auth, update)
    .delete(auth, destroy);

module.exports = router;
