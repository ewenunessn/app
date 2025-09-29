# Quiz App - Versões Web e Mobile

Aplicativo de quiz multiplayer com suporte para web e dispositivos móveis via Expo Go.

## 🚀 Versões Disponíveis

### 📱 Versão Web (Client)
- **Localização**: `client/`
- **Tecnologia**: React.js
- **URL de desenvolvimento**: http://localhost:3000
- **Comandos**:
  ```bash
  cd client
  npm install
  npm start
  ```

### 📱 Versão Mobile (Expo Go)
- **Localização**: `mobile/`
- **Tecnologia**: React Native + Expo
- **URL de desenvolvimento**: http://localhost:8081 (web)
- **Comandos**:
  ```bash
  cd mobile
  npm install
  npm start
  ```

## 📋 Funcionalidades

### ✨ Funcionalidades Completas
- ✅ Criar salas de quiz
- ✅ Entrar em salas existentes
- ✅ Sistema de perguntas e respostas em tempo real
- ✅ Ranking com pontuação ao vivo
- ✅ Interface responsiva e moderna
- ✅ Suporte para múltiplos participantes
- ✅ Temporizador para respostas
- ✅ Estatísticas detalhadas

### 🎨 Telas do Aplicativo
1. **Tela Inicial** - Criar sala ou entrar em sala existente
2. **Criar Sala** - Configurar nova sala de quiz
3. **Entrar na Sala** - Acessar sala com código
4. **Quiz Room** - Responder perguntas em tempo real
5. **Ranking** - Ver classificação geral

## 🛠️ Tecnologias Utilizadas

### Backend (Server)
- Node.js + Express
- Socket.io para comunicação em tempo real
- MongoDB para banco de dados
- JWT para autenticação

### Frontend Web (Client)
- React.js
- Axios para requisições HTTP
- Socket.io-client para comunicação em tempo real
- CSS3 para estilização

### Mobile (Expo)
- React Native
- Expo SDK
- React Navigation
- Axios e Socket.io-client
- Linear Gradient

## 📱 Como usar o Expo Go

1. **Instale o app Expo Go** no seu celular:
   - iOS: [App Store](https://apps.apple.com/app/apple-store/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Inicie o servidor**:
   ```bash
   cd mobile
   npm start
   ```

3. **Escaneie o QR Code** que aparece no terminal ou acesse http://localhost:8081 no navegador

4. **Teste no celular** usando o app Expo Go ou no navegador web

## 🔧 Configuração

### Variáveis de Ambiente

#### Client Web (`.env`)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

#### Mobile (`src/config.js`)
```javascript
export const API_URL = 'http://localhost:5000';
export const SOCKET_URL = 'http://localhost:5000';
```

#### Server (`.env`)
```
MONGODB_URI=mongodb://localhost:27017/quizapp
JWT_SECRET=sua_chave_secreta
PORT=5000
```

## 🚀 Como Executar Tudo

### 1. Iniciar o Servidor
```bash
cd server
npm install
npm start
```

### 2. Iniciar Client Web
```bash
cd client
npm install
npm start
```

### 3. Iniciar Mobile
```bash
cd mobile
npm install
npm start
```

## 📊 Estrutura do Projeto

```
Aplicativo Carol/
├── server/          # Backend Node.js
├── client/          # Frontend Web React
├── mobile/          # Aplicativo Mobile Expo
│   ├── src/
│   │   ├── screens/     # Telas do app
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── navigation/  # Navegação entre telas
│   │   ├── services/    # API e Socket.io
│   │   └── config.js   # Configurações
│   └── App.tsx        # Arquivo principal
└── README.md
```

## 🎯 Próximos Passos

- [ ] Adicionar mais tipos de perguntas
- [ ] Implementar sistema de temas personalizados
- [ ] Adicionar sons e animações
- [ ] Exportar resultados em PDF
- [ ] Suporte para múltiplos idiomas

## 💡 Dicas

- Use o **Expo Go** para testar rapidamente no celular
- A versão web é ótima para testes e desenvolvimento
- Ambas versões se conectam ao mesmo servidor backend
- O Socket.io mantém tudo sincronizado em tempo real

## 🐛 Bugs Conhecidos

- Certifique-se de que o servidor esteja rodando antes de iniciar os clientes
- Verifique as configurações de CORS no servidor
- Para mobile, use o IP da sua máquina ao invés de localhost

---

**Desenvolvido com ❤️ para Carol**