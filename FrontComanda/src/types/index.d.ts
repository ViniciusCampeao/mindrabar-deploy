// Declarações adicionais para resolver problemas com módulos e tipos do sistema
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.gif";

// Garantir que os pacotes que estão causando problemas tenham declarações básicas
declare module "qz-tray" {
  export const websocket: {
    connect: () => Promise<any>;
    isActive: () => boolean;
  };
  export const printers: {
    find: () => Promise<string[]>;
  };
  export const configs: {
    create: (printer: string) => any;
  };
  export const print: (config: any, data: any[]) => Promise<any>;
}

declare module "@mui/x-date-pickers" {
  export const DatePicker: any;
  export const TimePicker: any;
  export const DateTimePicker: any;
  export const LocalizationProvider: any;
}

declare module "@mui/x-internals" {
  export const useLicenseVerifier: any;
}

declare module "jspdf" {
  export default class jsPDF {
    constructor(options?: any);
    text(text: string, x: number, y: number, options?: any): any;
    addPage(): any;
    save(filename: string): any;
    // Adicione mais métodos conforme necessário
  }
}

// Typings para react-router-dom
declare module "react-router-dom" {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const Navigate: any;
  export const useNavigate: any;
  export const useParams: any;
  export const useLocation: any;
  export const Outlet: any;
}

// Definição para tipos de form
declare module "react-hook-form" {
  export const useForm: any;
  export const Controller: any;
}

// Definição para yup
declare module "yup" {
  export const object: any;
  export const string: any;
  export const number: any;
  export const array: any;
  export const boolean: any;
}

// Definição para resolvers
declare module "@hookform/resolvers/yup" {
  export const yupResolver: any;
}