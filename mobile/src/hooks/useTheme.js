import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, COMMON_STYLES } from '../theme';

/**
 * Hook para acessar o tema do aplicativo
 * Retorna todas as configurações de estilo centralizadas
 */
export const useTheme = () => {
  return {
    colors: COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    commonStyles: COMMON_STYLES,
  };
};