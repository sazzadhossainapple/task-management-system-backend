const mongoose = require("mongoose");
const colors = require("colors");
const users = require("../data/user.json");
const User = require("../model/user.model");
const { connectDB } = require("../index");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const seedUser = async () => {
  try {
    await connectDB();

    // Delete all existing users
    await User.deleteMany();
    console.log("Data deleted successfully".red.bold);

    // Insert new users with hashed passwords
    for (let user of users) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await User.insertMany(users);
    console.log("User data saved successfully".green.bold);

    // Fetch all users to confirm insertion
    const allUsers = await User.find();
    console.log(allUsers);
  } catch (err) {
    console.error(err.message.red.bold);
  } finally {
    mongoose.connection.close();
  }
};

module.exports = seedUser;
