import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const CreateVideoData = mutation({
  args: {
    title: v.string(),
    topic: v.string(),
    script: v.string(),
    videoStyle: v.string(),
    caption: v.string(),
    voice: v.string(),
    audioUrl: v.string(),
    uid: v.id('users'),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert('videoData', {
      title: args.title,
      topic: args.topic,
      script: args.script,
      videoStyle: args.videoStyle,
      caption: args.caption,
      voice: args.voice,
      audioUrl: args.audioUrl,
      uid: args.uid,
      createdBy: args.createdBy,
      status: 'pending',
    });
    return result;
  },
});

export const UpdateVideoRecord = mutation({
  args: {
    recordId: v.id('videoData'),
    // audioUrl:v.string(),
    images: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      // audioUrl:args.audioUrl,
      images: args.images,
      status: 'complete',
    });

    return result;
  },
});

export const GetUserVideos = query({
  args: {
    uid: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('videoData')
      .filter((q) => q.eq(q.field('uid'), args.uid))
      .order('desc')
      .collect();

    return result;
  },
});

export const GetVideoById = query({
  args: {
    videoId: v.id('videoData'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.videoId);
    return result;
  },
});

export const UpdateVideoImages = mutation({
  args: {
    recordId: v.id('videoData'),
    images: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      images: args.images,
    });

    return result;
  },
});

export const UpdateAudioUrl = mutation({
  args: {
    recordId: v.id('videoData'),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      audioUrl: args.audioUrl,
    });
    return result;
  },
});

export const UpdateVideoUrl = mutation({
  args: {
    recordId: v.id('videoData'),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.recordId, {
      videoUrl: args.videoUrl,
    });
    return result;
  },
});
