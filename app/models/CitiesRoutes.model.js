module.exports = (sequelize, Sequelize) => {
    const CitiesRoutes = sequelize.define("CitiesRoutes", {
            id: {
                type: Sequelize.FLOAT,
                primaryKey: true,
                autoIncrement: true
            },
            FromCity: {
                type: Sequelize.STRING,
                allowNull:true
            },
            FromState: {
                type: Sequelize.STRING,
                allowNull:true
            },
            ToCity: {
                type: Sequelize.STRING,
                allowNull:true
            },
            ToState: {
                type: Sequelize.STRING,
                allowNull:true
            },
            Distance: {
                type: Sequelize.FLOAT,
                allowNull:true
            }
        }
    );
    return CitiesRoutes;
};