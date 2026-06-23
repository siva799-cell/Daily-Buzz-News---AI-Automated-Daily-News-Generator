import mongoose from 'mongoose';

const SourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
    },
    isTrusted: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Source || mongoose.model('Source', SourceSchema);
