const fs = require('fs');
const axios = require('axios');
const cron = require('node-cron');
const { Sequelize, Op } = require('sequelize');
const PFisica = require('./models/PFisica');
const PJuridica = require('./models/PJuridica');
const conn = require('./config')
const token =  "RHq01NP8FCNCXCy704AyuDO6tfEZm72uzbDFqg9FVkjkh869rA4CZOBUJTU7B0ZB3Ty5iPMK1PECVojxrj0pN0UP4dOoQqBFRBD6M";

function modeloCriacao(fisOuJus, cliente) {
  // Verifica se é Pessoa Física
  if (fisOuJus) {
    return {
      cliente_documento: cliente.CPF,
      cliente_site: cliente.Email,
      cliente_observacao: cliente.OBS,
      cliente_ativo: cliente.StatusAtivo,
      cliente_id_integracao: cliente.ID_PFISICA,
      cliente_pessoa_fisica: {
        nome: cliente.Nome,
        data_nascimento: cliente.DataNasc,
        sexo: cliente.Sexo,
      },
      cliente_pessoa_juridica: {}, // Preencher vazio, já que não é uma PJ
      cliente_enderecos: [{
        endereco_padrao: true,
        endereco_cep: cliente.CEP,
        endereco_logradouro: cliente.Rua,
        endereco_numero: cliente.Num,
        endereco_complemento: cliente.Complemento,
        endereco_bairro: cliente.Bairro,
        endereco_cidade: cliente.Cidade,
        endereco_estado: cliente.UF,
      }],
      cliente_contatos: [{
        contato_padrao: true,
        contato_email: cliente.Email,
        contato_telefone: cliente.Celular,
        contato_celular: cliente.Celular,
      }],
    };
  }

  // Caso seja Pessoa Jurídica
  return {
    cliente_documento: cliente.CNPJ,
    cliente_site: cliente.HomePage,
    cliente_observacao: cliente.OBS,
    cliente_ativo: cliente.StatusAtivo,
    cliente_id_integracao: cliente.ID_PJURIDICA,
    cliente_pessoa_fisica: {}, // Preencher vazio, já que não é uma PF
    cliente_pessoa_juridica: {
      nome_fantasia: cliente.NomeFantasia,
      razao_social: cliente.RasSocial,
      inscricao_estadual: cliente.InscEstadual,
    },
    cliente_enderecos: [{
      endereco_padrao: true,
      endereco_cep: cliente.CEP,
      endereco_logradouro: cliente.Rua,
      endereco_numero: cliente.Num,
      endereco_complemento: cliente.Complemento,
      endereco_bairro: cliente.Bairro,
      endereco_cidade: cliente.Cidade,
      endereco_estado: cliente.UF,
    }],
    cliente_contatos: [{
      contato_padrao: true,
      contato_email: cliente.Email,
      contato_telefone: cliente.Tel01,
      contato_celular: cliente.Tel02,
    }],
  };
}



async function getUpdatedClients() {
  try {
    const clientesPF = await PFisica.findAll({
      where: {
        DataAlteracao: { [Op.gte]: conn.literal("DATEADD(DAY, -1, GETDATE())") }
      }
    });

    const clientesPJ = await PJuridica.findAll({
      where: {
        DataAlteracao: { [Op.gte]: conn.literal("DATEADD(DAY, -1, GETDATE())") }
      }
    });

    return { clientesPF, clientesPJ }; // Retorna os dois conjuntos de dados
  } catch (error) {
    console.error('Erro ao buscar clientes atualizados:', error);
    throw error;
  }
}


async function saveToFile(data) {
  const filePath = './clientes.json';
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Arquivo de clientes atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar o arquivo:', error);
  }
}

async function getMilvusClientId(document) {
  try {
    const response = await axios.get(`https://apiintegracao.milvus.com.br/api/cliente/busca`, {
      headers: {
        Authorization: `${token}`
      }
    });

    console.log('Resposta da Milvus:', response.data);

    if (response.data && Array.isArray(response.data.lista)) {
      const client = response.data.lista.find(client => client.cnpj_cpf === document);
      return client ? client.id : null;
    } else {
      console.error('Formato inesperado na resposta da Milvus:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar cliente na Milvus:', error.response ? error.response.data : error.message);
    return null;
  }
}

async function updateOrCreateClient(clientData) {
  try {
    const document = clientData.CNPJ || clientData.CPF; // Pode ser CNPJ ou CPF
    const clientId = await getMilvusClientId(document);
    const novosClientes = [];
    if (clientId) {
      // Cliente já existe na Milvus, então atualiza
      await updateClientInMilvus(clientId, clientData);
      console.log(`Cliente com ${document} atualizado na Milvus.`);
    } else {
      // Cliente não existe na Milvus, então adiciona à lista de novos clientes
      novosClientes.push(clientData);
      console.log(`Cliente com ${document} não encontrado na Milvus. Adicionando à lista.`);
    }


    // Se houver novos clientes, salva no arquivo novos_clientes.json
    if (novosClientes.length > 0) {
      fs.writeFileSync('novos_clientes.json', JSON.stringify(novosClientes, null, 2), 'utf-8');
      console.log('Arquivo novos_clientes.json criado com os clientes não cadastrados na Milvus.');
    }
  } catch (error) {
    console.error('Erro ao atualizar/criar cliente:', error.message);
  }
}

async function createClientInMilvus(clientData) {
  try {
    // Verifica o tipo de cliente: se é PJ ou PF com base no CNPJ ou CPF
    const fisOuJus = clientData.CNPJ ? false : true;  // Se tiver CNPJ, tipo é PJ, senão PF
    
    const payload = modeloCriacao(fisOuJus, clientData);
    console.log('Payload para criação de cliente:', payload);  // Para depuração

    const response = await axios.post('https://apiintegracao.milvus.com.br/api/cliente/criar', payload, {
      headers: {
        Authorization: `${token}`,
      },
    });

    console.log('Cliente criado na Milvus:', response.data);  // Verifique a resposta completa

    return response.data;

  } catch (error) {
    console.error('Erro ao criar cliente na Milvus:', error.response ? error.response.data : error.message);
  }
}

async function updateClientInMilvus(clientId, clientData) {
  try {
    const clientType = clientData.CNPJ ? 'PJ' : 'PF'; // Verifica se é PJ ou PF
    const payload = {
      nome_fantasia: clientData.NomeFantasia,
      razao_social: clientData.RasSocial,
      cnpj_cpf: clientData.CNPJ || clientData.CPF, // Dependendo do tipo
      tipo: clientType, // Define se é PJ ou PF
      // Outros dados...
    };

    const response = await axios.put(`https://apiintegracao.milvus.com.br/api/cliente/${clientId}/alterar`, payload, {
      headers: {
        Authorization: `${token}`,
      },
    });

    console.log('Cliente atualizado na Milvus:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar cliente na Milvus:', error.response ? error.response.data : error.message);
  }
}


async function main() {
  try {
    const { clientesPF, clientesPJ } = await getUpdatedClients();
    const allClients = [...clientesPF, ...clientesPJ];
    await saveToFile(allClients);

    for (let client of allClients) {
      await updateOrCreateClient(client);
    }
  } catch (error) {
    console.error('Erro ao executar a rotina:', error);
  }
}

var minuto = 59;
var hora = 23;
cron.schedule(`${minuto} ${hora} * * *`, () => {
  console.log('Executando rotina de atualização...');
  main().catch(console.error);
});

function formatToSqlDate(date) {
  if (!date) return null;

  const formattedDate = new Date(date);
  if (isNaN(formattedDate)) {
    throw new Error('Data inválida');
  }

  const year = formattedDate.getFullYear();
  const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
  const day = String(formattedDate.getDate()).padStart(2, '0');
  const hours = String(formattedDate.getHours()).padStart(2, '0');
  const minutes = String(formattedDate.getMinutes()).padStart(2, '0');

  // Formato YYYY-MM-DD HH:mm:00 (sem frações ou fuso horário)
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

console.log(`Sistema iniciado! A rotina será executada automaticamente às ${hora}:${minuto} todos os dias.`);

console.log('Executando rotina de atualização...');
