const sequelize = require(".");
const { DataTypes } = require('sequelize');
const PesanWA = sequelize.define('PesanWA', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isi: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
}, {
    tableName: 'pesanwa',
    timestamps: false, // Disable createdAt and updatedAt fields
});
module.exports = PesanWA