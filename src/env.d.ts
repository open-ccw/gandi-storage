declare module 'virtual:arraybuffer:*' {
  const value: Uint8Array;
  export default value;
}

declare module '*.png' {
  const value: Uint8Array;
  export default value;
}

declare module '*.svg' {
  const value: Uint8Array;
  export default value;
}

declare module '*.wav' {
  const value: Uint8Array;
  export default value;
}

declare module '*.py' {
  const value: Uint8Array;
  export default value;
}

declare module '*.txt' {
  const value: Uint8Array;
  export default value;
}

declare module '*.glsl' {
  const value: Uint8Array;
  export default value;
}

declare module '*defaultJavascript.js' {
  const value: Uint8Array;
  export default value;
}

declare module '*?worker' {
  const workerFactory: new () => Worker;
  export default workerFactory;
}

declare module '*?worker&inline' {
  const workerFactory: new () => Worker;
  export default workerFactory;
}

declare module 'minilog' {
  export interface MinilogLogger {
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    info: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
  }
  function minilog(namespace: string): MinilogLogger;
  namespace minilog {
    function enable(): void;
    function disable(): void;
  }
  export default minilog;
}

declare module 'js-md5' {
  function md5(data: string | Uint8Array): string;
  export default md5;
}
