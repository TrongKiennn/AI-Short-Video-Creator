import { generateImageScript } from '@/configs/AiModel';
import { inngest } from './client';
import axios from 'axios';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com' // Replace with your production domain
    : 'http://localhost:3000';

const ImagePromptScript = `Generate Image prompt of {style} style with all deatils for each scene for 1 minute video : script: {script}
- Just Give specifing image prompt depends on the story line
- do not give camera angle image prompt
- Follow the following schema and return JSON data (Max 8-10 Images)
- [ {
      imagePrompt:'',
      sceneContent: ' <Script Content>'
    }
]`;

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s');
    return { message: `Hello ${event.data.email}!` };
  }
);

export const GenerateVideoData = inngest.createFunction(
  { id: 'generate-video-data' },
  { event: 'generate-video-data' },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, recordId } =
      event?.data;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    //Generate Audio File

    //Generate Caption

    //Generate Images prompt from script
    const GenerateImagePrompts = await step.run(
      'generateImagePrompt',
      async () => {
        const FINAL_PROMPT = ImagePromptScript.replace(
          '{style}',
          videoStyle
        ).replace('{script}', script);

        const result = await generateImageScript.sendMessage(FINAL_PROMPT);
        console.log(result.text);

        try {
          const parsed = JSON.parse(result.text);
          return parsed;
        } catch (e) {
          return {
            error: 'Failed to parse AI response as JSON.',
            rawResponse: result.text,
          };
        }
      }
    );
    //Generate Images using AI

    const GenerateImages = await step.run('generateImages', async () => {
      let images = [];

      try {
        images = await Promise.all(
          GenerateImagePrompts.map(async (element, index) => {
            try {
              console.log(
                `🎨 Generating image ${index + 1}/${GenerateImagePrompts.length} with AIGuruLab`
              );

              // Call AIGuruLab API directly
              const result = await axios.post(
                'https://www.aigurulab.tech/api/generate-image',
                {
                  width: 1024,
                  height: 1024,
                  input: element?.imagePrompt,
                  model: 'sdxl',
                  aspectRatio: '1:1',
                },
                {
                  headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY,
                    'Content-Type': 'application/json',
                  },
                  timeout: 30000, // 30 second timeout
                  maxRedirects: 5, // Follow redirects
                }
              );

              if (result.data && result.data.image) {
                console.log(
                  `✅ Image ${index + 1} generated successfully with AIGuruLab`
                );
                return result.data.image;
              } else {
                console.log(
                  `⚠️ Image ${index + 1} - No image in AIGuruLab response, using fallback`
                );
                return '/default.png';
              }
            } catch (error) {
              console.error(
                `❌ Error generating image ${index + 1}:`,
                error.message
              );
              return '/default.png';
            }
          })
        );

        console.log(`🎯 Generated ${images.length} images total`);
        const realImages = images.filter(
          (img) => img !== '/default.png'
        ).length;
        console.log(
          `🎨 Real AI images: ${realImages}, Fallback images: ${images.length - realImages}`
        );

        return images;
      } catch (error) {
        console.error('❌ Critical error in image generation:', error);

        // Fallback: return default images for all prompts
        const fallbackImages = GenerateImagePrompts.map(() => '/default.png');
        console.log(
          `🔄 Using ${fallbackImages.length} fallback images due to critical error`
        );
        return fallbackImages;
      }
    });

    const UpdateDB = await step.run('UpdateDB', async () => {
      try {
        console.log(
          `💾 Updating database with ${GenerateImages.length} images for record:`,
          recordId
        );

        const result = await convex.mutation(api.videoData.UpdateVideoRecord, {
          recordId: recordId,
          images: GenerateImages,
        });

        console.log(
          '✅ Database updated successfully, video status should now be complete'
        );
        return result;
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        throw dbError; // Re-throw to trigger retry
      }
    });

    //Save all Data to DB
    return 'Executed successfully';
  }
);
