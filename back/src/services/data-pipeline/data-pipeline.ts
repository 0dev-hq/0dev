export enum DataPipelineType {
  local = "local",
}

export interface DataPipeline {
  // Ingests data from a file and returns the table name(s) created as a result
  ingestDataObject(filePath: string): Promise<string[]>;
}
