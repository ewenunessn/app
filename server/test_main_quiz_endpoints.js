const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🧪 Testando endpoints do quiz principal...\n');

  try {
    // Teste 1: Listar todos os quizzes
    console.log('1. Testando GET /api/quiz');
    const quizzesResponse = await fetch(`${BASE_URL}/api/quiz`);
    const quizzes = await quizzesResponse.json();
    console.log(`   Status: ${quizzesResponse.status}`);
    console.log(`   Quizzes encontrados: ${quizzes.length}`);
    
    if (quizzes.length > 0) {
      const firstQuiz = quizzes[0];
      console.log(`   Primeiro quiz: ID ${firstQuiz.id} - "${firstQuiz.title}"`);
      
      // Teste 2: Buscar quiz principal atual
      console.log('\n2. Testando GET /api/main-quiz');
      const mainQuizResponse = await fetch(`${BASE_URL}/api/main-quiz`);
      const mainQuiz = await mainQuizResponse.json();
      console.log(`   Status: ${mainQuizResponse.status}`);
      console.log(`   Quiz principal: ${mainQuiz ? `ID ${mainQuiz.id} - "${mainQuiz.title}"` : 'Nenhum'}`);
      
      // Teste 3: Definir quiz principal
      console.log(`\n3. Testando PUT /api/quiz/${firstQuiz.id}/set-main`);
      const setMainResponse = await fetch(`${BASE_URL}/api/quiz/${firstQuiz.id}/set-main`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`   Status: ${setMainResponse.status}`);
      
      if (setMainResponse.ok) {
        const result = await setMainResponse.json();
        console.log(`   Resultado: ${result.message}`);
        
        // Teste 4: Verificar se foi definido corretamente
        console.log('\n4. Verificando se foi definido corretamente');
        const verifyResponse = await fetch(`${BASE_URL}/api/main-quiz`);
        const verifyQuiz = await verifyResponse.json();
        console.log(`   Quiz principal agora: ${verifyQuiz ? `ID ${verifyQuiz.id} - "${verifyQuiz.title}"` : 'Nenhum'}`);
        
        if (verifyQuiz && verifyQuiz.id === firstQuiz.id) {
          console.log('   ✅ Quiz principal definido com sucesso!');
        } else {
          console.log('   ❌ Erro: Quiz principal não foi definido corretamente');
        }
      } else {
        const errorText = await setMainResponse.text();
        console.log(`   ❌ Erro: ${errorText}`);
      }
    } else {
      console.log('   ❌ Nenhum quiz encontrado para testar');
    }
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

testEndpoints();