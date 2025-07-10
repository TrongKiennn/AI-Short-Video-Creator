import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    pictureURL: v.string(),
    credits: v.number(),
  }),
  videoData: defineTable({
    title: v.string(),
    topic: v.string(),
    script: v.string(),
    videoStyle: v.string(),
    caption: v.string(),
    voice: v.string(),
    images: v.optional(v.any()),
    audioUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()), // URL to the exported video file
    captionJSON: v.optional(v.any()),
    uid: v.id('users'),
    createdBy: v.string(),
    status: v.optional(v.string()),
  }),
  trendingCache: defineTable({
    cacheKey: v.string(),
    data: v.any(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index('by_key', ['cacheKey']),
  youtubeTokens: defineTable({
    userId: v.id('users'),
    email: v.string(),
    refreshToken: v.string(),
    accessToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_email', ['email']),
});
