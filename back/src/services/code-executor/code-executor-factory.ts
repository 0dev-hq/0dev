import { CodeExecutor } from "./code-executor";
import { JSLocalExecutor } from "./js-local-executor";
import { JSVM2Executor } from "./js-vm2-executor";

export class CodeExecutorFactory {
  static createExecutor(type: "js-local" | "js-vm2"): CodeExecutor {
    switch (type) {
      case "js-local":
        return new JSLocalExecutor();
      case "js-vm2":
        return new JSVM2Executor();
      default:
        throw new Error(`Unsupported executor type: ${type}`);
    }
  }
}
