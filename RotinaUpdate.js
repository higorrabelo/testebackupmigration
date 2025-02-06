const axios = require('axios');
const PFisica = require('./models/PFisica');
const PJuridica = require('./models/PJuridica')
const conn =require('./config')
const token = "RHq01NP8FCNCXCy704AyuDO6tfEZm72uzbDFqg9FVkjkh869rA4CZOBUJTU7B0ZB3Ty5iPMK1PECVojxrj0pN0UP4dOoQqBFRBD6M";
const { Sequelize, DataTypes, Op } = require('sequelize');

//fisOuJus true para pessoa fisica false para pessoa jurídica
function modeloCriacao(fisOuJus,cliente){
  var clientePFisica = `
  {
    "cliente_documento": ${cliente.CPF},
    "cliente_site": ${cliente.Email},
    "cliente_observacao": ${cliente.OBS},
    "cliente_ativo": ${cliente.StatusAtivo},
    "cliente_id_integracao": ${cliente.ID_PFISICA},  
    "cliente_pessoa_fisica": {
        "nome": "${cliente.Nome}",
        "data_nascimento": "${cliente.DataNasc}",
        "sexo": "${cliente.Sexo}"
    },
    "cliente_pessoa_juridica": {
        "nome_fantasia": "${cliente.Nome}",
        "razao_social": "",
        "inscricao_estadual": ""
    },
    "cliente_enderecos": [{
        "endereco_padrao": true,
        "endereco_descricao" : "",
        "endereco_cep" : "${cliente.CEP}",
        "endereco_logradouro" : "${cliente.Rua}",
        "endereco_numero" : "${cliente.Num}",
        "endereco_complemento": "${cliente.Complemento}",
        "endereco_bairro": "${cliente.Bairro}",
        "endereco_cidade": "${cliente.Cidade}",
        "endereco_estado": "${cliente.UF}"
    }],
    "cliente_contatos": [{
        "contato_padrao": true,
        "contato_descricao": "Teste",
        "contato_email": "${cliente.Email}",
        "contato_telefone": "${cliente.Celular}",
        "contato_celular": "${cliente.nome}",
        "contato_observacao": ""
    }]
}
  `;
  var clientePJuridica = `
{
     "cliente_documento": ${cliente.CNPJ},
     "cliente_site": "${cliente.HomePage}",
     "cliente_observacao": "${cliente.OBS}",
     "cliente_ativo": ${cliente.StatusAtivo},
     "cliente_id_integracao": "${cliente.ID_PJURIDICA}",  
     "cliente_pessoa_fisica": {
         "nome": "",
         "data_nascimento": "",
         "sexo": ""
     },
     "cliente_pessoa_juridica": {
         "nome_fantasia": "${cliente.NomeFantasia}",
         "razao_social": "${cliente.RasSocial}",
         "inscricao_estadual": "${cliente.InscEstadual}"
     },
     "cliente_enderecos": [{
         "endereco_padrao": true,
         "endereco_descricao" : "exemplo 1",
         "endereco_cep" : "${cliente.CEP}",
         "endereco_logradouro" : "${cliente.Rua}",
         "endereco_numero" : "${cliente.Num}",
         "endereco_complemento": "${cliente.Complemento}",
         "endereco_bairro": "${cliente.Bairro}",
         "endereco_cidade": "${cliente.Cidade}",
         "endereco_estado": "${cliente.UF}"
     }],
     "cliente_contatos": [{
         "contato_padrao": true,
         "contato_descricao": "Teste",
         "contato_email": "${cliente.Email}",
         "contato_telefone": "${cliente.Tel01}",
         "contato_celular": "${cliente.Tel02}",
         "contato_observacao": ""
     }]
}
`;
  if(fisOuJus){
    return clientePFisica;
  }else{
    return clientePJuridica;
  }
}

async function tratarCPFouCNPJ(input) {
  if(input){
    return input.replace(/\D/g, '');
  }else{
    return null;
  }
}

async function buscarClientePorDocumento(documento){
  try {
    const response = await axios.get(`https://apiintegracao.milvus.com.br/api/cliente/busca`, {
      params: { documento }, 
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    //console.log(response.data.lista.length)
    return response.data
  } catch (error) {
    console.error('Erro ao buscar cliente:', error.response?.data || error.message);
    return null;
  }
};

async function alterarCliente(id, pcliente, token){

  var docs = (pcliente.CPF ? pcliente.CPF : pcliente.CNPJ)?"":(pcliente.CPF ? pcliente.CPF : pcliente.CNPJ); 

  const clienteData = {
    "cliente_documento": `${docs}`,
    "cliente_site": `${pcliente.HomePage?pcliente.HomePage:""}`,
    "cliente_observacao": `${pcliente.OBS}`,
    "cliente_ativo": `${pcliente.StatusAtivo}`,
    "cliente_id_integracao": `${(pcliente.ID_PFISICA)?pcliente.ID_PFISICA:pcliente.ID_PJURIDICA}`,
    "cliente_pessoa_fisica": {
        "nome": "Jururu Açu",
        "data_nascimento": "2019-09-09",
        "sexo": "F"
    },

};

    try {
        const linkAltera = `https://apiintegracao.milvus.com.br/api/cliente/alterar/${id}`;
        
        const response = await axios.put(linkAltera, clienteData, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao alterar cliente:', error.response?.data || error.message);
        return null;
    }
};

var linkCriar = `https://apiintegracao.milvus.com.br/api/cliente/criar`;

async function getRecentRecords() {
  try {
      console.log('Buscando registros com DataAlteracao nas últimas 24 horas...');

      // Busca registros modificados nas últimas 24 horas
      const records = await PJuridica.findAll({
          where: {
            DataAlteracao: {
              [Op.gte]: conn.literal("DATEADD(DAY, -1, GETDATE())") // Último mês MONTH ou dia DAY
          }
          }
      });
      console.log(`Registros encontrados: ${records.length}`);
      return records.map(record => record.toJSON()); // Converte os resultados para objetos JS
  } catch (error) {
      console.error('Erro ao buscar registros:', error);
      return 0;
  }
}

const fs = require('fs');
var arquivojson = "./clientes.json";

getRecentRecords()
  .then(data => fs.writeFileSync(arquivojson, JSON.stringify({ clientes: data }, null, 2)))
  .then(()=>{
    const arquivo = require('./clientes.json');
  for(var i=0;i<arquivo.clientes.length;i++){
    var documento = (arquivo.clientes[i].CNPJ)? arquivo.clientes[i].CNPJ : arquivo.clientes[i].CPF
    var resp =tratarCPFouCNPJ(arquivo.clientes[i].CNPJ).then((rep)=>{
      console.log(rep)
      var rip =  buscarClientePorDocumento(rep);
    })
    
    
  }
  })
  .catch(err => console.error(err))

