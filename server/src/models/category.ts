import { Schema, model, Document } from "mongoose";

export interface CategoryDoc extends Document {
  apiId: number;
  name: string;
}

// Mongoose schema matching that interface
const categorySchema = new Schema<CategoryDoc>({
  apiId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
});

export const Category = model<CategoryDoc>("Category", categorySchema);
