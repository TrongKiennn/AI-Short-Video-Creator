import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get cached data by key
export const getCachedData = query({
  args: { cacheKey: v.string() },
  handler: async (ctx, args) => {
    const cache = await ctx.db
      .query("trendingCache")
      .withIndex("by_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
    
    if (!cache) return null;
    
    // Check if cache is expired
    const now = Date.now();
    if (now > cache.expiresAt) {
      // Delete expired cache
      await ctx.db.delete(cache._id);
      return null;
    }
    
    return cache.data;
  },
});

// Set cached data
export const setCachedData = mutation({
  args: { 
    cacheKey: v.string(), 
    data: v.any(), 
    ttlMinutes: v.number() 
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + (args.ttlMinutes * 60 * 1000);
    
    // Check if cache already exists
    const existingCache = await ctx.db
      .query("trendingCache")
      .withIndex("by_key", (q) => q.eq("cacheKey", args.cacheKey))
      .first();
    
    if (existingCache) {
      // Update existing cache
      await ctx.db.patch(existingCache._id, {
        data: args.data,
        expiresAt,
        createdAt: now
      });
    } else {
      // Create new cache entry
      await ctx.db.insert("trendingCache", {
        cacheKey: args.cacheKey,
        data: args.data,
        expiresAt,
        createdAt: now
      });
    }
    
    return { success: true };
  },
});
