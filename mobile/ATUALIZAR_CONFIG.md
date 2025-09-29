# 📱 Atualizar configuração do Mobile

Após o deploy no Vercel, você receberá uma URL como:
`https://quiz-educativo-api-abc123.vercel.app`

## Atualize o arquivo mobile/src/config.js:

```javascript
export const API_CONFIG = {
    // Substitua pela sua URL real do Vercel
    BASE_URL: 'https://sua-url-do-vercel.vercel.app',
    
    // Fallback para desenvolvimento
    FALLBACK_URL: 'http://192.168.1.100:5000'
};
```

## Exemplo:
```javascript
export const API_CONFIG = {
    BASE_URL: 'https://quiz-educativo-api-abc123.vercel.app',
    FALLBACK_URL: 'http://192.168.1.100:5000'
};
```

Depois disso, seu app mobile estará conectado à API na nuvem! 🚀