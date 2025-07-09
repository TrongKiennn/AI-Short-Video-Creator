import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Store YouTube refresh token for a user
export const storeYouTubeToken = mutation({
  args: {
    userId: v.id('users'),
    email: v.string(),
    refreshToken: v.string(),
    accessToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Check if token already exists for this user
    const existingToken = await ctx.db
      .query('youtubeTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (existingToken) {
      // Update existing token
      await ctx.db.patch(existingToken._id, {
        refreshToken: args.refreshToken,
        accessToken: args.accessToken,
        expiresAt: args.expiresAt,
        updatedAt: now,
      });
      return existingToken._id;
    } else {
      // Create new token record
      const result = await ctx.db.insert('youtubeTokens', {
        userId: args.userId,
        email: args.email,
        refreshToken: args.refreshToken,
        accessToken: args.accessToken,
        expiresAt: args.expiresAt,
        createdAt: now,
        updatedAt: now,
      });
      return result;
    }
  },
});

// Get YouTube refresh token for a user
export const getYouTubeToken = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('youtubeTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    return token;
  },
});

// Get YouTube token by email (for server-side operations)
export const getYouTubeTokenByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('youtubeTokens')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    return token;
  },
});

// Update access token and expiry
export const updateAccessToken = mutation({
  args: {
    userId: v.id('users'),
    accessToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('youtubeTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (token) {
      await ctx.db.patch(token._id, {
        accessToken: args.accessToken,
        expiresAt: args.expiresAt,
        updatedAt: Date.now(),
      });
      return true;
    }
    return false;
  },
});

// Delete YouTube token (for logout/revoke)
export const deleteYouTubeToken = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('youtubeTokens')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    if (token) {
      await ctx.db.delete(token._id);
      return true;
    }
    return false;
  },
});

// Remove YouTube token by email (for disconnect functionality)
export const removeYouTubeToken = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const token = await ctx.db
      .query('youtubeTokens')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();

    if (token) {
      await ctx.db.delete(token._id);
      return true;
    }
    return false;
  },
});
