const asyncWrapper = require('../middleware/asyncWrapper');
const {
    getAllTaskServices,
    createTaskServices,
    findByTaskIdServices,
    updateTaskByIdServices,
    deleteTaskByIdService,
} = require('../service/task.service');
const { GeneralError } = require('../utils/error');

/**
 * get all tasks
 *
 * URI: /api/task
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */
const index = asyncWrapper(async (req, res, next) => {
    let filters = {};

    // If user is not Admin, only show their own tasks
    if (req.user.role !== 'Admin') {
        filters.assignedUser = req?.user?._id;
    }

    // Status filter (Pending, In Progress, Completed)
    if (req.query.status) {
        filters.status = req.query.status;
    }

    // Due date filter (tasks due on a specific date)
    if (req.query.dueDate) {
        const dueDate = new Date(req.query.dueDate);
        // Match tasks where dueDate is the same day
        const nextDay = new Date(dueDate);
        nextDay.setDate(nextDay.getDate() + 1);

        filters.dueDate = {
            $gte: dueDate,
            $lt: nextDay,
        };
    }

    // Pagination
    const queries = {};
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    queries.skip = (page - 1) * limit;
    queries.limit = limit;

    // Get tasks
    const result = await getAllTaskServices(filters, queries);

    res.success(result, 'Tasks successfully retrieved');
});

/**
 * create task
 *
 * URI: /api/task
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const store = asyncWrapper(async (req, res, next) => {
    const { title, description, status, assignedUser, dueDate } = req.body;

    const result = await createTaskServices({
        title,
        description,
        status,
        assignedUser,
        dueDate,
    });

    res.success(result, 'Task create succssfully');
});

/**
 * get by task id
 *
 * URI: /api/task/:id
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const getById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const result = await findByTaskIdServices(id);
    res.success(result, 'Task successfully');
});

/**
 * update task
 *
 * URI: /api/task/:id
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */

const update = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { title, description, status, assignedUser, dueDate } = req.body;

    const updateData = {
        title,
        description,
        status,
        assignedUser,
        dueDate,
    };

    const result = await updateTaskByIdServices(id, updateData);

    res.success(result, 'Task updated successfully');
});

/**
 * delete by id
 *
 * URI: /api/task/:id
 *
 * @param {req} req
 * @param {res} res
 * @param {next} next
 * @returns
 */
const destroy = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const result = await deleteTaskByIdService(id);
    if (!result.deletedCount) {
        throw new GeneralError("Could't delete the task.");
    }

    res.success(result, 'Task delete successfully.');
});

module.exports = {
    index,
    store,
    destroy,
    update,
    getById,
};
