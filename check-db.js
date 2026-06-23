import mongoose from 'mongoose';
import NewsPost from './models/NewsPost.js';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/news-aggregator';

async function check() {
  await mongoose.connect(MONGODB_URI);
  const post = await NewsPost.findOne({ status: 'approved' });
  console.log('Seeded Post Example:');
  console.log('Title:', post ? post.title : 'None found');
  console.log('Category:', post ? post.category : 'None found');
  console.log('ImageUrl:', post ? post.imageUrl : 'None found');
  console.log('ImageSource:', post ? post.imageSource : 'None found');
  console.log('ImageLicense:', post ? post.imageLicense : 'None found');
  process.exit(0);
}

check();
