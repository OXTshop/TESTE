const { spawn } = require('child_process');

// Função para imprimir a saída com uma cor específica
function printColoredOutput(data, colorCode) {
  console.log(`\x1b[${colorCode}m${data}\x1b[0m`);
}

// Defina códigos de cores ANSI
const greenColor = 34; // Verde
const blueColor = 32; // Azul

// Iniciar o script app.js
const appProcess = spawn('node', ['app.js']);

// Iniciar o script backup.js
const backupProcess = spawn('node', ['backup.js']);

appProcess.stdout.on('data', (data) => {
  printColoredOutput(`[app.js] Saída: ${data}`, greenColor);
});

backupProcess.stdout.on('data', (data) => {
  printColoredOutput(`[backup.js] Saída: ${data}`, blueColor);
});

backupProcess.on('close', (code) => {
    console.log(`\x1b[${blueColor}m[backup.js] Processo encerrado com código ${code}\x1b[0m`);
  });

appProcess.on('close', (code) => {
  console.log(`\x1b[${greenColor}m[app.js] Processo encerrado com código ${code}\x1b[0m`);
});

