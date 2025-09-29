const User = require('../model/user.model');
const fs = require('fs');
const path = require('path');

// get all users
const getAllUsersServices = async (filters, queries) => {
    const users = await User.find(filters)
        .select('-password') // exclude password
        .skip(queries.skip)
        .limit(queries.limit)
        .sort({
            createdAt: -1,
            updatedAt: -1,
        });
    const totalUserLists = await User.countDocuments(filters);
    const page = Math.ceil(totalUserLists / queries.limit);
    return { totalUserLists, page, users };
};

// create user
const createUserService = async (userInfo) => {
    const user = await User.create(userInfo);
    return user;
};

// user find
const findUserByEmail = async (email) => {
    return await User.findOne({ email: email });
};
// update user
const updateUserByEmail = async (email, data) => {
    return await User.updateOne(
        { email: email },
        { $set: data },
        {
            runValidators: true,
        }
    );
};

// delete by email
const deleteUserByIdService = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found.');
    }

    // Check if there is an image associated with the user
    if (user.image) {
        const imageFileName = path.basename(user.image);
        const imagePath = path.join(__dirname, '..', 'images', imageFileName);

        if (fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
                console.log('Image deleted successfully:', imagePath);
            } catch (err) {
                console.error('Failed to delete image:', err);
            }
        } else {
            console.warn('Image file not found:', imagePath);
        }
    }

    const result = await User.deleteOne({ email });
    return result;
};

module.exports = {
    getAllUsersServices,
    createUserService,
    findUserByEmail,
    updateUserByEmail,
    deleteUserByIdService,
};
