const sequelize = require(".");
const { DataTypes } = require('sequelize');
const ListSiswa = sequelize.define('ListSiswa', {
    nisn: {
        type: DataTypes.TEXT,
        primaryKey: true,
        allowNull: false,
    },
    nama: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    no_ortu: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    no_walas: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    kelas: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'list_siswa',
    timestamps: false, // Disable createdAt and updatedAt fields
});
module.exports = ListSiswa