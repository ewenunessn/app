# Acesso na Rede Local

## Configuração Concluída ✅

O aplicativo Quiz está agora configurado para ser acessado na rede local!

### Endereços de Acesso:

**Cliente (Interface Web):**
- http://192.168.18.12:3000
- Acessível de qualquer dispositivo na mesma rede

**Servidor (API):**
- http://192.168.18.12:5000
- Socket.io também configurado para rede local

### Como Acessar:

1. **No mesmo computador:**
   - Cliente: http://localhost:3000 ou http://192.168.18.12:3000
   - Servidor: http://localhost:5000 ou http://192.168.18.12:5000

2. **Em outros dispositivos (celular, tablet, outros computadores):**
   - Conecte-se à mesma rede Wi-Fi
   - Abra o navegador
   - Acesse: http://192.168.18.12:3000

### Testado e Funcionando:
- ✅ Servidor rodando na porta 5000 (todas as interfaces)
- ✅ Cliente React rodando na porta 3000 (todas as interfaces)
- ✅ CORS configurado para aceitar conexões da rede local
- ✅ Socket.io configurado para rede local
- ✅ Banco de dados PostgreSQL conectado

### Configurações Aplicadas:
- Servidor Express escutando em 0.0.0.0:5000
- Cliente React com HOST=0.0.0.0
- CORS liberado para IPs da rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- URLs centralizadas no arquivo config.js
- Todos os componentes atualizados para usar configuração centralizada

### Se precisar mudar de rede:
Se você mudar de rede (ex: casa para trabalho), o IP pode mudar. Para verificar o novo IP:
1. Abra o terminal
2. Execute: `ipconfig`
3. Procure pelo "Endereço IPv4" na sua conexão ativa
4. Atualize o arquivo `client/src/config.js` com o novo IP