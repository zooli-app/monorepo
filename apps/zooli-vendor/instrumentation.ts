export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const bad = typeof globalThis.localStorage === "undefined" || typeof globalThis.localStorage?.getItem !== "function";
    if (bad) {
      const s = new Map<string, string>();
      Object.defineProperty(globalThis, "localStorage", {
        value: { getItem:(k:string)=>s.get(k)??null, setItem:(k:string,v:string)=>s.set(k,String(v)), removeItem:(k:string)=>s.delete(k), clear:()=>s.clear(), key:(i:number)=>Array.from(s.keys())[i]??null, get length(){return s.size} },
        writable: true, configurable: true,
      });
      const ss = new Map<string, string>();
      Object.defineProperty(globalThis, "sessionStorage", {
        value: { getItem:(k:string)=>ss.get(k)??null, setItem:(k:string,v:string)=>ss.set(k,String(v)), removeItem:(k:string)=>ss.delete(k), clear:()=>ss.clear(), key:(i:number)=>Array.from(ss.keys())[i]??null, get length(){return ss.size} },
        writable: true, configurable: true,
      });
    }
  }
}
