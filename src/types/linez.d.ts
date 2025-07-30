declare module 'linez' {
  interface LinezOptions {
    newlines: string[];
  }
  
  interface Line {
    text: string;
  }
  
  interface LinezInstance {
    lines: Line[];
  }
  
  function linez(text: string): LinezInstance;
  function configure(options: LinezOptions): void;
  
  const linezModule: typeof linez & { configure: typeof configure };
  export = linezModule;
  export { linez, configure };
} 