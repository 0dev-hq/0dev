export interface CodeExecutor {
  execute(code: string, context?: any): Promise<any>;
}
