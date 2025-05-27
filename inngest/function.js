import { generateImageScript } from "@/configs/AiModel";
import { inngest } from "./client";
import axios from "axios";

const BASE_URL='https://aigurulab.tech';

const ImagePromptScript=`Generate Image prompt of {style} style with all deatils for each scene for 1 minute video : script: {script}
- Just Give specifing image prompt depends on the story line
- do not give camera angle image prompt
- Follow the following schema and return JSON data (Max 8-10 Images)
- [ {
      imagePrompt:'',
      sceneContent: ' <Script Content>'
    }
]`

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const GenerateVideoData=inngest.createFunction(
  {id:"generate-video-data"},
  {event:"generate-video-data"},
  async({event,step})=>{
    const {script, topic, title, caption, videoStyle, voice}=event?.data;
    //Generate Audio File

    //Generate Caption

    //Generate Images prompt from script
    const GenerateImagePrompts = await step.run(
      "generateImagePrompt",
      async () => {
        const FINAL_PROMPT = ImagePromptScript
          .replace('{style}', videoStyle)
          .replace('{script}', script);

        const result = await generateImageScript.sendMessage(FINAL_PROMPT);
        console.log(result.text);

        try {

          const parsed = JSON.parse(result.text);
          return parsed;
        } catch (e) {
          return {
            error: "Failed to parse AI response as JSON.",
            rawResponse: result.text,
          };
        }
      }
    );
    //Generate Images using AI

    const GenerateImages = await step.run(
      "generateImages",
      async()=>{
        let images=[];
        images=await Promise.all(
          GenerateImagePrompts.map(async(elenment)=>{
            const result = await axios.post(BASE_URL+'/api/generate-image',
            {
                width: 1024,
                height: 1024,
                input: elenment?.imagePrompt,
                model: 'sdxl',//'flux'
                aspectRatio:"1:1"//Applicable to Flux model only
            },
            {
                headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_AIGURULAB_API_KEY, // Your API Key
                    'Content-Type': 'application/json', // Content Type
                },
            })
            console.log(result.data.image) //Output Result: Base 64 Image
            return result.data.image;
          })
        )
        return images;
      }
    );

    //Save all Data to DB
    return GenerateImages
  }
)