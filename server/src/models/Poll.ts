import mongoose, { Schema, Types } from 'mongoose';

export type Option = {
  _id: Types.ObjectId;
  text: string;
  isCorrect: boolean;
};

export type PollAttrs = {
  question: string;
  options: Option[];
  durationSeconds: number;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
};

export type PollDoc = mongoose.HydratedDocument<PollAttrs>;

const OptionSchema = new Schema<Option>(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const PollSchema = new Schema<PollAttrs>(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [OptionSchema], required: true },
    durationSeconds: { type: Number, required: true, min: 5 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
  },
  { timestamps: true }
);

export const Poll = mongoose.model<PollAttrs>('Poll', PollSchema);
