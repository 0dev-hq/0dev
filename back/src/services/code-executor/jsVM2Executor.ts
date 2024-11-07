import { VM } from "vm2";
import { CodeExecutor } from "./codeExecutor";

export class JSVM2Executor implements CodeExecutor {
  async execute(code: string, context: any = {}): Promise<any> {
    const vm = new VM({
      timeout: 1000, // Adjust as needed
      sandbox: { ...context },
    });
    return vm.run(`(async () => { ${code} })()`);
  }
}
