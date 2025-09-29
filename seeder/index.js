const seedUser = require('./user');

const seed = async () => {
    await seedUser();
};

seed();
