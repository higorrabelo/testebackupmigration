const db = require('./config');
require('dotenv').config()
const cliente = require('./models/cliente');
const PFisica = require('./models/PFisica');
const PJuridica = require('./models/PJuridica')
const axios = require('axios');
var token = 'RHq01NP8FCNCXCy704AyuDO6tfEZm72uzbDFqg9FVkjkh869rA4CZOBUJTU7B0ZB3Ty5iPMK1PECVojxrj0pN0UP4dOoQqBFRBD6M';
const options = { encoding: 'utf8', flag: 'a' };
const processCsv = require('./tratacsv')
const apiRetorno = `http://${process.env.GTS}/admin/pages/cliente/insere_altera.php?cpf_cnpj=`;

const fs = require("fs");

// Função para retornar valores padrão e limpar quebras de linha
const getValue = (value, fallback) => {
  const sanitizedValue = value ? value.replace(/[\r\n]/g, " ").trim() : ""; // Remove quebras de linha e espaços extras
  return sanitizedValue !== "" ? sanitizedValue : fallback;
};

// Função para validar e garantir que o estado (UF) tenha exatamente 2 caracteres
const getEstado = (uf) => {
  if (uf && uf.trim().length === 2) {
    return uf.trim(); // Retorna o valor original se for válido
  }
  console.warn(`UF inválido detectado: "${uf}". Substituindo por "XX".`);
  return "XX"; // Substitui valores inválidos
};

// Função para tratar NomeFantasia
const getNomeFantasia = (nomeFantasia, razaoSocial) => {
  if (nomeFantasia) {
    return nomeFantasia.trim(); // Usa NomeFantasia se disponível
  }
  console.warn(`NomeFantasia ausente. Usando RazaoSocial: "${razaoSocial}" ou "SEM NOME FANTASIA".`);
  return razaoSocial || "SEM NOME FANTASIA"; // Fallback para RazaoSocial
};

async function exportarUnidade(unidade, qt) {
  unidade += "EMP";
  let texto = "";

  try {
    const data = await PJuridica.findAll();
    console.log(`Total de registros encontrados: ${data.length}`);

    qt = typeof qt === "number" ? qt : data.length;

    const header = [
      "razao_social",
      "nome_fantasia",
      "cnpj_cpf",
      "cep",
      "endereco",
      "bairro",
      "numero",
      "complemento",
      "cidade",
      "estado",
      "inscricao_estadual",
      "telefone",
      "celular",
      "contato",
      "email",
      "observacao",
      "site",
      "grupo_categorias",
      "Timezone",
      "equipes",
    ];

    texto += header.join(";") + "\n";

    for (let i = 0; i < qt; i++) {
      const row = data[i]?.dataValues || {};

      // Logs para depuração
      console.log(`Processando registro ${i + 1}`);
      console.log(`RazaoSocial: ${row.RasSocial || "N/A"}`);
      console.log(`UF antes de validação: ${row.UF || "N/A"}`);
      console.log(`NomeFantasia: ${row.NomeFantasia || "N/A"}`);

      const linha = header.map((key) => {
        switch (key) {
          case "razao_social":
            return getValue(`${unidade} ${row.RasSocial || ""}`, "SEM RAZAO SOCIAL");
          case "nome_fantasia":
            return getNomeFantasia(row.NomeFantasia||"", row.RasSocial);
          case "cnpj_cpf":
            return getValue(tratarCPFouCNPJ(row.CNPJ), "sem cnpj");
          case "cep":
            return getValue(row.CEP||"", "00000-000");
          case "endereco":
            return getValue(row.Rua||"", "rua");
          case "bairro":
            return getValue(row.Bairro||"", "bairro");
          case "numero":
            return getValue(row.Num, "numero");
          case "complemento":
            return getValue(row.Complemento||"", "complemento");
          case "cidade":
            return getValue(row.Cidade||"", "cidade");
          case "estado":
            return getEstado(row.UF||""); // Chama a função para validar e corrigir UF
          case "inscricao_estadual":
            return getValue(row.InscEstadual||"", "sem inscrição");
          case "telefone":
            return getValue(row.Tel01||"", "sem tel");
          case "celular":
            return getValue(row.Tel02||"", "sem tel");
          case "contato":
            return getValue(row.Contato||"", "sem contato");
          case "email":
            return getValue(row.Email||"", "sem email");
          case "observacao":
            return getValue(`${apiRetorno}${retornaMascara(row.CNPJ)}` + row.OBS || `${apiRetorno}${retornaMascara(row.CNPJ)}`, `${apiRetorno}${retornaMascara(row.CNPJ)}`);
          case "site":
            return getValue(row.HomePage||"", "sem site");
          case "grupo_categorias":
            return "semgrupo";
          case "Timezone":
            return "semtimezone";
          case "equipes":
            return "semequipe";
          default:
            return "N/A"; // Valor padrão para campos desconhecidos
        }
      });

      texto += linha.join(";") + "\n";
    }

    const filePath = `./${unidade}.csv`;
    fs.writeFileSync(filePath, texto, { encoding: "utf8" });

    removeDuplicatesAndMerge(filePath, `./${unidade}(alterado).csv`);
    console.log("Arquivo concluído com sucesso!");
  } catch (err) {
    console.error("Erro ao exportar unidade:", err.message);
  }
}


db.authenticate().then(()=>{''
  console.log("BASE DE DADOS ENCONTRADA")
}).catch(err=>{
  console.log(err.message)
})

async function converteClientePfisca(pfisica){
  var cpf = pfisica.CPF;
  var cpfeditado =  cpf.replace(/[.\-]/g, '')
  const js = {
    
    "cliente_documento":cpfeditado,
    "cliente_site": "",
    "cliente_observacao": "",
    "cliente_ativo": true,
    "cliente_id_integracao": pfisica.ID_PFISICA,
    "cliente_pessoa_fisica": {
        "nome": pfisica.Nome,
        "data_nascimento": "",
        "sexo": pfisica.Sexo[0]
    },
    "cliente_enderecos": [{
        "endereco_padrao": true,
        "endereco_descricao" : "",
        "endereco_cep" : pfisica.CEP,
        "endereco_logradouro" : pfisica.Rua,
        "endereco_numero" : pfisica.num,
        "endereco_complemento": "",
        "endereco_bairro": pfisica.Bairro,
        "endereco_cidade": pfisica.Cidade,
        "endereco_estado": pfisica.UF
    }],
    "cliente_contatos": [{
        "contato_padrao": true,
        "contato_descricao": "Teste",
        "contato_email": pfisica.Email,
        "contato_telefone": pfisica.TelResid,
        "contato_celular": pfisica.Celular,
        "contato_observacao": ""
    }]
  }

  return await js

}
function limparTexto(texto) {
  if (texto == null) return " "; // Retorna uma string vazia se o valor for nulo ou indefinido
  return texto
    .replace(/[\r\n\u2028\u2029]+/g, ' ') // Substitui qualquer tipo de quebra de linha por um espaço
    .replace(/;+/g, '')                 // Remove um ou mais ponto-e-vírgulas consecutivos
    .trim();                            // Remove espaços em branco extras no início e no final
}
function busca(){
  axios.get('https://apiintegracao.milvus.com.br/api/cliente/busca', {
      headers: {
        'Authorization': `${token}`, // Adiciona o token no cabeçalho
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('Requisição bem-sucedida:', response.data );
      })
      .catch(error => {
        console.error('Erro ao fazer a requisição:', error.message);
      });
}
function teste(){
  PFisica.findAll().then(async function(data){

    for(var i = 0 ; i<10 ; i++)  {
      axios.post('https://apiintegracao.milvus.com.br/api/cliente/criar',await converteClientePfisca(data[i].dataValues), {
        headers: {
          'Authorization': `${token}`, // Adiciona o token no cabeçalho
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          console.log('Requisição bem-sucedida:', response.data );
        })
        .catch(error => {
          console.error('Erro ao fazer a requisição:', error.message);
        });
    }
  }
  )
  .catch(err=>err.message)
}
async function pessoaFisica(unidade, qt) {
  let texto = "";
  const header = [
    "razao_social",
    "nome_fantasia",
    "cnpj_cpf",
    "cep",
    "endereco",
    "bairro",
    "numero",
    "complemento",
    "cidade",
    "estado",
    "inscricao_estadual",
    "telefone",
    "celular",
    "contato",
    "email",
    "observacao",
    "site",
    "grupo_categorias",
  ];

  try {
    const data = await PFisica.findAll();
    console.log(`Total de registros encontrados: ${data.length}`);

    // Define a quantidade de registros a exportar
    qt = typeof qt === "number" ? qt : data.length;

    // Adiciona o cabeçalho ao texto
    texto += header.join(";") + "\n";

    // Processa cada registro
    for (let i = 0; i < qt; i++) {
      const row = data[i]?.dataValues || {};

      const linha = header.map((key) => {
        switch (key) {
          case "razao_social":
            return getValue(`${unidade} ${row.Nome || ""}`, "SEM RAZAO SOCIAL");
          case "nome_fantasia":
            return getValue(row.NomeFantasia || "", "SEM NOME FANTASIA");
          case "cnpj_cpf":
            return getValue(tratarCPFouCNPJ(row.CPF), "SEM CPF");
          case "cep":
            return getValue(row.CEP || "", "00000-000");
          case "endereco":
            return getValue(row.Rua || "", "SEM ENDERECO");
          case "bairro":
            return getValue(row.Bairro || "", "SEM BAIRRO");
          case "numero":
            return getValue(row.Num, "S/N");
          case "complemento":
            return getValue(row.Complemento || "", "SEM COMPLEMENTO");
          case "cidade":
            return getValue(row.Cidade || "", "SEM CIDADE");
          case "estado":
            return getValue(row.UF || "", "SEM ESTADO");
          case "inscricao_estadual":
            return "SEM INSCRICAO ESTADUAL";
          case "telefone":
            return getValue(row.Tel01 || "", "SEM TELEFONE");
          case "celular":
            return getValue(row.Tel02 || "", "SEM CELULAR");
          case "contato":
            return getValue(row.Contato || "", "SEM CONTATO");
          case "email":
            return getValue(row.Email || "", "SEM EMAIL");
          case "observacao":
            return limparTexto(`${apiRetorno}${retornaMascara(row.CPF)}` + row.OBS || `${apiRetorno}${retornaMascara(row.CPF)}`, `${apiRetorno}${retornaMascara(row.CPF)}` );
          case "site":
            return getValue(row.HomePage || "", "SEM SITE");
          case "grupo_categorias":
            return "SEM GRUPO";
          default:
            return "N/A";
        }
      });

      texto += linha.join(";") + "\n";
    }

    const filePath = `./${unidade}PFIsica.csv`;
    fs.writeFileSync(filePath, texto, { encoding: "utf8" });

    removeDuplicatesAndMerge(filePath, `./${unidade}PFIsica(alterado).csv`);
    console.log("Arquivo de pessoa física gerado com sucesso!");
  } catch (err) {
    console.error("Erro ao exportar pessoas físicas:", err.message);
  }
}

function tratarCPFouCNPJ(input) {
  if(input){
    return input.replace(/\D/g, '');
  }else{
    return null;
  }

}


function removeDuplicatesAndMerge(inputFile, outputFile) {
  // Ler o arquivo CSV de entrada
  const data = fs.readFileSync(inputFile, "utf8");

  // Dividir o conteúdo em linhas
  const lines = data.split("\n");

  // Pegar o cabeçalho e as linhas restantes
  const header = lines[0];
  const rows = lines.slice(1);

  // Objeto para rastrear CNPJs únicos e os dados combinados
  const uniqueData = {};

  rows.forEach((line) => {
    if (line.trim()) {
      const columns = line.split(";"); // Dividir a linha em colunas
      const cnpjCpf = (columns[2] || "").toLowerCase(); // Normalizar o CNPJ/CPF para minúsculas

      if (!uniqueData[cnpjCpf]) {
        // Se o CNPJ/CPF ainda não foi registrado, adiciona a linha inteira
        uniqueData[cnpjCpf] = columns.map((col) => (col || "").toUpperCase());
      } else {
        // Se já existe, mesclar os dados diferentes
        uniqueData[cnpjCpf] = uniqueData[cnpjCpf].map((value, index) => {
          const currentColumn = (columns[index] || "").toUpperCase(); // Normalizar a coluna atual para maiúsculas

          if (!value || value === "SEM" || value === "SEM TELEFONE") {
            return currentColumn; // Substituir valores faltantes
          }
          if (
            value !== currentColumn &&
            currentColumn &&
            currentColumn !== "SEM" &&
            currentColumn !== "SEM TELEFONE"
          ) {
            return `${value}, ${currentColumn}`; // Concatenar valores diferentes
          }
          return value; // Manter o valor existente
        });
      }
    }
  });

  // Construir o conteúdo do arquivo CSV com os dados únicos e mesclados
  const uniqueRows = [header];
  Object.values(uniqueData).forEach((row) => {
    uniqueRows.push(row.join(";"));
  });

  // Escrever o resultado no arquivo de saída
  fs.writeFileSync(outputFile, uniqueRows.join("\n"), "utf8");

  console.log(`Arquivo sem duplicatas salvo em: ${outputFile}`);
}

function retornaMascara(numero) {
  // Remover caracteres não numéricos
  const apenasNumeros = numero.replace(/\D/g, "");

  // Verificar se é CPF (11 dígitos) ou CNPJ (14 dígitos)
  if (apenasNumeros.length === 11) {
    // Máscara para CPF: xxx.xxx.xxx-xx
    return apenasNumeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4"
    );
  } else if (apenasNumeros.length === 14) {
    // Máscara para CNPJ: xx.xxx.xxx/xxxx-xx
    return apenasNumeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  } else {
    // Caso não seja nem CPF nem CNPJ, retornar como está
    return numero;
  }
}




//exportarUnidade(process.env.UNIDADE,"todos")
pessoaFisica("TSB","todos")
