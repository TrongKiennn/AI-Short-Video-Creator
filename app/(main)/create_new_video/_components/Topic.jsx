"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { SparkleIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const suggestions = [
  "Historic Story",
  "Kids Story",
  "Motivational Story",
  "Funny Story",
  "AI Innovation",
  "AI in Education",
  "Horror Story",
  "Tech Brreakthrough",
  "AI in Healthcare",
  "True Crime Story",
  "Fantasy Adventure",
  "Science Fiction",
  "Animal Story",
  "Space Mystery",
];

function Topic({ onHandleInputChange }) {
  const [selectedTopic, setselectTopic] = useState();
  const [selectedScriptIndex, setSelectedScriptIndex] = useState();
  const [scripts, setScript] = useState();
  const [loading, setLoading] = useState(false);

  const GenerateScript = async () => {
    setLoading(true);
    setselectTopic(null);
    setSelectedScriptIndex(null);
    try {
      const result = await axios.post("/api/generate_script", {
        topic: selectedTopic,
      });
      console.log(result.data);
      setScript(result.data?.scripts);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    
  }, [selectedTopic]);

  return (
    <div>
      <h2 className="mb-1">Project Title</h2>
      <Input
        placeholder="Enter your project title"
        onChange={(event) => onHandleInputChange("title", event.target.value)}
      />
      <div className="mt-5">
        <h2>Video Topic</h2>
        <p className="text-sm text-gray-600">Select topic for your video</p>

        <Tabs defaultValue="suggestion" className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            <TabsTrigger value="your_topic">Your Topic</TabsTrigger>
          </TabsList>
          <TabsContent value="suggestion">
            <div>
              {suggestions.map((suggestion, index) => (
                <Button
                  variant="outline"
                  key={index}
                  
                  onClick={() => {
                 
                    setselectTopic(suggestion);
                    onHandleInputChange("topic", suggestion);
                    console.log(selectedTopic)
                    console.log(suggestion)
                  }}
                  className={`m-1 ${suggestion === selectedTopic && 'bg-secondary text-white !bg-secondary' }` }
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="your_topic">
            <div>
              <h2 className="mb-1">Enter your own topic</h2>
              <Textarea
                placeholder="Enter your topic"
                onChange={(event) =>
                  onHandleInputChange("topic", event.target.value)
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        {scripts?.length > 0 && (
          <div>
            <div className="grid grid-cols-2 gap-5">
              {scripts.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg mt-3 cursor-pointer
                  ${selectedScriptIndex == index && "border-white bg-secondary"}
                `}
                  onClick={() => {
                    console.log("Selected index:", index);
                    onHandleInputChange('script',item.content)
                    setSelectedScriptIndex(index);
                  }}
                >
                  <h2 className="text-sm text-gray-300">{item.content}</h2>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Button
        className="mt-3"
        size="sm"
        onClick={GenerateScript}
        disabled={loading}
      >
        {loading ? <Loader2Icon className="animate-spin" /> : <SparkleIcon />}
        Generate Script
      </Button>
    </div>
  );
}

export default Topic;
