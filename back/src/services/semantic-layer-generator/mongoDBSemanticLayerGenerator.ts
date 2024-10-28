import {
  SemanticLayer,
  Entity,
  EntityAttribute,
  Relationship,
  SynonymMapping,
} from "./semanticLayer";
import {
  SemanticLayerGenerator,
  DataSourceSchema,
} from "./semanticLayerGenerator";
import {
  GenerativeAIProvider,
  Prompt,
} from "../generative-ai-providers/generativeAIProvider";

export class MongoDBSemanticLayerGenerator extends SemanticLayerGenerator {
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

  // Step 1: Generate All Entity Names at Once
  private async generateEntities(schema: DataSourceSchema): Promise<Entity[]> {
    const collectionNames = Object.keys(schema);

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an API that generates semantic names and concise descriptions for MongoDB collections in JSON format that is specified.
      
      Notes about semanticName:
        - Names should be business-oriented but can stay similar to the collection names if they are already meaningful.
        - For instance, if the collection name is "report_data," the semantic name can simply be "Report Data."
        - Use business context when possible, but avoid over-complicating if the collection name is already widely understood.
      
      Notes about description:
        - Provide a brief, meaningful description of each collection.

      The JSON format of the response must be as follows: 
      {
        "collection1": {
          "semanticName": "Business Name 1",
          "description": "This collection contains data about..."
        },
        "collection2": {
          "semanticName": "Business Name 2",
          "description": "Business Name 2 contains data about..."
        },
        ...
      }`,
      },
      {
        role: "user",
        content: `Generate semantic names and descriptions for the following collections: ${collectionNames.join(
          ", "
        )}.`,
      },
    ];

    try {
      const aiResponse = await this.aiProvider.generateResponse(prompt, "json");

      // AI response expected as an object with semantic names and descriptions for each collection
      const entityData = aiResponse as Record<
        string,
        { semanticName: string; description: string }
      >;

      const entities = collectionNames.map((collectionName) => ({
        name: entityData[collectionName]?.semanticName || collectionName,
        table: collectionName,
        description: entityData[collectionName]?.description || "",
        synonyms: [], // User-defined
      }));
      console.log(`Entities: ${JSON.stringify(entities, null, 2)}`);
      return entities;
    } catch (error) {
      console.error("Error generating entity names and descriptions:", error);
      // Fallback to using collection names if AI fails
      return collectionNames.map((collectionName) => ({
        name: collectionName,
        table: collectionName,
        description: "",
      }));
    }
  }

  // Step 2: Generate All Attributes for Each Entity in a Single Request
  private async generateEntityAttributes(
    schema: DataSourceSchema
  ): Promise<EntityAttribute[]> {
    const entityAttributes: EntityAttribute[] = [];

    for (const [collectionName, fields] of Object.entries(schema) as [
      string,
      { [key: string]: string }
    ][]) {
      // Get a dictionary of field descriptions keyed by field names
      const fieldDescriptions = await this.generateAttributeDescriptions(
        collectionName,
        fields
      );

      entityAttributes.push({
        entity: collectionName,
        attributes: Object.entries(fields).map(([fieldName, fieldType]) => ({
          name: fieldName,
          type: this.mapMongoTypeToSemanticType(fieldType),
          description: fieldDescriptions[fieldName] || "", // Fallback to empty if no description is available
        })),
      });
    }

    return entityAttributes;
  }

  // Helper function to generate descriptions for all attributes of a single entity
  private async generateAttributeDescriptions(
    collectionName: string,
    fields: { [key: string]: string }
  ): Promise<Record<string, string>> {
    const fieldNames = Object.keys(fields);
    const fieldTypes = Object.values(fields);

    const prompt: Prompt = [
      {
        role: "system",
        content: `You are an API that generates concise, business-oriented descriptions for MongoDB collection fields in JSON format.
    
    Notes:
      - Each description should briefly explain the purpose of the field in a business context.
      - Avoid technical details; focus instead on the business use of each field if possible.

    The JSON format of the response should be as follows:
    {
      "field1": "Description of field1",
      "field2": "Description of field2",
      ...
    }`,
      },
      {
        role: "user",
        content: `Generate descriptions for the fields in the "${collectionName}" collection with the following names and types: ${fieldNames
          .map((name, i) => `"${name}" (${fieldTypes[i]})`)
          .join(", ")}.`,
      },
    ];

    try {
      const aiResponse = await this.aiProvider.generateResponse(prompt, "json");

      // AI response is expected to be an object with descriptions for each field
      const fieldDescriptions = aiResponse as Record<string, string>;

      console.log(
        `Generated field descriptions: ${JSON.stringify(
          fieldDescriptions,
          null,
          2
        )}`
      );
      return fieldDescriptions;
    } catch (error) {
      console.error(
        `Error generating descriptions for fields in collection ${collectionName}:`,
        error
      );
      // Fallback to an empty dictionary if AI fails
      return fieldNames.reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: "" }),
        {}
      );
    }
  }

  // Helper function to map MongoDB types to Semantic Layer types
  private mapMongoTypeToSemanticType(
    fieldType: string
  ): "identifier" | "number" | "currency" | "date" | "string" | "boolean" {
    switch (fieldType.toLowerCase()) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "date":
        return "date";
      case "boolean":
        return "boolean";
      default:
        return "string"; // Default type if unknown
    }
  }

  // Step 3: Detect Relationships with AI-enhanced Names
  private async detectRelationships(
    schema: DataSourceSchema
  ): Promise<Relationship[]> {
    const relationshipPromises = Object.entries(schema).flatMap(
      ([collectionName, fields]) => {
        return Object.entries(fields as { [key: string]: string })
          .map(async ([fieldName, fieldType]) => {
            if (fieldName.endsWith("_id")) {
              const relatedEntity = fieldName.replace("_id", "");
              if (schema[relatedEntity]) {
                const prompt: Prompt = [
                  {
                    role: "system",
                    content:
                      "Generate only a concise relationship name between two entities, without extra information.",
                  },
                  {
                    role: "user",
                    content: `Generate a relationship name from "${collectionName}" to "${relatedEntity}".`,
                  },
                ];

                let relationshipName = `${collectionName} has ${relatedEntity}`;
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
                    `Error generating relationship name for ${collectionName} -> ${relatedEntity}:`,
                    error
                  );
                }

                return {
                  fromEntity: collectionName,
                  toEntity: relatedEntity,
                  type: "many-to-one",
                  name: relationshipName,
                  attributes: [fieldName],
                };
              }
            }
            return null;
          })
          .filter((rel) => rel !== null);
      }
    );

    const relationships = await Promise.all(relationshipPromises);
    return relationships.filter(Boolean) as Relationship[];
  }
}
