const multer = require('multer');
const path = require('path');
const util = require('util');

const storage = multer.diskStorage({
    destination: 'images/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const uploadFile = multer({
    storage: storage,
    limits: {
        fileSize: 5000000, // 5MB limit
    },
}).single('file');

const uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;
