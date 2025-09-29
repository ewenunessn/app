# 🚀 Próximos Passos - Deploy Vercel

## ✅ Concluído:
- ✅ Banco Neon configurado
- ✅ Código no GitHub: https://github.com/ewenunessn/quiz-educativo-api.git
- ✅ Pronto para deploy no Vercel

## 🔄 Agora faça:

### 1. Deploy no Vercel
1. Acesse: https://vercel.com
2. Login com GitHub
3. Import project: `quiz-educativo-api`
4. Configure Environment Variables:
   ```
   DB_HOST = ep-snowy-mountain-ad927wxv-pooler.c-2.us-east-1.aws.neon.tech
   DB_PORT = 5432
   DB_NAME = neondb
   DB_USER = neondb_owner
   DB_PASSWORD = npg_9FW5gensNktY
   NODE_ENV = production
   ```
5. Deploy!

### 2. Testar API
Após deploy, teste:
- `GET /` - Info da API
- `GET /api/health` - Health check
- `GET /api/app-settings` - Configurações

### 3. Atualizar Mobile
Quando receber a URL do Vercel (ex: `https://quiz-educativo-api-abc123.vercel.app`), 
me informe para atualizar o arquivo `mobile/src/config.js`

## 🎯 Resultado Final:
- 🌐 API rodando no Vercel
- 🗄️ Banco PostgreSQL no Neon
- 📱 Mobile conectado à API na nuvem

---
💡 **Dica:** Salve a URL do Vercel para atualizar o mobile!