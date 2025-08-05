declare module 'tinyreq' {
  function tinyreq(url: string, callback: (error: Error | null, html: string) => void): void;
  function tinyreq(url: string): Promise<string>;
  export = tinyreq;
  export default tinyreq;
} 