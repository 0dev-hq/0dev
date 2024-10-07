export interface Query {
  _id?: string;
  name: string;
  dataSource: string;
  description: string;
  operation: "create" | "read" | "update" | "delete";
  createdBy?: string;
}

export interface QueryList {
  _id?: string;
  name: string;
  dataSource: {
    _id: string;
    name: string;
  };
  description: string;
  operation: "create" | "read" | "update" | "delete";
  createdBy?: string;
}
