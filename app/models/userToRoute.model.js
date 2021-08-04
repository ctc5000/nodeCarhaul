module.exports = (sequelize, Sequelize) => {
    const userToRoute = sequelize.define("userToRoute", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: Sequelize.INTEGER
            },
            routeName: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },


        }
    );
    return userToRoute;
};