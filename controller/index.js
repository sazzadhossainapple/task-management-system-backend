const userController = require('./user.controller');
const taskController = require('./task.controller');

const controllers = {
    userController: userController,
    taskController: taskController,
};

module.exports = controllers;
