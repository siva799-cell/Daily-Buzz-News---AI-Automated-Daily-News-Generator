import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['source'],
  }
});

// Map categories to Google News RSS search queries
const CATEGORY_QUERIES = {
  Technology: 'technology OR tech OR software OR gadgets',
  Sports: 'sports OR football OR cricket OR basketball OR athletics',
  Education: 'education OR schools OR university OR college OR study',
  Men: 'men OR mens health OR mens issues OR mens lifestyle',
  Women: 'women OR womens health OR womens rights OR female empowerment',
  Children: 'children OR kids OR parenting OR child education OR child welfare',
  Accidents: 'accident OR crash OR collision OR disaster OR derailment',
  Local: 'local news',
  National: 'national news',
  International: 'world news OR international affairs',
  Business: 'business OR economy OR stock market OR startup OR finance',
  Health: 'health OR medicine OR wellness OR disease OR fitness',
  Jobs: 'jobs OR hiring OR careers OR employment OR labor market',
  Entertainment: 'entertainment OR movies OR celebrity OR music OR theater',
  Politics: 'politics OR election OR government OR parliament',
  Science: 'science OR astronomy OR space OR research OR physics',
};

/**
 * Fetch raw news metadata from Google News RSS or APIS
 * @param {string} category 
 * @param {object} location { city, state, country }
 * @returns {Array} List of news items
 */
export async function fetchNewsItems(category, location = {}) {
  try {
    let query = CATEGORY_QUERIES[category] || category;

    // Handle Local news query customization
    if (category === 'Local' && location.city) {
      query = `"${location.city}" OR "${location.state || ''}"`;
    } else if (category === 'Local') {
      // If no city provided, query generic local/national keywords
      query = `local news ${location.country || ''}`;
    }

    // Attempt GNews or NewsAPI if configured, otherwise fall back to Google News RSS (most reliable & free)
    if (process.env.GNEWS_API_KEY) {
      return await fetchFromGNews(query, category, location);
    } else if (process.env.NEWS_API_KEY) {
      return await fetchFromNewsAPI(query, category, location);
    } else {
      return await fetchFromGoogleNewsRSS(query, category, location);
    }
  } catch (error) {
    console.error(`Error fetching news for category ${category}:`, error);
    // Return empty array on failure so system keeps running
    return [];
  }
}

/**
 * Fetch news from free Google News RSS
 */
async function fetchFromGoogleNewsRSS(query, category, location) {
  // Format query for URL
  const encodedQuery = encodeURIComponent(query);
  
  // Set language/region based on location
  let langRegion = 'hl=en-IN&gl=IN&ceid=IN:en'; // Default India/English
  if (location.country === 'United States' || location.country === 'US') {
    langRegion = 'hl=en-US&gl=US&ceid=US:en';
  } else if (location.preferredLanguage === 'te') {
    langRegion = 'hl=te&gl=IN&ceid=IN:te'; // Telugu
  } else if (location.preferredLanguage === 'hi') {
    langRegion = 'hl=hi&gl=IN&ceid=IN:hi'; // Hindi
  }

  const url = `https://news.google.com/rss/search?q=${encodedQuery}&${langRegion}`;
  
  const feed = await parser.parseURL(url);
  
  return feed.items.map((item) => {
    // Google News titles usually contain the source at the end: "Headline - Source Name"
    let title = item.title || '';
    let sourceName = 'Unknown Source';
    
    if (item.source && item.source._) {
      sourceName = item.source._;
    } else if (title.includes(' - ')) {
      const parts = title.split(' - ');
      sourceName = parts.pop().trim();
      title = parts.join(' - ').trim();
    }

    return {
      title: title,
      sourceName: sourceName,
      sourceUrl: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      description: item.contentSnippet || item.content || '',
      category: category,
      city: location.city || null,
      state: location.state || null,
      country: location.country || null,
      language: location.preferredLanguage || 'en',
    };
  });
}

/**
 * Fetch from GNews API
 */
async function fetchFromGNews(query, category, location) {
  const apiKey = process.env.GNEWS_API_KEY;
  const lang = location.preferredLanguage || 'en';
  const country = location.country === 'India' ? 'in' : 'us';
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&country=${country}&max=10&apikey=${apiKey}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GNews API returned status ${res.status}`);
  const data = await res.json();
  
  return (data.articles || []).map((art) => ({
    title: art.title,
    sourceName: art.source?.name || 'GNews Source',
    sourceUrl: art.url,
    publishedAt: new Date(art.publishedAt),
    description: art.description || art.content || '',
    imageUrl: art.image || null,
    category: category,
    city: location.city || null,
    state: location.state || null,
    country: location.country || null,
    language: lang,
  }));
}

/**
 * Fetch from NewsAPI
 */
async function fetchFromNewsAPI(query, category, location) {
  const apiKey = process.env.NEWS_API_KEY;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=10&apiKey=${apiKey}`;
  
  const res = await fetch(url, {
    headers: { 'User-Agent': 'NewsAggregatorApp/1.0' }
  });
  if (!res.ok) throw new Error(`NewsAPI returned status ${res.status}`);
  const data = await res.json();
  
  return (data.articles || []).map((art) => ({
    title: art.title,
    sourceName: art.source?.name || 'NewsAPI Source',
    sourceUrl: art.url,
    publishedAt: new Date(art.publishedAt),
    description: art.description || art.content || '',
    imageUrl: art.urlToImage || null,
    category: category,
    city: location.city || null,
    state: location.state || null,
    country: location.country || null,
    language: location.preferredLanguage || 'en',
  }));
}

/**
 * Fetches multiple related source links for verification.
 * Searches Google News RSS for the title and returns up to 15 distinct URLs.
 */
export async function fetchRelatedSources(title) {
  try {
    const encodedQuery = encodeURIComponent(title);
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    
    // Quick regex link parser for RSS items
    const linkMatches = [...text.matchAll(/<link>(https:\/\/news\.google\.com\/[^<]+)<\/link>/g)];
    const urls = linkMatches.map(m => m[1]);
    
    // Return up to 15 unique links
    const uniqueUrls = urls.filter((val, i, self) => self.indexOf(val) === i);
    return uniqueUrls.slice(0, 15);
  } catch (error) {
    console.error('Error fetching related verification sources:', error);
    return [];
  }
}

