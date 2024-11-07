export type QueryExecutionResult = {
  data: any[];
  total: number;
};

export interface QueryExecutor {
  executeQuery(
    rawQuery: string,
    dataSource: any,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult>;
}
