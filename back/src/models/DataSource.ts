import mongoose, { Schema, Document } from "mongoose";
import encrypt from "mongoose-encryption";
import { SemanticLayer } from "../services/semantic-layer-generator/semanticLayer";

// dataSourceType enum
export enum DataSourceType {
  POSTGRESQL = "postgresql",
  MONGODB = "mongodb",
  MYSQL = "mysql",
  SUPABASE = "supabase",
}

export enum SemanticModelLanguage {
  ENGLISH_US = "english-us",
  ENGLISH_UK = "english-uk",
  ENGLISH_AU = "english-au",
}

export interface IDataSource extends Document {
  name: string;
  type: DataSourceType;
  connectionString?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  googleSheetId?: string;
  fileName?: string;
  analysisInfo?: {
    schema?: any;
    semanticLayer?: SemanticLayer;
    dynamicInfo?: { [key: string]: any }; // Flexible field for dynamically adding analysis information
  };
  lastTimeAnalyzed?: Date;
  createdBy: mongoose.Types.ObjectId;
}

const DataSourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  connectionString: { type: String },
  username: { type: String },
  password: { type: String },
  apiKey: { type: String },
  googleSheetId: { type: String },
  fileName: { type: String },
  analysisInfo: {
    schema: { type: Schema.Types.Mixed },
    semanticLayer: { type: Schema.Types.Mixed },
    dynamicInfo: { type: Schema.Types.Mixed },
  },
  lastTimeAnalyzed: { type: Date },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const encryptionKey = process.env.DATA_SOURCE_ENCRYPTION_KEY!;

// Encrypt the sensitive fields
DataSourceSchema.plugin(encrypt, {
  secret: encryptionKey,
  encryptedFields: ["password", "apiKey", "connectionString"],
});

const DataSource = mongoose.model<IDataSource>("DataSource", DataSourceSchema);

export default DataSource;

/*
TODO: Revise the analysisInfo property. It is currently defined as any, but it should be a structured object that can be used to store schema information.
At the moment it's not clear what kind of information will be stored in analysisInfo, but it should be defined in a way that makes it easy to access and use the information.

Also, another option would be to allow different stages in the analysis process to store different types of information in analysisInfo and then the matching
query builder can use the information that is relevant to it. The problem with this approach is that it can make the analysisInfo object very complex and hard to manage.

The preferred approach is to at least categorize the information that will be stored in analysisInfo and define the structure of the object in a way that makes it easy to access and use the information.
Something organized and at the same time flexible enough to accommodate different algorithms and analysis types.


In the future it can be replaced with something like this:
analysisInfo?: {
    schema: any;
    semanticModel: {
      json: any;
      plainText: string;
    };
    fieldStatistics?: {
      [fieldName: string]: {
        min?: number;
        max?: number;
        mean?: number;
        median?: number;
        stdDev?: number;
        distinctValues?: any[];
        nullCount?: number;
        outliers?: any[];
      };
    };
    dataSample?: any[];
    featureImportance?: {
      [fieldName: string]: number;
    };
    dataTypes?: {
      [fieldName: string]: 'numerical' | 'categorical' | 'time-series' | 'text' | 'geospatial';
    };
    correlations?: {
      [fieldName: string]: {
        [otherFieldName: string]: number;
      };
    };
    foreignKeyRelationships?: {
      [tableName: string]: {
        relatedTable: string;
        relatedField: string;
      };
    };
    timeSeriesInfo?: {
      [fieldName: string]: {
        periodicity?: string;
        seasonalPatterns?: string[];
        trendPatterns?: string[];
      };
    };
    dataQualityMetrics?: {
      qualityScore: number;
      anomalies?: {
        [fieldName: string]: any[];
      };
      missingData?: {
        [fieldName: string]: number;
      };
    };
    targetVariable?: string;
    classDistribution?: {
      [className: string]: number;
    };
    historicalTrends?: {
      [fieldName: string]: {
        changesOverTime: any[];
        historicalStats?: any;
      };
    };

*/
