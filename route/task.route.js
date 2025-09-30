const express = require('express');
const { taskController } = require('../controller');
const { auth } = require('../middleware');

const router = express.Router();

const { index, update, destroy, store, getById } = taskController;

// task application routes here...
router.route('/').get(auth, index).post(auth, store);
router.route('/:id').get(auth, getById).put(auth, update).delete(auth, destroy);

module.exports = router;
