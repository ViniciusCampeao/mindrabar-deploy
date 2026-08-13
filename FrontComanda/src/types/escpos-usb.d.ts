declare module 'escpos-usb' {
  import { Adapter } from 'escpos';
  
  interface DeviceDescriptor {
    idVendor: number;
    idProduct: number;
    iProduct?: string;
  }
  
  interface USBConfiguration {
    interfaces: USBInterface[];
  }
  
  interface USBInterface {
    alternates: USBAlternateInterface[];
  }
  
  interface USBAlternateInterface {
    interfaceClass: number;
  }
  
  interface USBDevice {
    deviceDescriptor: DeviceDescriptor;
    configurations: USBConfiguration[];
    vendorId?: number;
    productId?: number;
    productName?: string;
  }
  
  class USB implements Adapter {
    constructor();
    open(callback: () => void): void;
    close(callback?: () => void): void;
    write(data: Buffer): void;
    
    static findPrinters(): USBDevice[];
  }
  export default USB;
}