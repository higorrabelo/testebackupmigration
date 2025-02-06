require('dotenv').config()
const Sequelize = require('sequelize');
const db = process.env.BANCO;

//const conn = new Sequelize('SCNET60N', 'sa', 'scnet555', {
const conn = new Sequelize(process.env.BD, process.env.LOGIN, process.env.SENHA, {
    host: db,
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false, // Desativa SSL
            trustServerCertificate: true, // Confia no certificado do servidor (se necessário)
          }
    },
    define: {
        // Aqui você pode configurar opções globais para modelos, se necessário
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    
});
module.exports = conn;

