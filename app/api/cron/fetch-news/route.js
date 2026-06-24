import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import NewsPost from '@/models/NewsPost';
import FetchLog from '@/models/FetchLog';
import DuplicateCheckLog from '@/models/DuplicateCheckLog';
import { fetchNewsItems, fetchRelatedSources } from '@/lib/newsFetcher';
import { checkDuplicates } from '@/lib/duplicateDetector';
import { summarizeNewsItem, translateText } from '@/lib/openAiSummarizer';
import { getLanguageForState } from '@/lib/locationHelper';
import { getPremiumImage } from '@/lib/imageHelper';
import { generateNanoBananaImage } from '@/lib/nanoBanana';

// Define target local locations we fetch automatically
const LOCAL_TARGETS = [
  { city: 'Vizag', state: 'Andhra Pradesh', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' }
];

const CATEGORIES = [
  'Technology', 'Sports', 'Education', 'Men', 'Women', 'Children',
  'Accidents', 'Local', 'National', 'International', 'Business',
  'Health', 'Jobs', 'Entertainment', 'Politics', 'Science'
];

export async function GET(request) {
  // Optional security token check to prevent unauthorized runs in production
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const headerSecret = request.headers.get('x-cron-secret') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  if (process.env.CRON_SECRET) {
    const expectedSecret = process.env.CRON_SECRET;
    if (secret !== expectedSecret && headerSecret !== expectedSecret && !isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const log = new FetchLog({ startedAt: new Date(), status: 'running' });
  await dbConnect();
  await log.save();

  try {
    let postsFetchedCount = 0;
    let postsSummarizedCount = 0;
    let allFetchedItems = [];

    // Fetch category-wise news (Fetch top 4 items per category)
    for (const category of CATEGORIES) {
      if (category === 'Local') {
        // Fetch local news for our target cities
        for (const loc of LOCAL_TARGETS) {
          const items = await fetchNewsItems('Local', { ...loc, preferredLanguage: 'en' });
          // Limit to top 3 per local target city
          allFetchedItems.push(...items.slice(0, 3));
        }
      } else {
        const items = await fetchNewsItems(category, { country: 'India', preferredLanguage: 'en' });
        // Limit to top 4 per category
        allFetchedItems.push(...items.slice(0, 4));
      }
    }

    postsFetchedCount = allFetchedItems.length;

    // Get last 48 hours posts from database for duplication comparison
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recentDbPosts = await NewsPost.find({ createdAt: { $gte: fortyEightHoursAgo } });

    // Run duplicate check
    const dupLog = new DuplicateCheckLog({ checkedAt: new Date(), postsCompared: postsFetchedCount });
    const { uniqueItems, duplicatesCount } = checkDuplicates(allFetchedItems, recentDbPosts);
    
    dupLog.duplicatesFound = duplicatesCount;
    await dupLog.save();

    // Now process unique, non-duplicate posts
    const nonDuplicates = uniqueItems.filter(item => !item.isDuplicate);
    const duplicates = uniqueItems.filter(item => item.isDuplicate);

    // Save duplicates immediately as rejected
    for (const dup of duplicates) {
      const slug = generateSlug(dup.title) + '-' + Math.random().toString(36).substring(2, 7);
      const post = new NewsPost({
        ...dup,
        slug,
        summary: dup.description || 'Duplicate content matching existing story.',
        status: 'rejected',
        isDuplicate: true,
      });
      await post.save();
    }

    // Process and summarize non-duplicate items
    // Limit to top 50 total items per run as requested
    const itemsToProcess = nonDuplicates.slice(0, 50);

    for (const item of itemsToProcess) {
      try {
        // Determine state/language relevance for regional translation
        const stateLanguage = getLanguageForState(item.state);
        
        // Fetch 10-15 related source links for deep research/verification
        const verificationUrls = await fetchRelatedSources(item.title);
        const finalVerificationSources = verificationUrls.length > 0 ? verificationUrls : [item.sourceUrl];

        // 1. Generate primary English summary and details
        const aiPost = await summarizeNewsItem(item, 'en');
        
        // Ensure slug is unique
        let baseSlug = generateSlug(aiPost.title || item.title);
        let slug = baseSlug;
        let slugExists = await NewsPost.findOne({ slug });
        if (slugExists) {
          slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        // 2. Generate translations for regional languages (e.g. Telugu, Hindi)
        const translatedSummary = {};
        
        // Generate state-specific translation if any
        if (stateLanguage && stateLanguage !== 'en') {
          translatedSummary[stateLanguage] = await translateText(aiPost.summary, stateLanguage);
        }
        
        // Always pre-generate Hindi and Telugu translations as default backups for the selector
        if (!translatedSummary['hi']) {
          translatedSummary['hi'] = await translateText(aiPost.summary, 'hi');
        }
        if (!translatedSummary['te']) {
          translatedSummary['te'] = await translateText(aiPost.summary, 'te');
        }

        const customKeyword = aiPost.tags && aiPost.tags.length > 0 ? aiPost.tags.slice(0, 2).join(',') : null;
        const aiGeneratedImage = await generateNanoBananaImage(aiPost.imagePrompt);
        const imageInfo = aiGeneratedImage || getPremiumImage(aiPost.category || item.category, postsSummarizedCount, customKeyword);

        // 3. Create and Save the pending NewsPost
        const newsPost = new NewsPost({
          title: aiPost.title,
          slug: slug,
          summary: aiPost.summary,
          keyPoints: aiPost.keyPoints,
          category: aiPost.category || item.category,
          tags: aiPost.tags || [],
          genre: aiPost.genre || 'General News',
          language: 'en',
          translatedSummary: translatedSummary,
          location: item.state ? 'local' : (item.category === 'International' ? 'international' : 'national'),
          city: aiPost.city || item.city,
          state: aiPost.state || item.state,
          country: aiPost.country || item.country || 'India',
          imageUrl: item.imageUrl || imageInfo.url,
          imagePrompt: aiPost.imagePrompt,
          imageSource: item.imageUrl ? 'Original Publisher' : imageInfo.source,
          imageLicense: item.imageUrl ? 'Fair Use for Editorial Reporting' : imageInfo.license,
          sourceName: item.sourceName,
          sourceUrl: item.sourceUrl,
          publishedAt: item.publishedAt,
          fetchedAt: new Date(),
          aiGeneratedAt: new Date(),
          status: 'approved',
          confidenceScore: aiPost.confidenceScore,
          verificationSources: finalVerificationSources,
          isDuplicate: false,
        });

        await newsPost.save();
        postsSummarizedCount++;
      } catch (err) {
        console.error('Error processing single news item:', err);
        log.errors.push(`Post processing error: ${err.message}`);
      }
    }

    log.completedAt = new Date();
    log.status = 'success';
    log.postsFetched = postsFetchedCount;
    log.postsSummarized = postsSummarizedCount;
    await log.save();

    return NextResponse.json({
      success: true,
      fetched: postsFetchedCount,
      summarized: postsSummarizedCount,
      duplicatesDetected: duplicatesCount,
    });
  } catch (error) {
    console.error('Cron job main loop error:', error);
    log.completedAt = new Date();
    log.status = 'failed';
    log.errors.push(`Cron failure: ${error.message}`);
    await log.save();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Utility to generate URL-safe slugs
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
