const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function fixEmailConstraint() {
  try {
    // Primeiro, verificar se existe a constraint UNIQUE
    const checkConstraint = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
      AND constraint_type = 'UNIQUE' 
      AND table_schema = 'public'
    `);

    if (checkConstraint.rows.length > 0) {
      // Remover a constraint UNIQUE existente
      await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key');
      console.log('✅ Constraint UNIQUE removida');
    }

    // Tornar a coluna email opcional (remover NOT NULL)
    await pool.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
    console.log('✅ Coluna email tornada opcional');

    // Adicionar constraint UNIQUE apenas se email não for nulo
    await pool.query('CREATE UNIQUE INDEX users_email_unique ON users(email) WHERE email IS NOT NULL');
    console.log('✅ Constraint UNIQUE parcial adicionada');

    console.log('🎉 Restrições do email ajustadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao ajustar restrições:', error.message);
  } finally {
    await pool.end();
  }
}

fixEmailConstraint();