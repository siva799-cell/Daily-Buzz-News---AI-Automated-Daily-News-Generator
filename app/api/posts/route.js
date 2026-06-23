import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import NewsPost from '@/models/NewsPost';
import { deepResearchAndGenerateLocalNews } from '@/lib/deepResearcher';

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const lang = searchParams.get('lang') || 'en';
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const country = searchParams.get('country');
    const searchQuery = searchParams.get('q');
    
    // Pagination parameters
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Check if we need to perform deep research for a queried city
    if (city) {
      const cityClean = city.trim();
      const cityQuery = { 
        city: new RegExp(`^${cityClean}$`, 'i'), 
        status: 'approved', 
        isDuplicate: false 
      };
      const cityCount = await NewsPost.countDocuments(cityQuery);
      if (cityCount === 0) {
        console.log(`No news found for ${cityClean} in database. Launching deep research...`);
        try {
          await deepResearchAndGenerateLocalNews(cityClean, state || '', country || 'India', lang);
        } catch (err) {
          console.error(`Deep research failed for ${cityClean}:`, err);
        }
      }
    }

    const query = { status: 'approved', isDuplicate: false };

    // Filter by Category
    if (category) {
      query.category = category;
    }

    // Filter by Location
    if (city || state || country) {
      const locationConditions = [];
      if (city) locationConditions.push({ city: new RegExp(`^${city.trim()}$`, 'i') });
      if (state) locationConditions.push({ state: new RegExp(`^${state.trim()}$`, 'i') });
      if (country) locationConditions.push({ country: new RegExp(`^${country.trim()}$`, 'i') });
      
      // If we are looking for local news specifically, matching either city or state is fine
      if (locationConditions.length > 0) {
        query.$or = locationConditions;
      }
    }

    // Text Search
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { summary: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Fetch total count and posts
    const totalCount = await NewsPost.countDocuments(query);
    const posts = await NewsPost.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Convert Mongoose documents to plain objects
    const postObjects = posts.map(post => post.toObject());
 
    return NextResponse.json({
      success: true,
      total: totalCount,
      page: page,
      limit: limit,
      posts: postObjects
    });
  } catch (error) {
    console.error('Error fetching posts API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
