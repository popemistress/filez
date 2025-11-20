declare module 'mammoth' {
  export interface ConvertToHtmlOptions {
    arrayBuffer?: ArrayBuffer;
    path?: string;
  }

  export interface ConvertResult {
    value: string;
    messages: Record<string, unknown>[];
  }

  export function convertToHtml(options: ConvertToHtmlOptions): Promise<ConvertResult>;
}
