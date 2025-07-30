declare module 'tinyreq' {
  function tinyreq(url: string, callback: (error: Error | null, html: string) => void): void;
  export = tinyreq;
  export default tinyreq;
} 