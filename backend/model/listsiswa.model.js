const sequelize = require(".");
const { DataTypes } = require('sequelize');
const ListSiswa = sequelize.define('ListSiswa', {
    nisn: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    nama: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    no_ortu: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    no_walas: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    kelas: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'list_siswa',
    timestamps: false, // Disable createdAt and updatedAt fields
});
module.exports = ListSiswa