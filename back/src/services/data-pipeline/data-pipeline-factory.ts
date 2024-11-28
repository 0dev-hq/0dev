import { DataPipeline, DataPipelineType } from "./data-pipeline";
import { LocalDataPipeline } from "./local-data-pipeline";

export class DataPipelineFactory {
  static getDataPipeline(datPipelineType: DataPipelineType): DataPipeline {
    switch (datPipelineType) {
      case "local":
        return new LocalDataPipeline();
      default:
        throw new Error("Invalid data pipeline type");
    }
  }
}
