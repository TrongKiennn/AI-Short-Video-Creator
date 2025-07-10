import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import nlp from 'compromise';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Function to extract keywords using compromise.js
function extractKeywordsFromHeadlines(headlines) {
  const allKeywords = [];

  headlines.forEach((headline) => {
    const doc = nlp(headline);

    // Extract different types of entities
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const organizations = doc.organizations().out('array');
    const topics = doc.topics().out('array');

    // Extract important nouns (but not common ones)
    const nouns = doc
      .nouns()
      .out('array')
      .filter(
        (noun) =>
          noun.length > 3 &&
          ![
            'news',
            'report',
            'story',
            'article',
            'update',
            'time',
            'year',
            'day',
            'week',
          ].includes(noun.toLowerCase())
      );

    // Extract adjectives that might be important (like "breaking", "major")
    const adjectives = doc
      .adjectives()
      .out('array')
      .filter((adj) =>
        [
          'breaking',
          'major',
          'new',
          'latest',
          'urgent',
          'exclusive',
          'live',
        ].includes(adj.toLowerCase())
      );

    // Combine all keywords with priority order
    const headlineKeywords = [
      ...people,
      ...places,
      ...organizations,
      ...topics,
      ...nouns,
      ...adjectives,
    ].filter((keyword) => keyword && keyword.length > 2);

    allKeywords.push(...headlineKeywords);
  });

  // Remove duplicates and common words, prioritize by frequency
  const keywordFreq = {};
  allKeywords.forEach((keyword) => {
    const clean = keyword.toLowerCase().trim();
    keywordFreq[clean] = (keywordFreq[clean] || 0) + 1;
  });

  // Sort by frequency and return top 25 keywords from NewsAPI
  const sortedKeywords = Object.entries(keywordFreq)
    .sort(([, a], [, b]) => b - a)
    .map(([keyword]) => keyword.charAt(0).toUpperCase() + keyword.slice(1))
    .slice(0, 25); // Top 25 keywords from NewsAPI extraction

  return sortedKeywords;
}

export async function GET() {
  try {
    const SERPAPI_CACHE_KEY = 'serpapi_trending_topics';
    const NEWS_CACHE_KEY = 'news_trending_topics';
    const SERPAPI_TTL_MINUTES = 480; // 8 hours for SerpAPI, 1 for testing
    const NEWS_TTL_MINUTES = 15; // 15 minutes for NewsAPI, 1 for testing

    // Check both caches simultaneously
    const [cachedSerpData, cachedNewsData] = await Promise.all([
      convex.query(api.trendingCache.getCachedData, {
        cacheKey: SERPAPI_CACHE_KEY,
      }),
      convex.query(api.trendingCache.getCachedData, {
        cacheKey: NEWS_CACHE_KEY,
      }),
    ]);

    // Clean up expired caches if needed
    if (!cachedSerpData) {
      await convex.mutation(api.trendingCache.deleteExpiredCache, {
        cacheKey: SERPAPI_CACHE_KEY,
      });
    }
    if (!cachedNewsData) {
      await convex.mutation(api.trendingCache.deleteExpiredCache, {
        cacheKey: NEWS_CACHE_KEY,
      });
    }

    // Fetch fresh data for expired caches
    const fetchPromises = [];
    let serpTopics = cachedSerpData;
    let newsTopics = cachedNewsData;
    let serpSource = cachedSerpData ? 'cache' : null;
    let newsSource = cachedNewsData ? 'cache' : null;

    // Fetch SerpAPI if cache expired
    if (!cachedSerpData) {
      const serpApiKey = process.env.SERP_API_KEY;
      if (serpApiKey) {
        fetchPromises.push(
          fetch(
            `https://serpapi.com/search.json?engine=google_trends_trending_now&geo=US&hours=4&api_key=${serpApiKey}`
          )
            .then(async (serpResponse) => {
              if (serpResponse.ok) {
                const serpData = await serpResponse.json();

                const topics =
                  serpData.trending_searches
                    ?.map((trend) => {
                      let topic = trend.query
                        .replace(/^\w+:\s*/, '') // Remove prefix
                        .trim();

                      // Capitalize first letter
                      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
                      return topic;
                    })
                    ?.filter((topic) => topic && topic.length > 2) // Filter very short topics
                    ?.filter(
                      (topic, index, arr) =>
                        arr.findIndex(
                          (t) => t.toLowerCase() === topic.toLowerCase()
                        ) === index
                    ) // Remove duplicates from SerpAPI
                    ?.slice(0, 25) || []; // Maximum 25 keywords from SerpAPI

                if (topics.length > 0) {
                  // Cache SerpAPI results for 8 hours
                  await convex.mutation(api.trendingCache.setCachedData, {
                    cacheKey: SERPAPI_CACHE_KEY,
                    data: topics,
                    ttlMinutes: SERPAPI_TTL_MINUTES,
                  });

                  serpTopics = topics;
                  serpSource = 'fresh';
                }
              }
            })
            .catch((error) => {
              console.warn('SerpAPI failed:', error.message);
            })
        );
      }
    }

    // Fetch NewsAPI if cache expired
    if (!cachedNewsData) {
      const newsApiKey = process.env.NEWS_API_KEY;
      if (newsApiKey) {
        fetchPromises.push(
          fetch(
            `https://newsapi.org/v2/top-headlines?country=US&apiKey=${newsApiKey}`
          )
            .then(async (newsResponse) => {
              if (newsResponse.ok) {
                const newsData = await newsResponse.json();

                // Extract raw headlines first
                const headlines =
                  newsData.articles
                    ?.slice(0, 25) // Take at most 25 crude headlines
                    ?.map((article) => article.title)
                    ?.filter((title) => title && title.length > 10) || [];

                let topics = [];

                if (headlines.length > 0) {
                  try {
                    // Use compromise.js for keyword extraction
                    topics = extractKeywordsFromHeadlines(headlines);
                    console.log(
                      'Extracted keywords using compromise.js:',
                      topics
                    );
                  } catch (error) {
                    console.warn(
                      'Compromise.js extraction failed, using fallback:',
                      error.message
                    );
                    // Fallback to simple extraction - process ALL headlines
                    topics = headlines
                      .map((headline) => {
                        let topic = headline
                          .replace(/\s*-\s*[^-]*$/, '')
                          .replace(/^\w+:\s*/, '')
                          .replace(/["']/g, '')
                          .split(
                            /\s+(and|in|at|on|with|to|for|as|amid|after|before)\s+/i
                          )[0]
                          .trim();

                        topic = topic.charAt(0).toUpperCase() + topic.slice(1);
                        if (topic.length > 40) {
                          topic = topic.substring(0, 40) + '...';
                        }
                        return topic;
                      })
                      .filter((topic) => topic && topic.length > 8)
                      .filter(
                        (topic, index, arr) =>
                          arr.findIndex(
                            (t) => t.toLowerCase() === topic.toLowerCase()
                          ) === index
                      ) // Remove duplicates from NewsAPI
                      .slice(0, 25); // Top 25 keywords from fallback extraction
                  }
                }

                if (topics.length > 0) {
                  // Cache NewsAPI results for 15 minutes
                  await convex.mutation(api.trendingCache.setCachedData, {
                    cacheKey: NEWS_CACHE_KEY,
                    data: topics,
                    ttlMinutes: NEWS_TTL_MINUTES,
                  });

                  newsTopics = topics;
                  newsSource = 'fresh';
                }
              }
            })
            .catch((error) => {
              console.warn('NewsAPI failed:', error.message);
            })
        );
      }
    }

    // Wait for all fetch operations to complete
    await Promise.all(fetchPromises);

    // Combine results prioritizing SerpAPI
    let finalTopics = [];
    let sources = [];

    if (serpTopics && serpTopics.length > 0) {
      finalTopics = [...serpTopics];
      sources.push(`serpapi(${serpSource})`);
    }

    if (newsTopics && newsTopics.length > 0) {
      // Add ALL NewsAPI topics (no slot limit)
      finalTopics = [...finalTopics, ...newsTopics];
      sources.push(`newsapi(${newsSource})`);
    }

    // Final duplicate removal across ALL sources while preserving order
    finalTopics = finalTopics.filter(
      (topic, index, arr) =>
        arr.findIndex((t) => t.toLowerCase() === topic.toLowerCase()) === index
    );

    return NextResponse.json({
      topics: finalTopics,
      sources: sources,
      totalCount: finalTopics.length,
    });
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return NextResponse.json({
      topics: [],
      error: error.message,
    });
  }
}
