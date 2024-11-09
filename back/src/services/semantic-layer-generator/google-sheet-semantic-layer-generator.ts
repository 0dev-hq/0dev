import {
  SemanticLayer,
  Entity,
  EntityAttribute,
  Relationship,
} from "../../models/semantic-layer";
import {
  SemanticLayerGenerator,
  DataSourceSchema,
} from "./semantic-layer-generator";
import {
  GenerativeAIProvider,
  Prompt,
} from "../generative-ai-providers/generative-ai-provider";

export class GoogleSheetSemanticLayerGenerator extends SemanticLayerGenerator {
  constructor(aiProvider: GenerativeAIProvider) {
    super(aiProvider);
  }

  async generateSemanticLayer(
    schema: DataSourceSchema
  ): Promise<SemanticLayer> {
    const [entities, entityAttributes, relationships] = await Promise.all([
      this.generateEntities(schema),
      this.generateEntityAttributes(schema),
      this.detectRelationships(schema),
    ]);

    return {
      entities,
      relationships,
      measurements: [], // User-defined
      definitions: [], // User-defined
      synonyms: [], // User-defined
      entityAttributes,
    };
  }

  // Generate entities for all sheets in a single prompt
  private async generateEntities(schema: DataSourceSchema): Promise<Entity[]> {
    const sheetNames = Object.keys(schema);

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an AI that generates business-oriented names and descriptions for multiple sheets in a Google Spreadsheet.
        
        Notes about semanticName:
        - Names should be business-oriented but can stay similar to the sheet names if they are already meaningful.
        - For instance, if the sheet name is "report_data," the semantic name can simply be "Report Data."
        - Use business context when possible, but avoid over-complicating if the sheet name is already widely understood.
      
        Notes about description:
          - Provide a brief, meaningful description of each sheet's content.
        The JSON format of the response must be as follows:
        {
          "sheet1": {
            "semanticName": "Business Name 1",
            "description": "This sheet contains data about..."
          },
          "sheet2": {
            "semanticName": "Business Name 2",
            "description": "This sheet contains data about..."
          },
          ...
        }`,
      },
      {
        role: "user",
        content: `Generate names and descriptions for the following sheets: ${sheetNames.join(
          ", "
        )}.`,
      },
    ];

    try {
      const aiResponse: any = await this.aiProvider.generateResponse(
        prompt,
        "json"
      );

      const entities = sheetNames.map((sheetName) => ({
        name: aiResponse[sheetName]?.semanticName || sheetName,
        table: sheetName,
        description: aiResponse[sheetName]?.description || "",
        synonyms: [], // Optional user-defined synonyms
      }));

      return entities;
    } catch (error) {
      console.error("Error generating entity names and descriptions:", error);
      return sheetNames.map((sheetName) => ({
        name: sheetName,
        table: sheetName,
        description: "",
        synonyms: [],
      }));
    }
  }

  // Generate attributes for each sheet's headers and data types
  private async generateEntityAttributes(
    schema: DataSourceSchema
  ): Promise<EntityAttribute[]> {
    const entityAttributes: EntityAttribute[] = [];

    for (const [sheetName, fields] of Object.entries(schema)) {
      const fieldsArray = Object.entries(fields).map(([column, type]) => ({
        column,
        type: type as unknown as string,
      }));

      const fieldDescriptions = await this.generateAttributeDescriptions(
        sheetName,
        fieldsArray
      );

      entityAttributes.push({
        entity: sheetName,
        attributes: fieldsArray.map(({ column, type }) => ({
          name: column,
          type: this.mapToSemanticType(type),
          description: fieldDescriptions[column] || "",
        })),
      });
    }

    return entityAttributes;
  }

  // Generate attribute descriptions using AI for each sheet
  private async generateAttributeDescriptions(
    sheetName: string,
    fields: { column: string; type: string }[]
  ): Promise<Record<string, string>> {
    const fieldNames = fields.map((field) => field.column);
    const fieldTypes = fields.map((field) => field.type);

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an AI that generates concise descriptions for fields in a Google Sheet.`,
      },
      {
        role: "user",
        content: `Generate descriptions for fields in the sheet "${sheetName}" with the following names and types: ${fieldNames
          .map((name, i) => `"${name}" (${fieldTypes[i]})`)
          .join(", ")}.`,
      },
    ];

    try {
      const aiResponse = await this.aiProvider.generateResponse(prompt, "json");
      return aiResponse as Record<string, string>;
    } catch (error) {
      console.error(
        `Error generating descriptions for fields in sheet ${sheetName}:`,
        error
      );
      return fieldNames.reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: "" }),
        {}
      );
    }
  }

  // Detect relationships based on AI inference of fields across sheets
  private async detectRelationships(
    schema: DataSourceSchema
  ): Promise<Relationship[]> {
    const sheetsAndFields = Object.entries(schema).map(
      ([sheetName, fields]) => ({
        sheetName,
        fields: Object.keys(fields),
      })
    );

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an AI that identifies and describes relationships between sheets in a Google Spreadsheet.

        Relationship types:
        - one-to-one
        - one-to-many
        - many-to-one
        - many-to-many
        
        Notes about relationships:
        - Identify relationships based on field names that could indicate connections between sheets, such as fields ending in "_id" or other common field names.
        - Infer the most likely type of relationship based on the data context and field names.

        The JSON response format must be:
        {
          "relationship1": {
            "fromEntity": "Sheet A",
            "toEntity": "Sheet B",
            "type": "relationship type",
            "name": "Relationship description"
          },
          "relationship2": { ... }
        }`,
      },
      {
        role: "user",
        content: `Identify the relationships and types between the following sheets based on their fields: ${JSON.stringify(
          sheetsAndFields
        )}.`,
      },
    ];

    try {
      const aiResponse = await this.aiProvider.generateResponse(prompt, "json");
      return Object.values(aiResponse).map((rel: any) => ({
        fromEntity: rel.fromEntity,
        toEntity: rel.toEntity,
        type: rel.type as
          | "one-to-one"
          | "one-to-many"
          | "many-to-one"
          | "many-to-many",
        name: rel.name,
        attributes: rel.commonFields || [],
      }));
    } catch (error) {
      console.error("Error generating relationships:", error);
      return [];
    }
  }

  // Map Google Sheets inferred types to semantic layer types
  private mapToSemanticType(
    fieldType: string
  ): "identifier" | "number" | "currency" | "date" | "string" | "boolean" {
    switch (fieldType.toLowerCase()) {
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "date":
        return "date";
      default:
        return "string";
    }
  }
}
