// Arquivo temporário para corrigir problemas com tipos do React
declare namespace React {
  interface FormEvent<T = Element> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  interface ChangeEvent<T = Element> {
    target: EventTarget & T & {
      value: unknown;
      name?: string;
      type?: string;
      checked?: boolean;
    };
    currentTarget: EventTarget & T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  interface MouseEvent<T = Element> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  interface FC<P = Record<string, unknown>> {
    (props: P): JSX.Element | null;
  }
  
  interface CSSProperties {
    [key: string]: unknown;
  }

  // Tipos adicionais necessários
  type RefObject<T> = { readonly current: T | null };
  type MutableRefObject<T> = { current: T };
  type SetStateAction<S> = S | ((prevState: S) => S);
  type Dispatch<A> = (value: A) => void;
  type DependencyList = ReadonlyArray<unknown>;
  type EffectCallback = () => void | (() => void);
  type Context<T> = { Provider: unknown; Consumer: unknown; displayName?: string; _currentValue: T };
  
  // @ts-expect-error - Necessário para compatibilidade
  interface ComponentClass<P = Record<string, unknown>> {
    new(props: P): Component<P>;
  }
  
  // @ts-expect-error - Necessário para compatibilidade
  class Component<P = Record<string, unknown>, S = Record<string, unknown>> {
    props: P;
    state: S;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
  interface Element {
    type: string | React.FC | React.ComponentClass;
    props: Record<string, unknown>;
    key: string | number | null;
  }
}

declare namespace ReactDOM {
  function render(element: JSX.Element, container: Element): void;
}

declare module "react" {
  // useState com suporte a generics
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  export function useState<T = undefined>(): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];
  
  // useEffect com suporte a dependências
  export function useEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  
  // useContext com suporte a generics
  export function useContext<T>(context: React.Context<T>): T;
  
  // createContext com suporte a generics
  export function createContext<T>(defaultValue: T): React.Context<T>;
  
  // useCallback com suporte a generics
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T;
  
  // useMemo com suporte a generics
  export function useMemo<T>(factory: () => T, deps: React.DependencyList): T;
  
  // useRef com suporte a generics
  export function useRef<T>(initialValue: T): React.RefObject<T>;
  export function useRef<T>(initialValue: T | null): React.MutableRefObject<T | null>;
  export function useRef<T = undefined>(): React.MutableRefObject<T | undefined>;
  
  export type ReactNode = React.ReactNode;
  export type ReactElement = React.ReactElement;
  export type FC<P = Record<string, unknown>> = React.FC<P>;
}

declare module "react-dom" {
  export const render: typeof ReactDOM.render;
}

declare module "@mui/material" {
  export type SxProps = Record<string, unknown>;
  export type Theme = Record<string, unknown>;
}

declare module "@mui/material/styles" {
  export interface Theme {
    [key: string]: any;
  }
}