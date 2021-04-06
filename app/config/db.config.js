module.exports = {
  HOST: "161.35.227.135",
  USER: "admin_carhaul",
  PASSWORD: "admin1234",
  DB: "admin_mycarhaul",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};