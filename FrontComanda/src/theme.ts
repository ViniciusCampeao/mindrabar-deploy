import { createTheme, responsiveFontSizes } from '@mui/material';
import { ptBR } from '@mui/material/locale';

// Definição de paleta de cores personalizada
const colors = {
  primary: {
    main: '#1E88E5',     // Azul mais moderno (substituindo o #1976d2)
    light: '#6AB7FF',    // Versão mais clara
    dark: '#005CB2',     // Versão mais escura
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#F50057',     // Rosa mais vibrante (substituindo #dc004e)
    light: '#FF5983',    // Versão mais clara
    dark: '#BB002F',     // Versão mais escura
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#43A047',     // Verde para status positivos
    light: '#76D275',
    dark: '#00701A',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#E53935',     // Vermelho para erros e alertas
    light: '#FF6F60',
    dark: '#AB000D',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FB8C00',     // Laranja para avisos
    light: '#FFBD45',
    dark: '#C25E00',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#039BE5',     // Azul informativo
    light: '#63CCFF',
    dark: '#006DB3',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  common: {
    black: '#000000',
    white: '#FFFFFF',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#9E9E9E',
  },
  background: {
    default: '#F8F9FA',  // Cinza muito claro para o fundo
    paper: '#FFFFFF',    // Branco para cards e componentes
  },
  divider: '#E0E0E0',
};

// Opções de estilo para bordas arredondadas
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Criando um tema personalizado com todas as nossas configurações
const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    text: colors.text,
    background: colors.background,
    common: colors.common,
    grey: colors.grey,
    divider: colors.divider,
  },
  shape: {
    borderRadius: borderRadius.sm, // Raio de borda padrão para componentes
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01071em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 500,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
  },
  components: {
    // Estilizações globais para botões
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          padding: '8px 16px',
          boxShadow: 'none',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
          },
        },
        containedSizeSmall: {
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        containedSizeLarge: {
          padding: '10px 22px',
          fontSize: '0.9375rem',
        },
      },
    },
    // Estilizações para Paper (cartões e superfícies)
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
        elevation1: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    // Estilizações para Card
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    // Estilizações para TextField
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.sm,
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary.light,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    // Estilizações para Diálogos
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.lg,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    // Estilizações para AppBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    // Estilizações para Lista
    MuiList: {
      styleOverrides: {
        root: {
          padding: '8px',
        },
      },
    },
    // Estilizações para itens de lista
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.xs,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    // Estilizações para Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(33, 33, 33, 0.9)',
          borderRadius: borderRadius.xs,
          padding: '6px 12px',
          fontSize: '0.75rem',
        },
        arrow: {
          color: 'rgba(33, 33, 33, 0.9)',
        },
      },
    },
    // Estilizações para Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    // Estilizações para Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
        standardSuccess: {
          backgroundColor: 'rgba(67, 160, 71, 0.12)',
          color: colors.success.dark,
        },
        standardError: {
          backgroundColor: 'rgba(229, 57, 53, 0.12)',
          color: colors.error.dark,
        },
        standardWarning: {
          backgroundColor: 'rgba(251, 140, 0, 0.12)',
          color: colors.warning.dark,
        },
        standardInfo: {
          backgroundColor: 'rgba(3, 155, 229, 0.12)',
          color: colors.info.dark,
        },
      },
    },
    // Estilizações para Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
}, ptBR); // Adiciona localização em português do Brasil

// Adiciona responsividade ao sistema de fontes
const responsiveTheme = responsiveFontSizes(theme);

export default responsiveTheme;