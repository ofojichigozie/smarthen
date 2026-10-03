import { Schema, model, Document } from 'mongoose';

export interface IReading extends Document {
  timestamp: Date;
  temperature: number;
  humidity: number;
  gasLevel: number;
  fanState: boolean;
  bulbState: boolean;
  buzzerState: boolean;
}

const readingSchema = new Schema<IReading>(
  {
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    gasLevel: {
      type: Number,
      required: true,
    },
    fanState: {
      type: Boolean,
      required: true,
      default: false,
    },
    bulbState: {
      type: Boolean,
      required: true,
      default: false,
    },
    buzzerState: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt alongside our own `timestamp`
);

const Reading = model<IReading>('Reading', readingSchema);

export default Reading;
