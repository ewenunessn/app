# 🎨 Sistema de Tema Centralizado

## ✅ Implementação Completa

### 📁 **Estrutura Criada:**

```
mobile/src/
├── theme/
│   └── index.js          # Configurações centralizadas do tema
├── hooks/
│   └── useTheme.js       # Hook para acessar o tema
└── config.js             # Configurações do app (API, etc.)
```

### 🎨 **Cores Aplicadas:**

- **Background Principal:** `#b2d2d1` (Verde claro)
- **Cor Primária:** `#033860` (Azul escuro - substitui o amarelo)
- **Texto:** Branco nos headers, azul escuro nos cards

### 🏗️ **Arquitetura:**

#### 1. **theme/index.js** - Configuração Central
```javascript
export const COLORS = {
  primary: '#033860',      // Azul escuro
  secondary: '#b2d2d1',    // Verde claro (background)
  // ... todas as outras cores
};

export const SPACING = { xs: 4, sm: 8, md: 16, ... };
export const TYPOGRAPHY = { sizes: {...}, weights: {...} };
export const COMMON_STYLES = { container: {...}, button: {...} };
```

#### 2. **hooks/useTheme.js** - Hook de Acesso
```javascript
export const useTheme = () => {
  return {
    colors: COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    // ... todos os recursos do tema
  };
};
```

#### 3. **Uso nas Telas**
```javascript
import { useTheme } from '../hooks/useTheme';

function MinhaScreen() {
  const { colors, commonStyles } = useTheme();
  
  return (
    <View style={[commonStyles.container]}>
      <View style={{ backgroundColor: colors.primary }}>
        {/* Conteúdo */}
      </View>
    </View>
  );
}
```

### 🔧 **Benefícios:**

1. **✅ Centralizado:** Todas as configurações em um lugar
2. **✅ Consistente:** Mesmas cores e estilos em todo o app
3. **✅ Manutenível:** Fácil de alterar cores globalmente
4. **✅ Tipado:** Estrutura organizada e previsível
5. **✅ Reutilizável:** Estilos comuns prontos para uso
6. **✅ Sem Gambiarras:** Código limpo e bem estruturado

### 📱 **Telas Atualizadas:**

- ✅ **QuizListScreen** - Header azul, background verde
- ✅ **UserRegistrationScreen** - Cores atualizadas
- 🔄 **Outras telas** - Em processo de atualização

### 🎯 **Como Alterar Cores:**

Para mudar qualquer cor do app, edite apenas o arquivo `theme/index.js`:

```javascript
export const COLORS = {
  primary: '#SUA_NOVA_COR_PRIMARIA',
  secondary: '#SUA_NOVA_COR_SECUNDARIA',
  // ...
};
```

### 📋 **Próximos Passos:**

1. Aplicar o tema nas telas restantes:
   - CreateQuizScreen
   - QuizPresentationScreen
   - QuizGameScreen
   - QuizExplanationScreen
   - QuizResultScreen

2. Remover lógica de busca de cores do servidor
3. Testar consistência visual em todas as telas

---

💡 **Resultado:** Sistema profissional, centralizado e fácil de manter!