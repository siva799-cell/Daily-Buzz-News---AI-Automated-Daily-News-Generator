import mongoose from 'mongoose';

const DuplicateCheckLogSchema = new mongoose.Schema(
  {
    checkedAt: {
      type: Date,
      default: Date.now,
    },
    postsCompared: {
      type: Number,
      default: 0,
    },
    duplicatesFound: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DuplicateCheckLog || mongoose.model('DuplicateCheckLog', DuplicateCheckLogSchema);
