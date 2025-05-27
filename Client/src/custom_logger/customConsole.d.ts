// customConsole.d.ts (Typdefinition)
interface Console {
  _log: typeof console.log;
  _warn: typeof console.warn;
  _error: typeof console.error;
}
