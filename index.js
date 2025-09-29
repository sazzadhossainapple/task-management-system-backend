const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const colors = require('colors');
const app = require('./app');
const { setIO } = require('./utils/io');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
setIO(server);

// Database connection
const connectDB = async () => {
    try {
        await mongoose
            .connect(process.env.DATABASE_LOCAL)
            .then(() => console.log(`Database connected`.red.bold))
            .catch((err) => console.log(err));
    } catch (error) {
        console.log(error);
    }
};

// Start the server
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`App is running on port ${PORT}`.yellow.bold);
    });
});

module.exports = { connectDB };
