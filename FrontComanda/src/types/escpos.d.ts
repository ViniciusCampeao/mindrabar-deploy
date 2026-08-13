/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'escpos' {
  export interface Adapter {
    write(data: Buffer): void;
    // Outros métodos necessários
  }

  export enum TXT_ALIGN {
    LEFT = 'LEFT',
    CENTER = 'CENTER',
    RIGHT = 'RIGHT'
  }

  export enum TXT_STYLE {
    NORMAL = 'NORMAL',
    BOLD = 'BOLD',
    ITALIC = 'ITALIC',
    UNDERLINE = 'UNDERLINE'
  }

  export class Printer {
    constructor(adapter: Adapter, options?: any);
    align(align: TXT_ALIGN | 'LEFT' | 'CENTER' | 'RIGHT'): this;
    style(style: TXT_STYLE | 'NORMAL' | 'BOLD' | 'ITALIC' | 'UNDERLINE'): this;
    size(width: 0 | 1 | 2, height: 0 | 1 | 2): this;
    text(text: string): this;
    cut(): this;
    close(): void;
  }
}