export interface DataSource {
  _id?: string;
  id?: string;
  dataHub?: string;
  name: string;
  type: string;
  lastTimeAnalyzed?: string;
  connectionString?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  googleSheetId?: string;
  createdBy?: string;
  analysisInfo?: {
    schema?: any;
    semanticLayer?: SemanticLayer;
    dynamicInfo?: { [key: string]: any };
  };
}

export type Entity = {
  _id?: string;
  name: string;
  table: string; // Mapping to schema table/collection
  description: string; // Business-oriented description of the collection
  synonyms?: string[];
};

export type Relationship = {
  _id?: string;
  fromEntity: string;
  toEntity: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
  name: string; // Name of the relationship, e.g., "places" or "contains"
  attributes?: string[]; // Any attributes specific to the relationship, e.g., "Order Date"
};

export type Measurement = {
  name: string;
  formula: string; // Formula, e.g., "SUM(Order Amount - Cost)"
  relatedEntities: string[]; // The entities this measurement is associated with, e.g., "Order"
  description?: string;
};

export type Definition = {
  name: string;
  description: string; // Description of the definition. e.g. Order Amount > 1000 for High Value Orders
};

export type SynonymMapping = {
  name: string;
  synonyms: string[]; // Synonyms for the name, e.g., "Order" => ["Purchase", "Transaction"]
};

export type Attribute = {
  _id?: string;
  name: string;
  type: "identifier" | "number" | "currency" | "date" | "string" | "boolean";
  aliases?: string[];
  description?: string;
};

export type EntityAttribute = {
  entity: string;
  attributes: Attribute[];
};

export type SemanticLayer = {
  entities: Entity[]; // Auto-generated, revisable
  relationships: Relationship[]; // Auto-generated, revisable
  measurements: Measurement[]; // User-defined
  definitions: Definition[]; // User-defined
  synonyms: SynonymMapping[]; // User-defined
  entityAttributes: EntityAttribute[]; // Auto-generated, revisable
};
