/**
 * Clean and tokenize text (remove punctuation, lowercase, filter stop words)
 * @param {string} text 
 * @returns {Set<string>} Set of unique words
 */
function getWordSet(text) {
  if (!text) return new Set();
  
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
    'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres',
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is',
    'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off',
    'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant',
    'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their',
    'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were',
    'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
    'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours',
    'yourself', 'yourselves'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '') // remove punctuation
    .split(/\s+/); // split by whitespace

  return new Set(words.filter(w => w.length > 2 && !stopWords.has(w)));
}

/**
 * Calculate Jaccard similarity index between two texts
 * @param {string} textA 
 * @param {string} textB 
 * @returns {number} Value between 0 and 1
 */
export function calculateSimilarity(textA, textB) {
  const setA = getWordSet(textA);
  const setB = getWordSet(textB);
  
  if (setA.size === 0 || setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * Checks a batch of news items and database records, identifying duplicates.
 * @param {Array} newsItems - Fetched items
 * @param {Array} dbPosts - Last 48h posts in database
 * @returns {object} { uniqueItems, duplicatesCount }
 */
export function checkDuplicates(newsItems, dbPosts = []) {
  const uniqueItems = [];
  let duplicatesCount = 0;
  
  // Set similarity threshold
  const THRESHOLD = 0.35; // Jaccard similarity of titles

  for (const item of newsItems) {
    let duplicateOf = null;

    // 1. Compare against already accepted items in this fetch batch
    for (const uniqueItem of uniqueItems) {
      if (calculateSimilarity(item.title, uniqueItem.title) > THRESHOLD) {
        duplicateOf = uniqueItem;
        break;
      }
    }

    // 2. Compare against recent DB posts if not already flagged
    if (!duplicateOf && dbPosts.length > 0) {
      for (const dbPost of dbPosts) {
        if (calculateSimilarity(item.title, dbPost.title) > THRESHOLD) {
          duplicateOf = dbPost;
          break;
        }
      }
    }

    if (duplicateOf) {
      // It's a duplicate. Increment counter.
      duplicatesCount++;
      
      // If it's a duplicate, we collect the source url as verification details for the original
      if (duplicateOf.verificationSources) {
        if (!duplicateOf.verificationSources.includes(item.sourceUrl)) {
          duplicateOf.verificationSources.push(item.sourceUrl);
        }
      } else {
        duplicateOf.verificationSources = [item.sourceUrl];
      }
      
      // Save item but mark it as duplicate
      item.isDuplicate = true;
      item.status = 'rejected'; // Auto reject duplicates to keep pending queue clean
      uniqueItems.push(item);
    } else {
      // It's unique
      item.isDuplicate = false;
      item.verificationSources = [item.sourceUrl];
      uniqueItems.push(item);
    }
  }

  return { uniqueItems, duplicatesCount };
}
