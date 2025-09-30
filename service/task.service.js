const Task = require('../model/task.model');

// get all Task
const getAllTaskServices = async (filters, queries) => {
    const Tasks = await Task.find(filters)
        .skip(queries.skip)
        .limit(queries.limit)
        .sort({
            createdAt: -1,
            updatedAt: -1,
        })
        .populate('assignedUser', 'name email image phone address _id');
    const totalTaskLists = await Task.countDocuments(filters);
    const page = Math.ceil(totalTaskLists / queries.limit);
    return { totalTaskLists, page, Tasks };
};

// create Task
const createTaskServices = async (TaskInfo) => {
    return await Task.create(TaskInfo);
};

//  find Task
const findByTaskIdServices = async (id) => {
    return await Task.findOne({ _id: id }).populate(
        'assignedUser',
        'name email image phone address _id'
    );
};

// update  Task
const updateTaskByIdServices = async (id, data) => {
    return await Task.updateOne(
        { _id: id },
        { $set: data },
        {
            runValidators: true,
        }
    );
};

// delete by id
const deleteTaskByIdService = async (id) => {
    const result = await Task.deleteOne({ _id: id });
    return result;
};

module.exports = {
    getAllTaskServices,
    createTaskServices,
    findByTaskIdServices,
    updateTaskByIdServices,
    deleteTaskByIdService,
};
