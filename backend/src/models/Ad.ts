import mongoose from 'mongoose';

export interface IAd extends mongoose.Document {
  horizontalImageUrl: string;
  verticalImageUrl: string;
  link?: string;
  label?: string;
}

const AdSchema = new mongoose.Schema<IAd>(
  {
    horizontalImageUrl: { type: String, required: true },
    verticalImageUrl: { type: String, required: true },
    link: { type: String, required: false },
    label: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const Ad = mongoose.model<IAd>('Ad', AdSchema);

export default Ad;