
const fs = require('fs');
const path = require('path');

// Função para processar o arquivo CSV
function processCsv(filePath, outputFilePath) {
    try {
        // Lê o arquivo como texto
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Divide o conteúdo em linhas
        const lines = fileContent.split(/\r?\n/);

        // Remove duplicatas usando um Set
        const uniqueLines = Array.from(new Set(lines));

        // Junta as linhas únicas em uma string
        const uniqueCsvContent = uniqueLines.join('\n');

        // Escreve o conteúdo processado em um novo arquivo
        fs.writeFileSync(outputFilePath, uniqueCsvContent, 'utf-8');
        console.log(`Arquivo processado com sucesso! Salvo em: ${outputFilePath}`);
    } catch (error) {
        console.error('Erro ao processar o arquivo:', error.message);
    }
}



module.exports = processCsv;