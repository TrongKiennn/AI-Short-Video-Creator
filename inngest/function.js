import { generateImageScript } from "@/configs/AiModel";
import { inngest } from "./client";

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
    const GenerateImagePrompts=await step.run(
      "generateImagePrompt",
      async()=>{
        const FINAL_PROMPT=ImagePromptScript
        .replace('{style}',videoStyle).replace('{script',script);
        const result=await generateImageScript.sendMessage(FINAL_PROMPT);
        const resp=JSON.parse(result.response.text());
        return resp;
      }
    )
    //Generate Images using AI

    //Save all Data to DB

  }
)