declare module 'file-saver' {
    export function saveAs(data: Blob, filename: string, options?: any): void;
  }