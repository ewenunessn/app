/**
 * Configuração centralizada do tema do aplicativo
 * Todas as cores, estilos e configurações visuais ficam aqui
 */

export const COLORS = {
  // Cores principais do app
  primary: '#033860',      // Azul escuro (substitui o amarelo)
  secondary: '#b2d2d1',    // Verde claro (background)
  
  // Cores de texto
  text: {
    primary: '#FFFFFF',    // Texto branco para contraste
    secondary: '#033860',  // Texto azul escuro
    light: '#666666',      // Texto cinza claro
    dark: '#333333',       // Texto escuro
  },
  
  // Cores de fundo
  background: {
    primary: '#b2d2d1',    // Background principal
    secondary: '#FFFFFF',  // Background secundário (cards)
    overlay: 'rgba(3, 56, 96, 0.1)', // Overlay transparente
  },
  
  // Cores de status
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Cores neutras
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    light: '#F5F5F5',
    medium: '#E0E0E0',
    dark: '#757575',
  },
  
  // Transparências
  transparent: 'transparent',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 50,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Estilos comuns reutilizáveis
export const COMMON_STYLES = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  
  card: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  
  buttonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  
  headerSubtitle: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.sizes.md,
    opacity: 0.9,
  },
};