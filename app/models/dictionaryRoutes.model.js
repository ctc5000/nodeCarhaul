module.exports = (sequelize, Sequelize) => {
    const dictionaryRoutes = sequelize.define("dictionaryRoutes", {
        id: {
            type: Sequelize.FLOAT,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        value: {
            type: Sequelize.STRING
        }
    });

    return dictionaryRoutes;
};