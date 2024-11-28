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

export class PostgreSQLSemanticLayerGenerator extends SemanticLayerGenerator {
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

  private async generateEntities(schema: DataSourceSchema): Promise<Entity[]> {
    const tableNames = Object.keys(schema);

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an API that generates semantic names and concise descriptions for PostgreSQL tables in JSON format.
        
        Notes about semanticName:
          - Names should be business-oriented but can stay similar to the table names if they are already meaningful.
          - For instance, if the table name is "user_data," the semantic name can be "User Data."
        
        Notes about description:
          - Provide a brief, meaningful description of each table.
        
        The JSON format of the response must be as follows: 
        {
          "table1": {
            "semanticName": "Business Name 1",
            "description": "This table contains data about..."
          },
          ...
        }`,
      },
      {
        role: "user",
        content: `Generate semantic names and descriptions for the following tables: ${tableNames.join(
          ", "
        )}.`,
      },
    ];

    try {
      const aiResponse = await this.aiProvider.generateResponse(prompt, "json");
      const entityData = aiResponse as Record<
        string,
        { semanticName: string; description: string }
      >;

      return tableNames.map((tableName) => ({
        name: entityData[tableName]?.semanticName || tableName,
        table: tableName,
        description: entityData[tableName]?.description || "",
        synonyms: [],
      }));
    } catch (error) {
      return tableNames.map((tableName) => ({
        name: tableName,
        table: tableName,
        description: "",
        synonyms: [],
      }));
    }
  }

  private async generateEntityAttributes(
    schema: DataSourceSchema
  ): Promise<EntityAttribute[]> {
    const entityAttributes: EntityAttribute[] = [];

    for (const [tableName, fields] of Object.entries(schema)) {
      const fieldDescriptions = await this.generateAttributeDescriptions(
        tableName,
        fields
      );

      entityAttributes.push({
        entity: tableName,
        attributes: fields.map(({ column, type }) => ({
          name: column,
          type: this.mapPostgreSQLTypeToSemanticType(type),
          description: fieldDescriptions[column] || "",
        })),
      });
    }

    return entityAttributes;
  }

  private async generateAttributeDescriptions(
    tableName: string,
    fields: { column: string; type: string }[]
  ): Promise<Record<string, string>> {
    const fieldNames = fields.map((field) => field.column);
    const fieldTypes = fields.map((field) => field.type);

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an API that generates concise, business-oriented descriptions for PostgreSQL table columns in JSON format.
        
        Notes:
          - Each description should briefly explain the purpose of the column in a business context.
          - Avoid technical details; focus instead on the business use of each column if possible.

        The JSON format of the response should be as follows:
        {
          "field1": "Description of field1",
          "field2": "Description of field2",
          ...
        }`,
      },
      {
        role: "user",
        content: `Generate descriptions for the fields in the "${tableName}" table with the following names and types: ${fieldNames
          .map((name, i) => `"${name}" (${fieldTypes[i]})`)
          .join(", ")}.`,
      },
    ];

    try {
      const aiResponse = await this.aiProvider.generateResponse(prompt, "json");
      return aiResponse as Record<string, string>;
    } catch (error) {
      return fieldNames.reduce((acc, fieldName) => {
        acc[fieldName] = "";
        return acc;
      }, {} as Record<string, string>);
    }
  }

  private mapPostgreSQLTypeToSemanticType(
    fieldType: string
  ): "identifier" | "number" | "currency" | "date" | "string" | "boolean" {
    switch (fieldType.toLowerCase()) {
      case "varchar":
      case "text":
        return "string";
      case "integer":
      case "bigint":
      case "smallint":
        return "number";
      case "decimal":
      case "numeric":
        return "currency";
      case "boolean":
        return "boolean";
      case "timestamp":
      case "date":
        return "date";
      default:
        return "string"; // Default fallback
    }
  }

  private async detectRelationships(
    schema: DataSourceSchema
  ): Promise<Relationship[]> {
    const relationships: Relationship[] = [];

    for (const [tableName, fields] of Object.entries(schema)) {
      for (const { column } of fields) {
        if (column.endsWith("_id")) {
          const relatedEntity = column.replace("_id", "");
          if (schema[relatedEntity]) {
            const prompt: Prompt = [
              {
                role: "system",
                content:
                  "Generate only a concise relationship name between two entities, without extra information.",
              },
              {
                role: "user",
                content: `Generate a relationship name from "${tableName}" to "${relatedEntity}".`,
              },
            ];

            let relationshipName = `${tableName} has ${relatedEntity}`;
            try {
              const aiResponse = await this.aiProvider.generateResponse(
                prompt,
                "json"
              );
              relationshipName = aiResponse
                ? String(aiResponse).trim()
                : relationshipName;
            } catch (error) {
              console.error(
                `Error generating relationship name for ${tableName} -> ${relatedEntity}:`,
                error
              );
            }

            relationships.push({
              fromEntity: tableName,
              toEntity: relatedEntity,
              type: "many-to-one",
              name: relationshipName,
              attributes: [column],
            });
          }
        }
      }
    }

    return relationships;
  }
}
