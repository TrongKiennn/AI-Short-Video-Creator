import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET() {
  try {
    const SERPAPI_CACHE_KEY = 'serpapi_trending_topics';
    const NEWS_CACHE_KEY = 'news_trending_topics';
    const SERPAPI_TTL_MINUTES = 480; // 8 hours for SerpAPI
    const NEWS_TTL_MINUTES = 15; // 15 minutes for NewsAPI

    // Check both caches simultaneously
    const [cachedSerpData, cachedNewsData] = await Promise.all([
      convex.query(api.trendingCache.getCachedData, {
        cacheKey: SERPAPI_CACHE_KEY,
      }),
      convex.query(api.trendingCache.getCachedData, {
        cacheKey: NEWS_CACHE_KEY,
      }),
    ]);

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
            `https://serpapi.com/search.json?engine=google_trends_trending_now&geo=VN&hours=4&api_key=${serpApiKey}`
          )
            .then(async (serpResponse) => {
              if (serpResponse.ok) {
                const serpData = await serpResponse.json();

                const topics =
                  serpData.trending_searches
                    ?.slice(0, 15) // Maximum 15 keywords from SerpAPI
                    ?.map((trend) => {
                      let topic = trend.query
                        .replace(/^\w+:\s*/, '') // Remove prefix
                        .trim();

                      // Capitalize first letter
                      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
                      return topic;
                    })
                    ?.filter((topic) => topic && topic.length > 2) || // Filter very short topics
                  [];

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
            `https://newsapi.org/v2/top-headlines?country=us&apiKey=${newsApiKey}`
          )
            .then(async (newsResponse) => {
              if (newsResponse.ok) {
                const newsData = await newsResponse.json();

                const topics =
                  newsData.articles
                    ?.slice(0, 5) // Maximum 5 headlines from NewsAPI
                    ?.map((article) => {
                      let topic = article.title
                        .replace(/\s*-\s*[^-]*$/, '') // Remove source at end
                        .replace(/^\w+:\s*/, '') // Remove source at beginning
                        .replace(/["']/g, '') // Remove quotes
                        .split(
                          /\s+(and|in|at|on|with|to|for|as|amid|after|before)\s+/i
                        )[0] // Take first meaningful part
                        .replace(/\.\.\.$/, '') // Remove trailing dots
                        .trim();

                      // Capitalize and limit length
                      topic = topic.charAt(0).toUpperCase() + topic.slice(1);
                      if (topic.length > 40) {
                        topic = topic.substring(0, 40) + '...';
                      }
                      return topic;
                    })
                    ?.filter((topic) => topic && topic.length > 8) || // Filter short topics
                  [];

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
      // Add NewsAPI topics if we have space (max 20 total: 15 SerpAPI + 5 NewsAPI)
      const remainingSlots = 20 - finalTopics.length;
      if (remainingSlots > 0) {
        finalTopics = [...finalTopics, ...newsTopics.slice(0, remainingSlots)];
      }
      sources.push(`newsapi(${newsSource})`);
    }

    // Remove duplicates while preserving order
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
