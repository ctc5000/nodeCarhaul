module.exports = (sequelize, Sequelize) => {
    const Users = sequelize.define("wp_users", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user_status: {
                type: Sequelize.INTEGER
            },
            user_login: {
                type: Sequelize.STRING
            },
            user_pass: {
                type: Sequelize.STRING
            },
            user_nicename: {
                type: Sequelize.STRING
            },
            user_email: {
                type: Sequelize.STRING
            },
            user_url: {
                type: Sequelize.STRING
            },
            display_name: {
                type: Sequelize.STRING
            },
            cars_count: {
                type: Sequelize.INTEGER
            },
            fuel_price: {
                type: Sequelize.DOUBLE
            },
            avg_fuel_cons: {
                type: Sequelize.DOUBLE
            },
            other_exp: {
                type: Sequelize.DOUBLE
            },
            ratio: {
                type: Sequelize.DOUBLE
            },

        }
    );
    return Users;
};