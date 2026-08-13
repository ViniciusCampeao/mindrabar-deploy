declare module 'qz-tray' {
  // Esta é uma declaração de façade que redireciona para nossa implementação Python
  // em vez do QZ Tray real
  
  import {
    websocket,
    printers,
    configs,
    print,
    connect,
    QZTrayConfig,
    QZTrayData
  } from '../services/printer';
  
  interface QZTrayWebsocket {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isActive(): boolean;
  }

  interface QZTrayPrinters {
    find(query?: string): Promise<string[]>;
    getDefault(): Promise<string>;
  }

  interface QZTrayConfigs {
    create(printer: string): QZTrayConfig;
  }
  
  export { 
    print, 
    connect, 
    websocket, 
    printers, 
    configs,
    QZTrayWebsocket,
    QZTrayPrinters,
    QZTrayConfigs,
    QZTrayConfig,
    QZTrayData 
  };
}