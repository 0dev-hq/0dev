export interface Query {
  _id?: string;
  name: string;
  dataSource: string;
  description: string;
  operation: "create" | "read" | "update" | "delete";
  createdBy?: string;
}
