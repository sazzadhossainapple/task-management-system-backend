const express = require('express');
const router = express.Router();

const userRoute = require('./user.route');

const routes = [{ path: '/user', handler: userRoute }];

routes.map((route) => router.use(route?.path, route?.handler));

const configureRoutes = (app) => app.use('/api', router);

module.exports = configureRoutes;
