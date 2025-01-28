const { DataTypes } = require('sequelize');
const sequelize = require('../config');
const DadosEmpresa = require('../models/DadosEmpresa')

const Usuario = sequelize.define('Usuario', {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    Logon: {
        type: DataTypes.STRING(40),
        allowNull: false
    },
    Senha: {
        type: DataTypes.STRING(40),
        allowNull: true
    },
    IDEmpresa: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    PRINCIPAL: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    Visivel: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    USUARIO: {
        type: DataTypes.STRING(40),
        allowNull: true
    }
}, {
    tableName: 'Usuário',
    timestamps: false
});

Usuario.belongsTo(DadosEmpresa, {
    foreignKey: 'IDEmpresa',
    targetKey: 'ID',
    as: 'empresa'  // Nome do alias, que pode ser usado para fazer as associações
});


module.exports = Usuario;
