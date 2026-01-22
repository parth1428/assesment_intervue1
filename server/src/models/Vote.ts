import mongoose, { Schema, Types } from 'mongoose';

export type VoteDoc = {
  _id: Types.ObjectId;
  pollId: Types.ObjectId;
  optionId: Types.ObjectId;
  studentId: string;
  studentName: string;
  createdAt: Date;
  updatedAt: Date;
};

const VoteSchema = new Schema<VoteDoc>(
  {
    pollId: { type: Schema.Types.ObjectId, ref: 'Poll', required: true },
    optionId: { type: Schema.Types.ObjectId, required: true },
    studentId: { type: String, required: true, trim: true },
    studentName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export const Vote = mongoose.model<VoteDoc>('Vote', VoteSchema);
