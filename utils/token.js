const jwt = require('jsonwebtoken');

exports.generateToken = (userInfo) => {
    const payload = {
        _id: userInfo._id.toString(),
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.image,
        role: userInfo.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    return token;
};
