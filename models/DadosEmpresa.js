const { DataTypes } = require('sequelize');
const  sqlServerDb  = require('../config'); // Certifique-se de que sqlServerDb está configurado corretamente

const DadosEmpresa = sqlServerDb.define('Dados_Empresa', {
  ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  RasãoSocial: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  NomeFantasia: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  InscEstadual: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  InscMunicipal: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  CNPJ: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Rua: {
    type: DataTypes.STRING(75),
    allowNull: true,
  },
  Num: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  Complemento: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  Cep: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  Bairro: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  Cidade: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  UF: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  Telefone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  Fax: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  Email: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  HomePage: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  RamoAtividade: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  DOLAR: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true,
    defaultValue: 0.0,
  },
  ATIVO: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  DSC_SENHA_WS: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  COD_EXTERNO_SCWEB: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  IND_INTEGRAR_SCWEB: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  ID_Empresa_Central: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Dados_Empresa',
      key: 'ID',
    },
  },
  DSC_WS_ENDPOINT: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  CnaePrincipal: {
    type: DataTypes.STRING(25),
    allowNull: true,
  },
  LoginSerasa: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  SenhaSerasa: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  SenhaSerasaPefin: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'Dados_Empresa',
  timestamps: false,
});

module.exports = DadosEmpresa;
