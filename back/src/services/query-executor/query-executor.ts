import { IDataSource } from "../../models/data-source";

export type QueryExecutionResult = {
  data: any[];
  total: number;
};

export interface QueryExecutor {
  executeQuery(
    rawQuery: string,
    dataSource: IDataSource,
    page: number,
    pageSize: number
  ): Promise<QueryExecutionResult>;
}
