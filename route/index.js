const express = require('express');
const router = express.Router();

const userRoute = require('./user.route');
const taskRoute = require('./task.route');

const routes = [
    { path: '/user', handler: userRoute },
    { path: '/task', handler: taskRoute },
];

routes.map((route) => router.use(route?.path, route?.handler));

const configureRoutes = (app) => app.use('/api', router);

module.exports = configureRoutes;
