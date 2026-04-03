import mongoose from 'mongoose';

export interface IAlliance extends mongoose.Document {
  name: string;
  logo: string; // URL to logo image
  url: string;
}

const AllianceSchema = new mongoose.Schema<IAlliance>(
  {
    name: { type: String, required: true },
    logo: { type: String, required: true },
    url: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Alliance = mongoose.model<IAlliance>('Alliance', AllianceSchema);

export default Alliance;