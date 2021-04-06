module.exports = (sequelize, Sequelize) => {
    const aformattable = sequelize.define("aformattable", {
            id: {
                type: Sequelize.FLOAT,
                primaryKey: true,
                autoIncrement: true
            },
            type: {
                type: Sequelize.STRING
            },
            name: {
                type: Sequelize.STRING
            },
            route: {
                type: Sequelize.STRING
            },
            datecreate: {
                type: Sequelize.DATE
            },
            low: {
                type: Sequelize.FLOAT
            },
            mid: {
                type: Sequelize.FLOAT
            },
            high: {
                type: Sequelize.FLOAT
            },
            mile: {
                type: Sequelize.FLOAT
            },
            volume: {
                type: Sequelize.FLOAT
            },
            distanceId: {
                type: Sequelize.FLOAT
            }
        }
    );
    return aformattable;
};