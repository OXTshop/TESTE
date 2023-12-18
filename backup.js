const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const databasePath = 'produto.db'; // Substitua pelo caminho real do seu banco de dados
const backupFolder = 'backup'; // Substitua pelo caminho real da pasta de backup

function realizarBackup() {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const backupFileName = `backup_${timestamp}.db`;

  const sourcePath = path.join(__dirname, databasePath);
  const targetPath = path.join(__dirname, backupFolder, backupFileName);

  fs.copyFile(sourcePath, targetPath, (err) => {
    if (err) {
      console.error('Erro ao criar backup:', err);
    } else {
      console.log('Backup criado com sucesso:', targetPath);
    }
  });
}

// Agendar a criação de backups a cada 30 minutos
realizarBackup();
cron.schedule('*/120 * * * *', () => {
  console.log('Agendado: Realizando backup...');
  realizarBackup();
  console.log(realizarBackup(backupFileName))
});

console.log('Script de backup agendado. Aguardando criação de backups a cada 2 hora.');