import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

// Get system parameter by key
export const getParam = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const param = await ctx.db
      .query('sysparam')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .filter((q) => q.eq(q.field('isActive'), true))
      .first();

    return param?.value || null;
  },
});

// Get all parameters by category
export const getParamsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sysparam')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();
  },
});

// Get all non-secret parameters (for admin panel)
export const getAllParams = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('sysparam')
      .filter((q) => q.eq(q.field('isSecret'), false))
      .collect();
  },
});

// Update parameter value
export const updateParam = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('sysparam')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description || existing.description,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

// Create new parameter
export const createParam = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    isSecret: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert('sysparam', {
      key: args.key,
      value: args.value,
      description: args.description || '',
      category: args.category,
      isSecret: args.isSecret,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Seed initial environment variables into sysparam table
export const seedEnvParams = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    const envParams = [
      // Firebase Configuration
      {
        key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
        value: '',
        description: 'Firebase API Key for authentication',
        category: 'firebase',
        isSecret: true,
      },

      // Convex Configuration
      {
        key: 'CONVEX_DEPLOYMENT',
        value: 'dev:nautical-walrus-21',
        description: 'Convex deployment identifier',
        category: 'convex',
        isSecret: false,
      },
      {
        key: 'NEXT_PUBLIC_CONVEX_URL',
        value: 'http://127.0.0.1:3210',
        description: 'Convex URL for client connections',
        category: 'convex',
        isSecret: false,
      },
      {
        key: 'CONVEX_SELF_HOSTED_URL',
        value: 'http://127.0.0.1:3210',
        description: 'Self-hosted Convex URL',
        category: 'convex',
        isSecret: false,
      },
      {
        key: 'CONVEX_SELF_HOSTED_ADMIN_KEY',
        value: 'convex-self-hosted|',
        description: 'Admin key for self-hosted Convex',
        category: 'convex',
        isSecret: true,
      },

      // API Keys
      {
        key: 'NEXT_PUBLIC_GOOGLE_API_KEY',
        value: '',
        description: 'Google API Key for various services',
        category: 'api',
        isSecret: true,
      },
      {
        key: 'NEXT_PUBLIC_GEMINI_API_KEY',
        value: '',
        description: 'Google Gemini AI API Key',
        category: 'api',
        isSecret: true,
      },
      {
        key: 'NEXT_PUBLIC_AIGURULAB_API_KEY',
        value: '',
        description: 'AI Guru Lab API Key for image generation',
        category: 'api',
        isSecret: true,
      },
      {
        key: 'GROQ_API_KEY',
        value: '',
        description: 'Groq API Key for fast AI inference',
        category: 'api',
        isSecret: true,
      },
      {
        key: 'NEWS_API_KEY',
        value: '',
        description: 'News API Key for trending topics',
        category: 'api',
        isSecret: true,
      },
      {
        key: 'SERP_API_KEY',
        value: '',
        description: 'SERP API Key for search results',
        category: 'api',
        isSecret: true,
      },

      // Database Configuration
      {
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        value: '',
        description: 'Supabase project URL',
        category: 'database',
        isSecret: false,
      },
      {
        key: 'NEXT_PUBLIC_SUPABASE_KEY',
        value: '',
        description: 'Supabase anonymous public key',
        category: 'database',
        isSecret: true,
      },

      // YouTube Configuration
      {
        key: 'YOUTUBE_CLIENT_ID',
        value: '',
        description: 'YouTube OAuth Client ID',
        category: 'youtube',
        isSecret: true,
      },
      {
        key: 'YOUTUBE_CLIENT_SECRET',
        value: '',
        description: 'YouTube OAuth Client Secret',
        category: 'youtube',
        isSecret: true,
      },
      {
        key: 'YOUTUBE_REDIRECT_URI',
        value: 'http://localhost:3000/api/youtube/auth',
        description: 'YouTube OAuth redirect URI',
        category: 'youtube',
        isSecret: false,
      },
    ];

    // Insert each parameter
    for (const param of envParams) {
      // Check if parameter already exists
      const existing = await ctx.db
        .query('sysparam')
        .withIndex('by_key', (q) => q.eq('key', param.key))
        .first();

      if (!existing) {
        await ctx.db.insert('sysparam', {
          ...param,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return { message: 'Environment parameters seeded successfully' };
  },
});

// Toggle parameter active status
export const toggleParam = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const param = await ctx.db
      .query('sysparam')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (param) {
      return await ctx.db.patch(param._id, {
        isActive: !param.isActive,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

// Delete parameter
export const deleteParam = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const param = await ctx.db
      .query('sysparam')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .first();

    if (param) {
      return await ctx.db.delete(param._id);
    }

    return null;
  },
});
