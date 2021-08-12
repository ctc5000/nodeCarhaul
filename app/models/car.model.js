module.exports = (sequelize, Sequelize) => {
    const car = sequelize.define("cars", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
        volume: {
            type: Sequelize.FLOAT
        },
        userId: {
            type: Sequelize.INTEGER
        }
    });

    return car;
};