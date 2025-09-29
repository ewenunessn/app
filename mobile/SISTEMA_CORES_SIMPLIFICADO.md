# 🎨 Sistema de Cores Simplificado

## ✅ O que foi implementado:

### 📱 **Mobile App:**
- ✅ Hook `useAppColors` que busca cores do banco
- ✅ Aplicação dinâmica das cores no header e botões
- ✅ Fallback para cores padrão se API não estiver disponível
- ✅ Informações do app fixas no código (nome, ícone, descrição)

### 🌐 **API (Vercel):**
- ✅ Endpoint `/api/app-settings` retorna apenas cores
- ✅ Conectado ao banco Neon PostgreSQL
- ✅ Fallback para cores padrão se não houver dados

### 🗄️ **Banco de Dados:**
- ✅ Tabela `app_settings` com colunas `primary_color` e `secondary_color`
- ✅ Dados padrão inseridos automaticamente

## 🎯 **Como funciona:**

1. **App inicia** → Hook `useAppColors` faz fetch da API
2. **API consulta** → Banco Neon PostgreSQL
3. **Retorna cores** → `primary_color` e `secondary_color`
4. **App aplica** → Header usa `primary_color`, botões usam `secondary_color`
5. **Se falhar** → Usa cores padrão (`#4CAF50`, `#45a049`)

## 🔧 **Para alterar as cores:**

Execute diretamente no banco Neon:

```sql
UPDATE app_settings 
SET primary_color = '#FF5722',    -- Cor do header
    secondary_color = '#FF7043'   -- Cor dos botões
WHERE id = 1;
```

## 📊 **Status atual:**

- ✅ **API funcionando:** https://quiz-educativo-api.vercel.app/api/app-settings
- ✅ **Retorna:** `{"primary_color":"#FFD700","secondary_color":"#FFA500"}`
- ✅ **Mobile configurado** para usar essas cores
- ✅ **Sistema simplificado** sem telas de configuração

## 🎨 **Cores atuais:**
- **Primária:** `#FFD700` (Dourado)
- **Secundária:** `#FFA500` (Laranja)

---

💡 **Resultado:** Sistema limpo, focado no quiz, com cores personalizáveis via banco de dados!