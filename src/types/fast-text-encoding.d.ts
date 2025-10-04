declare module 'fast-text-encoding' {
  export class TextEncoder {
    constructor();
    encode(input?: string): Uint8Array;
  }

  export class TextDecoder {
    constructor(utfLabel?: string, options?: any);
    decode(input?: BufferSource, options?: any): string;
  }
}
