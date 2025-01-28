const { DataTypes } = require('sequelize');
const  sqlServerDb  = require('../config');
const Dados_Empresa = require('./DadosEmpresa');
//const Transportadora = require('./Transportadora');
const PFisica = require('./PFisica');

const PJuridica = sqlServerDb.define('PJuridica', {
    DataReg: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ID_PJURIDICA: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    RasSocial: {
      type: DataTypes.STRING(65),
      allowNull: false,
      primaryKey: true,
    },
    CNPJ: {
      type: DataTypes.STRING(18),
      allowNull: false,
      primaryKey: true,
    },
    NomeFantasia: {
      type: DataTypes.STRING(65),
      allowNull: true,
    },
    InscEstadual: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    Contato: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Atividade: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    Vendedor: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    Rua: {
      type: DataTypes.STRING(65),
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
    Bairro: {
      type: DataTypes.STRING(65),
      allowNull: true,
    },
    CEP: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    Cidade: {
      type: DataTypes.STRING(65),
      allowNull: true,
    },
    UF: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    FAX: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Tel01: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Tel02: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    Email: {
      type: DataTypes.STRING(60),
      allowNull: true,
    },
    HomePage: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    Sócio01: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    CPFSócio01: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    RGSócio01: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    Sócio02: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    CPFSócio02: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    RGSócio02: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    Sócio03: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    CPFSócio03: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    RGSócio03: {
      type: DataTypes.STRING(14),
      allowNull: true,
    },
    RefComercial01: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    RefComercial02: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    RefBancária01: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    RefBancária02: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    Bloqueio: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    Situação: {
      type: DataTypes.STRING(18),
      allowNull: true,
    },
    Crédito: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
    },
    Conceito: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    OBS: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Revenda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    BloqueioAVista: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    BloqueioAPrazo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    StatusAtivo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    Usuario: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    Senha: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    IDTransportadora: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    IDEmpresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Adicionar outras colunas conforme necessário
  }, {
    tableName: 'PJuridica',
    timestamps: false,
  });

    PJuridica.belongsTo(Dados_Empresa, {
      foreignKey: 'IDEmpresa',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    //PJuridica.belongsTo(Transportadora, {
      //foreignKey: 'IDTransportadora',
    //});

//PFisica.sync({force:false})


module.exports = PJuridica;