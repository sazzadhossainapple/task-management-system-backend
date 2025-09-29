const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'Name is required'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            trim: true,
        },

        email: {
            type: String,
            validate: [validator.isEmail, 'Provide a valid Email'],
            trim: true,
            unique: true,
            required: [true, 'Email address is required'],
        },
        image: {
            type: String,
            trim: true,
            default: null,
        },
        phone: {
            type: String,
            trim: true,
            default: null,
        },

        address: {
            type: String,
            trim: true,
            default: null,
        },

        role: {
            type: String,
            enum: ['User', 'Admin'],
            default: 'User',
            trim: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

//password encrpt
userSchema.pre('save', function (next) {
    if (!this.isModified('password')) {
        //  only run if password is modified, otherwise it will change every time we save the user!
        return next();
    }
    const password = this.password;

    const hashedPassword = bcrypt.hashSync(password);

    this.password = hashedPassword;
    this.confirmPassword = undefined;

    next();
});

// password campare
userSchema.methods.comparePassword = function (password, hash) {
    const isPasswordValid = bcrypt.compareSync(password, hash);
    return isPasswordValid;
};

// userSchema.methods.comparePassword = function (password, hash) {
//     const isPasswordValid = bcrypt.compareSync(password, hash);
//     return isPasswordValid;
// };

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
