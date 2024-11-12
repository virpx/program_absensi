const Sequelize = require("sequelize");
const sequelize = new Sequelize(
 'absensi_siswa',
 'root',
 '',
  {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '+07:00'
  },
);
module.exports = sequelize