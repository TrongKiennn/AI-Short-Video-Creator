import { defineSchema, defineTable } from "convex/server";
import {v} from "convex/values"

export default defineSchema({
    users:defineTable({
        name:v.string(),
        email: v.string(),
        pictureURL: v.string(),
        credits: v.number()
    }),
    videoData:defineTable({
        title:v.string(),
        topic:v.string(),
        script:v.string(),
        videoStyle:v.string(),
        caption:v.string(),
        voice:v.string(),
        images:v.optional(v.any()),
        audioUrl:v.optional(v.string()),
        captionJSON:v.optional(v.string()),
        uid:v.id("users"),
        createdBy:v.string()

    })
})
