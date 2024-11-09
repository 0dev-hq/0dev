import { IDataSource } from "../../models/data-source";

export interface SchemaAnalyzer {
  fetchSchema(dataSource: IDataSource): Promise<any>;
}
