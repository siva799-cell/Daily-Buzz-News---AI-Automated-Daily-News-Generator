import mongoose from 'mongoose';

const FetchLogSchema = new mongoose.Schema(
  {
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['running', 'success', 'failed'],
      default: 'running',
    },
    postsFetched: {
      type: Number,
      default: 0,
    },
    postsSummarized: {
      type: Number,
      default: 0,
    },
    errors: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

export default mongoose.models.FetchLog || mongoose.model('FetchLog', FetchLogSchema);
