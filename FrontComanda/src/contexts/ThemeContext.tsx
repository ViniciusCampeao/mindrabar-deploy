import React, { createContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material';
import { ptBR } from '@mui/material/locale';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

/* eslint-disable react-refresh/only-export-components */
// @ts-expect-error - createContext com tipo genérico funciona corretamente
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState('light' as ThemeMode);

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(() => {
    const baseTheme = createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'light' ? '#1E88E5' : '#90CAF9',
          light: mode === 'light' ? '#6AB7FF' : '#B3E5FC',
          dark: mode === 'light' ? '#005CB2' : '#42A5F5',
        },
        secondary: {
          main: mode === 'light' ? '#F50057' : '#F48FB1',
          light: mode === 'light' ? '#FF5983' : '#F8BBD0',
          dark: mode === 'light' ? '#BB002F' : '#EC407A',
        },
        success: {
          main: mode === 'light' ? '#43A047' : '#81C784',
          light: mode === 'light' ? '#76D275' : '#A5D6A7',
          dark: mode === 'light' ? '#00701A' : '#66BB6A',
        },
        error: {
          main: mode === 'light' ? '#E53935' : '#E57373',
          light: mode === 'light' ? '#FF6F60' : '#EF9A9A',
          dark: mode === 'light' ? '#AB000D' : '#EF5350',
        },
        warning: {
          main: mode === 'light' ? '#FB8C00' : '#FFB74D',
          light: mode === 'light' ? '#FFBD45' : '#FFCC80',
          dark: mode === 'light' ? '#C25E00' : '#FFA726',
        },
        info: {
          main: mode === 'light' ? '#039BE5' : '#4FC3F7',
          light: mode === 'light' ? '#63CCFF' : '#81D4FA',
          dark: mode === 'light' ? '#006DB3' : '#29B6F6',
        },
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
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
        button: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              padding: '8px 16px',
              boxShadow: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              borderRadius: 12,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              overflow: 'hidden',
            },
          },
        },
      },
    }, ptBR);

    return responsiveFontSizes(baseTheme);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
