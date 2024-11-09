import { CodeExecutor } from "./code-executor";

// IMPORTANT: This executor is not safe to use with untrusted code

export class JSLocalExecutor implements CodeExecutor {
  async execute(code: string, context: any = {}): Promise<any> {
    // Create a function with the provided code and run it
    const executeFunction = new Function(
      "context",
      `with (context) { ${code} }`
    );
    return executeFunction(context);
  }
}
