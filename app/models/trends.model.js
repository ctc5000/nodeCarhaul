module.exports = (sequelize, Sequelize) => {
    const trends = sequelize.define("trendsparams", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            intervaldate: {
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.STRING
            },
             namestate: {
                type: Sequelize.STRING
             },

        }
    );
    return trends;
};