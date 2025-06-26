import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET() {
  try {
    const CACHE_KEY = "trending_topics";
    const CACHE_TTL_MINUTES = 15;
    
    // Check cache first
    const cachedData = await convex.query(api.trendingCache.getCachedData, {
      cacheKey: CACHE_KEY
    });
    
    if (cachedData) {
      return NextResponse.json({ topics: cachedData, fromCache: true });
    }
    
    // Fetch from NewsAPI if not cached
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
      return NextResponse.json({ 
        topics: [], 
        error: "NEWS_API_KEY not configured" 
      });
    }
    
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${newsApiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract trending topics from headlines
    const topics = data.articles
      ?.slice(0, 15) // Limit to 15 topics
      ?.map(article => {
        // Clean up the title to make it more topic-like
        let topic = article.title
          .replace(/\s*-\s*[^-]*$/, '') // Remove source at end
          .replace(/^\w+:\s*/, '') // Remove source at beginning
          .trim();
        
        // Limit length
        if (topic.length > 60) {
          topic = topic.substring(0, 60) + "...";
        }
        
        return topic;
      })
      ?.filter(topic => topic && topic.length > 10) // Filter out very short topics
      || [];
    
    // Cache the results
    await convex.mutation(api.trendingCache.setCachedData, {
      cacheKey: CACHE_KEY,
      data: topics,
      ttlMinutes: CACHE_TTL_MINUTES
    });
    
    return NextResponse.json({ topics, fromCache: false });
    
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    return NextResponse.json({ 
      topics: [], 
      error: error.message 
    });
  }
}
