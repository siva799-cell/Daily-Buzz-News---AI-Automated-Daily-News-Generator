import mongoose from 'mongoose';

const UserPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    preferredLanguage: {
      type: String,
      default: 'en',
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    locationPermission: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserPreference || mongoose.model('UserPreference', UserPreferenceSchema);
