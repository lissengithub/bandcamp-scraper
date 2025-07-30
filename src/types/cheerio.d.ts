declare module 'cheerio' {
  function load(html: string): any;
  const cheerio: { load: typeof load };
  export = cheerio;
  export { load };
} 