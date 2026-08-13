declare module '@mui/material';
declare module '@mui/icons-material';
declare module 'react';
declare module 'react/jsx-runtime';

// Adicionando definições básicas para elementos JSX
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
    span: any;
    em: any;
    a: any;
  }
}

// Adicionar tipos do React para resolver os erros
declare namespace React {
  interface FormEvent<T = Element> {}
  interface ChangeEvent<T = Element> {
    target: {
      value: any;
    };
  }
  interface MouseEvent<T = Element> {}
}