const sequelize = require(".");
const { DataTypes } = require('sequelize');
const Absensi = sequelize.define('Absensi', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    nisn: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    tahunpelajaran: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    untuktanggal: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
}, {
    tableName: 'absensi',
    timestamps: false, // Disable createdAt and updatedAt fields
});
module.exports = Absensi