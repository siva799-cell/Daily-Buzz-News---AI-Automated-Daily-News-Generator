import mongoose from 'mongoose';

const NewsPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title.'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug.'],
      unique: true,
    },
    summary: {
      type: String,
      required: [true, 'Please provide a summary.'],
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category.'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    genre: {
      type: String,
      default: 'General',
    },
    language: {
      type: String,
      default: 'en',
      index: true,
    },
    translatedSummary: {
      type: Map,
      of: String,
      default: {},
    },
    location: {
      type: String,
      enum: ['local', 'national', 'international'],
      default: 'national',
      index: true,
    },
    city: {
      type: String,
      index: true,
    },
    state: {
      type: String,
      index: true,
    },
    country: {
      type: String,
      index: true,
    },
    imageUrl: {
      type: String,
    },
    imagePrompt: {
      type: String,
    },
    imageSource: {
      type: String,
      default: 'Unsplash / Public Domain',
    },
    imageLicense: {
      type: String,
      default: 'Free for commercial use under Unsplash License',
    },
    sourceName: {
      type: String,
      required: [true, 'Please provide a source name.'],
    },
    sourceUrl: {
      type: String,
      required: [true, 'Please provide a source URL.'],
    },
    publishedAt: {
      type: Date,
      required: [true, 'Please provide a publication date.'],
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    aiGeneratedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    confidenceScore: {
      type: Number,
      default: 100,
    },
    verificationSources: {
      type: [String],
      default: [],
    },
    isDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.NewsPost || mongoose.model('NewsPost', NewsPostSchema);
