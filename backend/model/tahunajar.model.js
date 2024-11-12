const sequelize = require(".");
const { DataTypes } = require('sequelize');
const TahunAjar = sequelize.define('TahunAjar', {
    tahun: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    }
}, {
    tableName: 'tahunajar',
    timestamps: false, // Disable createdAt and updatedAt fields
});
module.exports = TahunAjar