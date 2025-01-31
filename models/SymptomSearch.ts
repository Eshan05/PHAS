// models/SymptomSearch.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

interface ISymptomSearch extends Document {
  searchId: string; // Unique ID for the search
  symptoms: string;
  duration?: number;
  pastContext?: string;
  otherInfo?: string;
  geminiResponse: string;
  createdAt: Date;
}

const SymptomSearchSchema: Schema = new Schema({
  searchId: { type: String, required: true, unique: true },
  symptoms: { type: String, required: true },
  duration: { type: Number },
  pastContext: { type: String },
  otherInfo: { type: String },
  geminiResponse: { type: String, default: '' }, // Might need to make more
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError
let SymptomSearch: Model<ISymptomSearch>;
try {
  SymptomSearch = mongoose.model<ISymptomSearch>('SymptomSearch');
} catch (e) {
  SymptomSearch = mongoose.model<ISymptomSearch>('SymptomSearch', SymptomSearchSchema);
}

export default SymptomSearch;