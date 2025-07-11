import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    pictureURL: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .collect();

    if (!user[0]?.email) {
      const result = await ctx.db.insert('users', {
        name: args.name,
        email: args.email,
        pictureURL: args?.pictureURL,
        credits: 100,
      });

      return result;
    }

    return user[0];
  },
});

export const getUserByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('email'), args.email))
      .first();

    return user;
  },
});

export const updateAutoUploadPreference = mutation({
  args: {
    userId: v.id('users'),
    autoUploadToYoutube: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      autoUploadToYoutube: args.autoUploadToYoutube,
    });
    return true;
  },
});

export const getUserPreferences = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return {
      autoUploadToYoutube: user?.autoUploadToYoutube || false,
    };
  },
});
