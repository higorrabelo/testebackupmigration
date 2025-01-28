const { DataTypes } = require('sequelize');
const  sqlServerDb  = require('../config'); // Certifique-se de que sqlServerDb está configurado corretamente

const PFisica = sqlServerDb.define('PFisica', {
  DataReg: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ID_PFISICA: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  Nome: {
    type: DataTypes.STRING(65),
    allowNull: false,
  },
  DataNasc: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  Sexo: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  EstCivil: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  Naturalidade: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  RG: {
    type: DataTypes.STRING(14),
    allowNull: true,
  },
  CPF: {
    type: DataTypes.STRING(14),
    allowNull: true,
  },
  NomePai: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  NomeMae: {
    type: DataTypes.STRING(65),
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
    type: DataTypes.STRING(12),
    allowNull: true,
  },
  Cidade: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  UF: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  FAX: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  TelResid: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Celular: {
    type: DataTypes.STRING(25),
    allowNull: true,
  },
  Email: {
    type: DataTypes.STRING(60),
    allowNull: true,
  },
  OndeTrabalha: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Admissão: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  Cargo: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  Salário: {
    type: DataTypes.DECIMAL(18, 4),
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
  RefPessoal01: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  RefPessoal02: {
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
  Conceito: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  Vendedor: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  NomeConjuge: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  NascConjuge: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  CPFCOnjuge: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  Revenda: {
    type: DataTypes.STRING(3),
    defaultValue: '1',
  },
  Crédito: {
    type: DataTypes.DECIMAL(18, 4),
    allowNull: true,
  },
  OBS: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  DataEmissao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  OrgaoEmissor: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  BloqueioAVista: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  BloqueioAPrazo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  Atividade: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  StatusAtivo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  IDEmpresa: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Dados_Empresa',
      key: 'ID',
    },
  },
  IDTransportadora: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    references: {
      model: 'Transportadora',
      key: 'IDTransportadora',
    },
  },
  // Outros campos podem ser mapeados aqui...
}, {
  tableName: 'PFisica',
  timestamps: false,
});

module.exports = PFisica;
