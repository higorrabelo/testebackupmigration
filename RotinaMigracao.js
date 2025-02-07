const db = require('./config');
require('dotenv').config()
const PFisica = require('./models/PFisica');
const PJuridica = require('./models/PJuridica')
const processCsv = require('./tratacsv')
const apiRetorno = `<a target="_blank" href="http://${process.env.GTS}/admin/pages/cliente/insere_altera.php?cpf_cnpj=`;

const fs = require("fs");
const { where } = require('sequelize');

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


db.authenticate().then(()=>{''
  console.log("BASE DE DADOS ENCONTRADA")
}).catch(err=>{
  console.log(err.message)
})

async function exportarUnidade(unidade, qt) {
  let texto = "";
  try {
    // Buscar dados com prioridade para IDEmpresa 2
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
    ];
    texto += header.join(";") + "\n";
    const uniqueData = {}; // Para garantir a unicidade do CNPJ
    // Processar dados, começando com a prioridade de IDEmpresa = 2
    for (let i = 0; i < qt; i++) {
      const row = data[i]?.dataValues || {};
      const cnpjCpf = tratarCPFouCNPJ(row.CNPJ); // Garantir que estamos trabalhando com um formato limpo de CNPJ
      // Adicionar registros de IDEmpresa 2 primeiro
      if (row.IDEmpresa === 2 && !uniqueData[cnpjCpf]) {
        uniqueData[cnpjCpf] = row;
      }
    }
    // Agora adicionar os registros de IDEmpresa 1 e 3 (caso não tenham sido adicionados antes)
    for (let i = 0; i < qt; i++) {
      const row = data[i]?.dataValues || {};
      const cnpjCpf = tratarCPFouCNPJ(row.CNPJ);
      if ((row.IDEmpresa === 1 || row.IDEmpresa === 3) && !uniqueData[cnpjCpf]) {
        uniqueData[cnpjCpf] = row; // Adiciona o cliente se não estiver na lista
      }
    }
    // Gerar o CSV a partir dos dados únicos
    Object.values(uniqueData).forEach((row) => {
      const linha = header.map((key) => {
        switch (key) {
          case "razao_social":
            return limparTexto(getValue(`${unidade} ${row.ID_PJURIDICA} ${row.RasSocial || ""}`, "SEM RAZAO SOCIAL"));
          case "nome_fantasia":
            return limparTexto(getNomeFantasia(row.NomeFantasia || row.RasSocial, row.RasSocial));
          case "cnpj_cpf":
            return limparTexto(getValue(tratarCPFouCNPJ(row.CNPJ, "")));
          case "cep":
            return limparTexto(getValue(row.CEP || "", ""));
          case "endereco":
            return limparTexto(getValue(row.Rua || "", ""));
          case "bairro":
            return limparTexto(getValue(row.Bairro || "", ""));
          case "numero":
            return limparTexto(getValue(row.Num, ""));
          case "complemento":
            return limparTexto(getValue(row.Complemento || "", ""));
          case "cidade":
            return limparTexto(getValue(row.Cidade || "", ""));
          case "estado":
            return limparTexto(getEstado(row.UF || "XX"));
          case "inscricao_estadual":
            return limparTexto(getValue(row.InscEstadual || "", ""));
          case "telefone":
            return limparTexto(getValue(row.Tel01 || "", ""));
          case "celular":
            return limparTexto(getValue(row.Tel02 || "", ""));
          case "contato":
            return limparTexto(getValue(row.Contato || "", ""));
          case "email":
            return limparTexto(getValue(row.Email || "", ""));
          case "observacao":
            return getValue(limparTexto(`${apiRetorno}${retornaMascara(row.CNPJ)}">GTS</a><br>` + row.OBS || ` ${apiRetorno}${retornaMascara(row.CNPJ)}">GTS</a><br>`, " "));
          case "site":
            return getValue(row.HomePage, " ");
          default:
            return "";
        }
      });
      texto += linha.join(";") + "\n";
    });
    const filePath = `./${unidade}.csv`;
    fs.writeFileSync(filePath, texto, { encoding: "utf8" });
    removeDuplicatesAndMerge(filePath, `./${unidade}(alterado).csv`);
    console.log("Arquivo concluído com sucesso!");
  } catch (err) {
    console.error("Erro ao exportar unidade:", err.message);
  }
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
  ];

  try {
    const data = await PFisica.findAll();
    console.log(`Total de registros encontrados: ${data.length}`);
    // Define a quantidade de registros a exportar
    qt = typeof qt === "number" ? qt : data.length;
    // Adiciona o cabeçalho ao texto
    texto += header.join(";") + "\n";

    const uniqueData = {}; // Para garantir a unicidade do CPF

    // Processa cada registro, começando com a prioridade de IDEmpresa = 2
    for (let i = 0; i < qt; i++) {
      const row = data[i]?.dataValues || {};
      const cpf = tratarCPFouCNPJ(row.CPF); // Garantir que estamos trabalhando com um formato limpo de CPF

      // Adicionar registros de IDEmpresa = 2 primeiro
      if (row.IDEmpresa === 2 && !uniqueData[cpf]) {
        uniqueData[cpf] = row;
      }
    }

    // Agora adicionar os registros de IDEmpresa = 1 e 3 (caso não tenham sido adicionados antes)
    for (let i = 0; i < qt; i++) {
      const row = data[i]?.dataValues || {};
      const cpf = tratarCPFouCNPJ(row.CPF);

      if ((row.IDEmpresa === 1 || row.IDEmpresa === 3) && !uniqueData[cpf]) {
        uniqueData[cpf] = row; // Adiciona o cliente se não estiver na lista
      }
    }

    // Gerar o CSV a partir dos dados únicos
    Object.values(uniqueData).forEach((row) => {
      const linha = header.map((key) => {
        switch (key) {
          case "razao_social":
            return limparTexto(getValue(`${unidade} ${row.ID_PFISICA} ${row.Nome || "SEM RAZAO SOCIAL"}`, "SEM RAZAO SOCIAL"));
          case "nome_fantasia":
            return limparTexto(getValue(row.NomeFantasia || "", row.Nome));
          case "cnpj_cpf":
            return limparTexto(getValue(tratarCPFouCNPJ(row.CPF), ""));
          case "cep":
            return limparTexto(getValue(row.CEP || "", ""));
          case "endereco":
            return limparTexto(getValue(row.Rua || "", ""));
          case "bairro":
            return limparTexto(getValue(row.Bairro || "", ""));
          case "numero":
            return limparTexto(getValue(row.Num, "S/N"));
          case "complemento":
            return limparTexto(getValue(row.Complemento || "", ""));
          case "cidade":
            return limparTexto(getValue(row.Cidade || "", ""));
          case "estado":
            return limparTexto(getValue(row.UF || "XX", "XX"));
          case "inscricao_estadual":
            return "";
          case "telefone":
            return limparTexto(getValue(row.Tel01 || "", ""));
          case "celular":
            return limparTexto(getValue(row.Tel02 || "", ""));
          case "contato":
            return limparTexto(getValue(row.Contato || "", ""));
          case "email":
            return limparTexto(getValue(row.Email || "", ""));
          case "observacao":
            return getValue(limparTexto(`${apiRetorno}${retornaMascara(row.CPF)}">GTS</a><br>` + row.OBS || ` ${apiRetorno}${retornaMascara(row.CPF)}">GTS</a><br>`," "));
          case "site":
            return getValue(row.HomePage, " ");
          default:
            return "";
        }
      });

      texto += linha.join(";") + "\n";
    });

    const filePath = `./${unidade}Fisica.csv`;
    fs.writeFileSync(filePath, texto, { encoding: "utf8" });

    removeDuplicatesAndMerge(filePath, `./${unidade}PFIsica(alterado).csv`);
    console.log("Arquivo de pessoa física gerado com sucesso!");
  } catch (err) {
    console.error("Erro ao exportar pessoas físicas:", err.message);
  }
}

function limparTexto(texto) {
  if (texto == null) return " "; // Retorna uma string vazia se o valor for nulo ou indefinido
  return texto
    .replace(/[\r\n\u2028\u2029]+/g, ' ') // Substitui qualquer tipo de quebra de linha por um espaço
    .replace(/;+/g, '')                 // Remove um ou mais ponto-e-vírgulas consecutivos
    .trim();                            // Remove espaços em branco extras no início e no final
}

function tratarCPFouCNPJ(input) {
  if(input){
    return input.replace(/\D/g, '');
  }else{
    return null;
  }
}

const estadosValidos = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", 
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

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
        // Corrigir a coluna de estado (índice 9) para ter apenas um estado válido de dois caracteres
        if (columns[9]) {
          const estados = columns[9].split(",").map((estado) => estado.trim().toUpperCase()); // Separar e limpar os estados
          // Filtrar estados válidos e garantir que tenha apenas um estado de dois caracteres
          const estadoValido = estados.find((estado) => estadosValidos.includes(estado)); // Pegando o primeiro estado válido
          columns[9] = estadoValido || "XX"; // Caso não tenha estado válido, coloca "XX"
        }
        if (!uniqueData[cnpjCpf]) {
          // Se o CNPJ/CPF ainda não foi registrado, adiciona a linha inteira
          uniqueData[cnpjCpf] = columns.map((col, index) => {
            if (index === 15 || index === 16) {
              return (col || "").toLowerCase(); // Colocar os índices 15 e 16 em letras minúsculas
            }
            return (col || "").toUpperCase(); // Todo o resto em letras maiúsculas
          });
        } else {
          // Se já existe, mesclar os dados diferentes
          uniqueData[cnpjCpf] = uniqueData[cnpjCpf].map((value, index) => {
            const currentColumn = (columns[index] || "").toUpperCase();

            if (!value || value === "SEM" || value === "SEM TELEFONE") {
              // Tratar os índices 15 e 16 separadamente para manter minúsculo
              return index === 15 || index === 16 
                ? (columns[index] || "").toLowerCase() 
                : currentColumn;
            }
            // Concatenar valores diferentes somente se forem realmente diferentes e não vazios
            if (value !== currentColumn && currentColumn && currentColumn !== "SEM" && currentColumn !== "SEM TELEFONE") {
              // Se a coluna de estado já tiver valor, não adicionar o mesmo estado novamente
              if (index === 9 && value.includes(currentColumn)) {
                return value; // Se o estado já existe, não adicionar novamente
              }
            }
            // Tratar os índices 15 e 16 para sempre estar em minúsculas
            return index === 15 || index === 16 
              ? value.toLowerCase() 
              : value;        
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

exportarUnidade(process.env.UNIDADE,"todos")
pessoaFisica(process.env.UNIDADE,"todos")
