const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Trends = require("./trends.model.js")(sequelize, Sequelize);
db.aformattable = require("./aformattable.model.js")(sequelize, Sequelize);
db.Distance = require("./distace.model.js")(sequelize, Sequelize);
db.DictionaryRoutes = require("./dictionaryRoutes.model.js")(sequelize, Sequelize);
db.CitiesRoutes = require("./CitiesRoutes.model.js")(sequelize, Sequelize);
db.Users = require("./users.model.js")(sequelize, Sequelize);
db.userToRoute = require("./userToRoute.model.js")(sequelize, Sequelize);


/*связи*/
db.aformattable.belongsTo(db.Distance, {
  foreignKey: "distanceId",
  as: "Distances",
});

db.userToRoute.hasOne( db.Users, {
  as: 'User',
  sourceKey: 'userId',
  foreignKey: 'id',
});
// db.Users.hasMany( db.userToRoute, {
//   as: 'Route',
//   foreignKey: 'userId',
//   sourceKey: 'ID',
// });

module.exports = db;