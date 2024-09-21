// BlockGroup model
export interface BlockGroup {
  blocks: { x: number; y: number }[]; // The positions of the blocks in the grid
  color: string; // Color for the block group
  config: {
    title: string; // Title of the block
    query: string; // Query ID
    type: "bar" | "pie" | "line" | "table" | "value"; // Type of block (chart, table, value, etc.)
  };
}

// Report model
export interface Report {
  _id?: string; // Optional, for when updating an existing report
  name: string; // Name/title of the report
  blockGroups: BlockGroup[]; // Collection of block groups
  createdBy?: string; // The user who created the report
  createdAt?: string; // Optional, for when the report was created
  updatedAt?: string; // Optional, for when the report was last updated
}
