module.exports = (sequelize, Sequelize) => {
    const distance = sequelize.define("distance", {
        id: {
            type: Sequelize.FLOAT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        route: {
            type: Sequelize.STRING
        },
        distance: {
            type: Sequelize.FLOAT
        }
    });

    return distance;
};