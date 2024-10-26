import { IDataSource } from "../../models/DataSource";

export interface SchemaAnalyzer {
  fetchSchema(dataSource: IDataSource): Promise<any>;
}
