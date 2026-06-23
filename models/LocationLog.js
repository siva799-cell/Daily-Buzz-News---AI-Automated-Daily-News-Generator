import mongoose from 'mongoose';

const LocationLogSchema = new mongoose.Schema(
  {
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    detectedCountry: {
      type: String,
    },
    detectedState: {
      type: String,
    },
    detectedCity: {
      type: String,
    },
    ipHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LocationLog || mongoose.model('LocationLog', LocationLogSchema);
