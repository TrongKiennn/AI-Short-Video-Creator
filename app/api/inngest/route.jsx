import { inngest } from "@/inngest/client";
import { GenerateVideoData } from "@/inngest/function";
import { serve } from "inngest/next";


// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    GenerateVideoData
  ],
});
