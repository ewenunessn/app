const { spawn } = require('child_process');
const open = require('open');

console.log('🚀 Iniciando Aplicativo Quiz Carol...');

// Função para iniciar um processo
function startProcess(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Iniciando ${name}...`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${name}] ${output.trim()}`);
      
      // Detectar quando o servidor está pronto
      if (name === 'Backend' && output.includes('Servidor rodando na porta 5000')) {
        console.log(`✅ ${name} pronto!`);
        resolve(process);
      }
      
      if (name === 'Frontend' && output.includes('Compiled successfully')) {
        console.log(`✅ ${name} pronto!`);
        console.log('🌐 Abrindo navegador...');
        open('http://localhost:3000');
        resolve(process);
      }
    });

    process.stderr.on('data', (data) => {
      console.error(`[${name} ERRO] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      console.log(`🔴 ${name} encerrado com código ${code}`);
    });

    process.on('error', (error) => {
      console.error(`❌ Erro ao iniciar ${name}:`, error);
      reject(error);
    });
  });
}

// Função principal
async function startApplication() {
  try {
    // Iniciar backend
    const backendProcess = await startProcess(
      'npm',
      ['run', 'dev'],
      'c:\\Users\\ewert\\OneDrive\\Área de Trabalho\\Aplicativo Carol\\server',
      'Backend'
    );

    // Aguardar um pouco antes de iniciar o frontend
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Iniciar frontend
    const frontendProcess = await startProcess(
      'npm',
      ['start'],
      'c:\\Users\\ewert\\OneDrive\\Área de Trabalho\\Aplicativo Carol\\client',
      'Frontend'
    );

    console.log('🎉 Aplicativo Quiz Carol iniciado com sucesso!');
    console.log('📱 Backend: http://localhost:5000');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('\n⚠️  Pressione Ctrl+C para encerrar ambos os servidores');

    // Capturar sinal de encerramento
    process.on('SIGINT', () => {
      console.log('\n🛑 Encerrando aplicação...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar aplicação:', error);
    process.exit(1);
  }
}

// Verificar se os diretórios existem
const fs = require('fs');
const serverPath = 'c:\\Users\\ewert\\OneDrive\\Área de Trabalho\\Aplicativo Carol\\server';
const clientPath = 'c:\\Users\\ewert\\OneDrive\\Área de Trabalho\\Aplicativo Carol\\client';

if (!fs.existsSync(serverPath) || !fs.existsSync(clientPath)) {
  console.error('❌ Erro: Certifique-se de que os diretórios server e client existem');
  process.exit(1);
}

// Iniciar aplicação
startApplication();