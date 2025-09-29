const asyncWrapper = require('../middleware/asyncWrapper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    getAllUsersServices,
    findUserByEmail,
    updateUserByEmail,
    deleteUserByIdService,
    createUserService,
} = require('../service/user.service');
const { generateToken } = require('../utils/token');
const { GeneralError, ValidationError } = require('../utils/error');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const uploadFile = require('../middleware/uploader');

/**
 * get all user
 *
 * URI: /api/user
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */
const index = asyncWrapper(async (req, res, next) => {
    let filters = { ...req.query };

    //  page, limit, -> exclude
    const excludeFields = ['page', 'limit'];
    excludeFields.forEach((field) => delete filters[field]);

    const queries = {};

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        queries.fields = fields;
    }

    /* Search on the  of page Select name */
    //  if (req.query.selectPage) {
    //     queries.selectPage = new RegExp(queries.selectPage, "i");
    //   }

    if (req.query.page) {
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * parseInt(limit);
        queries.skip = skip;
        queries.limit = parseInt(limit);
    }

    const users = await getAllUsersServices(filters, queries);
    res.success(users, 'Users successfully');
});

/**
 * create user
 *
 * URI: /api/user
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const store = asyncWrapper(async (req, res, next) => {
    await uploadFile(req, res);

    const { name, email, password, phone, role } = req.body;

    const oldUser = await findUserByEmail(email);

    if (oldUser) {
        throw new GeneralError('User Already Exists.');
    }
    const user = await createUserService({
        name,
        email,
        image: req.file ? `images/${req.file.filename}` : '',
        password,
        role,
        phone,
    });

    res.success(user, 'User create succssfully');
});

/**
 * update users
 *
 * URI: /api/user/:email
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const update = asyncWrapper(async (req, res, next) => {
    await uploadFile(req, res);
    const { email } = req.params;

    const { name, phone, address, status } = req.body;

    const updateData = { name, phone, address, status };

    if (req.file) {
        const image = `images/${req.file.filename}`;
        updateData.image = image;
    }

    const result = await updateUserByEmail(email, updateData);

    res.success(result, 'User update successfully');
});

/**
 * delete users
 *
 * URI: /api/user/:email
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */
const destroy = asyncWrapper(async (req, res, next) => {
    const { email } = req.params;
    const result = await deleteUserByIdService(email);
    if (!result.deletedCount) {
        throw new GeneralError("Could't delete the user");
    }

    res.success(result, 'User delete successfully.');
});

/**
 * get by user email
 *
 * URI: /api/user/:email
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const getByEmamil = asyncWrapper(async (req, res, next) => {
    const { email } = req.params;
    const user = await findUserByEmail(email);

    res.success(user, 'User successfully');
});

/**
 * user login
 *
 * URI: /api/user/login
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new GeneralError('Please provide your credentials');
    }

    const user = await findUserByEmail(email, '-password');

    if (!user) {
        throw new GeneralError('No user found. Please create an account');
    }

    // Check if the user's status is active
    if (user.status !== true) {
        throw new GeneralError('User account is not active.');
    }

    const isPasswordValid = user.comparePassword(password, user?.password);

    if (!isPasswordValid) {
        throw new GeneralError('Password is not correct');
    }

    // Convert Mongoose document to plain object
    const userData = user.toObject();

    // Remove password
    delete userData.password;

    const token = generateToken(userData);

    // Send response
    res.success({ userData, token }, 'Successfully logged in');
});

/**
 * get by current user
 *
 * URI: /api/user/me
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const getMe = asyncWrapper(async (req, res, next) => {
    const user = await findUserByEmail(req?.user?.email);
    const userData = user.toObject();

    // Remove password
    delete userData.password;

    res.success(userData, 'User successfully');
});

/**
 * Update User Password
 *
 * URI: /api/user/update-password
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */
const updatePassword = asyncWrapper(async (req, res, next) => {
    const { email } = req.user;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
        throw new ValidationError('Please fill all required data.');
    }

    if (new_password !== confirm_password) {
        throw new GeneralError(
            'Sorry! new password and confirm password not matched.'
        );
    }

    const user = await findUserByEmail(email);
    const { password } = user;

    if (await bcrypt.compare(current_password, password)) {
        const encryptedPassword = await bcrypt.hash(new_password, 10);
        await user.updateOne({ password: encryptedPassword });
        res.success('Password Updated Successfully!!');
    } else {
        res.success('Sorry!! Credentials not matched!!');
    }
});

/**
 * Reset User Password
 *
 * URI: /api/user/reset-password
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */
const resetPassword = asyncWrapper(async (req, res, next) => {
    const { new_password, confirm_password, email, token } = req.body;

    if (!new_password || !confirm_password) {
        throw new ValidationError('Please fill all required fields.');
    }

    if (new_password != confirm_password) {
        throw new GeneralError('Sorry! Password not matched.');
    }

    // Verify the token and check if it has expired
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (Date.now() / 1000 > decodedToken.exp) {
            throw new GeneralError('Sorry! Reset link has expired.');
        }
    } catch (error) {
        throw new GeneralError('Invalid or expired reset link.');
    }

    const user = await findUserByEmail(email);

    const encryptedPassword = await bcrypt.hash(new_password, 10);
    await user.updateOne({
        password: encryptedPassword,
        require_change_password: false,
    });

    res.success(null, 'Password reset Successfully!!');
});

/**
 * forget Password sent email
 *
 * URI: /api/user/forget-password
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const forgetPassword = asyncWrapper(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        throw new ValidationError('Please provide User Email');
    }

    const user = await findUserByEmail(email);

    if (!user) {
        throw new ValidationError('Sorry!! User not exists.');
    }

    const name = user?.name;

    const expirationTime = 5 * 60; // 5 minutes in seconds

    const token = jwt.sign(
        { email, exp: Math.floor(Date.now() / 1000) + expirationTime },
        process.env.JWT_SECRET
    );

    if (user?.email) {
        // Send email to the corresponding email containing reset password link
        sendEmail(email, name, token);
        res.success('Please check your email to get the reset link.');
    } else {
        throw new GeneralError(
            'Sorry! Something went wrong with password reset.'
        );
    }
});

/**
 * Method Accessibility: Protected
 * Send Email
 * @param {*} email
 * @param {*} name
 * @param {*} token
 */
const sendEmail = (email, name, token) => {
    const url = `${process.env.FRONTEND_URL}/reset-password?email=${email}&token=${token}`;

    if (email) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_ID,
                pass: process.env.APP_PASS,
            },
        });
        const mailData = {
            from: process.env.SENDER_EMAIL, // please provide a valid email
            to: email, // please provide a valid email
            subject: 'Reset Password',
            html: `
                <h3>Hello! ${name}</h3>
                <div>
                    <p>To reset your password, please click on the link:</p>
                    <p><a href=${url} target="_blank" style="color: #0000EE; text-decoration: underline;">Click Here to reset password link</a></p>
                </div>
            `,
        };

        transporter.sendMail(mailData, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log('Email sent successfully!!!');
            }
        });
    }
};

/**
 * Check whether logged in user is admin
 *
 * URI: /api/user/admin
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const checkIfAdmin = asyncWrapper(async (req, res) => {
    let { email } = req.user;

    const user = await findUserByEmail(email);

    if (user.role === 'Admin') res.success(true);
    else res.success(false);
});

/**
 * Check whether logged in user
 *
 * URI: /api/user/users
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const checkIfUser = asyncWrapper(async (req, res) => {
    let { email } = req.user;

    const user = await findUserByEmail(email);

    if (user?.role === 'User') res.success(true);
    else res.success(false);
});

module.exports = {
    index,
    store,
    destroy,
    update,
    getByEmamil,
    login,
    getMe,
    updatePassword,
    forgetPassword,
    resetPassword,
    checkIfAdmin,
    checkIfUser,
};
