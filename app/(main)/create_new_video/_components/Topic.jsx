'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { SparkleIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const originalSuggestions = [
  'HISTORIC STORY',
  'KIDS STORY',
  'MOTIVATIONAL STORY',
  'FUNNY STORY',
  'AI INNOVATION',
  'AI IN EDUCATION',
  'HORROR STORY',
  'TECH BREAKTHROUGH',
  'AI IN HEALTHCARE',
  'TRUE CRIME STORY',
  'FANTASY ADVENTURE',
  'SCIENCE FICTION',
  'ANIMAL STORY',
  'SPACE MYSTERY',
];

function Topic({ onHandleInputChange }) {
  const [selectedTopic, setselectTopic] = useState();
  const [selectedScriptIndex, setSelectedScriptIndex] = useState();
  const [scripts, setScript] = useState();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(originalSuggestions);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [writingStyle, setWritingStyle] = useState('');

  // Function to normalize text for duplicate comparison (lowercase)
  const normalizeForComparison = (text) => {
    return text
      .replace(/^[,\-.\s—)?!]+|[,\-.\s—(]+$/g, '') // Remove specific punctuation (comma, hyphen, period, space) from start/end
      .toUpperCase() // Normalize to uppercase for case-insensitive comparison
      .trim();
  };

  // Function to normalize and remove duplicates while preserving order (API topics prioritized)
  const normalizeAndRemoveDuplicates = (apiTopics, originalTopics) => {
    const seen = new Set();
    const result = [];

    // Add API topics first (prioritized)
    apiTopics.forEach((topic) => {
      const normalized = normalizeForComparison(topic);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        result.push(normalized);
      }
    });

    // Add original topics only if they don't duplicate API topics (no normalization needed - already clean)
    originalTopics.forEach((topic) => {
      if (!seen.has(topic)) {
        // Original topics are already normalized (uppercase, clean)
        seen.add(topic);
        result.push(topic);
      }
    });

    return result;
  };

  const fetchTrendingTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await axios.get('/api/trending_topics');
      if (
        response.data &&
        response.data.topics &&
        response.data.topics.length > 0
      ) {
        // Combine trending topics with original suggestions, removing duplicates
        const combinedSuggestions = normalizeAndRemoveDuplicates(
          response.data.topics,
          originalSuggestions
        );
        setSuggestions(combinedSuggestions);
      } else {
        // If API returns empty or invalid data, use original suggestions
        setSuggestions(originalSuggestions);
      }
    } catch (error) {
      console.error('Failed to fetch trending topics:', error);
      // Keep original suggestions if API fails
      setSuggestions(originalSuggestions);
    }
    setLoadingTopics(false);
  };

  const GenerateScript = async () => {
    if (!selectedTopic) {
      alert('Please select a topic first');
      return;
    }

    setLoading(true);
    setSelectedScriptIndex(null);
    try {
      const result = await axios.post('/api/generate_script', {
        topic: selectedTopic,
        writingStyle: writingStyle.trim(),
      });
      setScript(result.data?.scripts);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  return (
    <div>
      <h2 className="mb-1 text-black text-xl font-bold">Project Title</h2>
      <Input
        className="shadow-amber-950 text-black"
        placeholder="Enter your project title"
        onChange={(event) => onHandleInputChange('title', event.target.value)}
      />
      <div className="mt-5">
        <h2 className="text-xl font-bold text-black">Video Topic</h2>
        <p className="text-sm mb-1 text-gray-500">
          Select topic for your video
        </p>

        <Tabs defaultValue="suggestion" className="w-full mt-2">
          <TabsList className="flex gap-2 bg-gray-100 p-1 rounded-md shadow-sm">
            <TabsTrigger
              value="suggestion"
              className="px-4 py-3 rounded-md font-medium text-sm transition-all duration-300
                text-gray-700 bg-white
                hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-400 hover:text-white
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              🔥 Trending Keywords
            </TabsTrigger>

            <TabsTrigger
              value="your_topic"
              className="px-4 py-3 rounded-md font-medium text-sm transition-all duration-300
                text-gray-700 bg-white
                hover:bg-gradient-to-r hover:from-pink-400 hover:to-orange-400 hover:text-white
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              ✏️ Your Topic
            </TabsTrigger>
          </TabsList>
          <TabsContent value="suggestion">
            <div>
              {loadingTopics && (
                <div className="flex items-center justify-center p-4">
                  <Loader2Icon className="animate-spin mr-2" />
                  <span className="text-sm text-gray-500">
                    Loading trending topics...
                  </span>
                </div>
              )}
              {suggestions.map((suggestion, index) => (
                <Button
                  variant="outline"
                  key={index}
                  onClick={() => {
                    if (suggestion === selectedTopic) {
                      // If the same topic is clicked, unselect it
                      setselectTopic(null);
                      onHandleInputChange('topic', '');
                    } else {
                      // Select the new topic
                      setselectTopic(suggestion);
                      onHandleInputChange('topic', suggestion);
                    }
                  }}
                  className={`m-1 cursor-pointer border-2 transition-all duration-200 rounded-lg 
                    ${
                      suggestion === selectedTopic
                        ? 'bg-yellow-300 text-black font-bold shadow-lg'
                        : 'bg-white text-gray-800 hover:bg-gray-100 hover:text-purple-600 hover:shadow-md'
                    }`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="your_topic">
            <div>
              <h2 className="mb-1 text-black text-sm">Enter your own topic</h2>
              <Textarea
                className="text-black shadow-amber-950"
                placeholder="Enter your topic"
                onChange={(event) => {
                  const topic = event.target.value;
                  onHandleInputChange('topic', topic);
                  setselectTopic(topic);
                }}
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
                  className={`p-4 border-2 rounded-xl mt-3 cursor-pointer transition-all duration-300 
            ${
              selectedScriptIndex === index
                ? 'bg-gradient-to-r from-purple-200 to-pink-200 text-black shadow-lg border-transparent'
                : 'bg-white text-gray-500 hover:bg-gray-100 hover:shadow-md'
            }`}
                  onClick={() => {
                    onHandleInputChange('script', item.content);
                    setSelectedScriptIndex(index);
                  }}
                >
                  <h2 className="text-sm font-medium">{item.content}</h2>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Writing Style Input */}
      <div className="mt-4">
        <h2 className="mb-2 text-black text-sm font-medium">
          Writing Style (Optional)
        </h2>
        <p className="text-xs mb-2 text-gray-500">
          Customize the writing style for your script (e.g., "conversational",
          "professional", "humorous", "dramatic")
        </p>
        <Input
          className="shadow-amber-950 text-black"
          placeholder="Enter writing style (optional)"
          value={writingStyle}
          onChange={(event) => setWritingStyle(event.target.value)}
        />
      </div>

      <Button
        className={` mt-3 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 
    bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:from-purple-600 hover:to-pink-600 hover:shadow-lg`}
        size="sm"
        onClick={GenerateScript}
        disabled={loading || !selectedTopic}
      >
        {loading ? <Loader2Icon className="animate-spin" /> : <SparkleIcon />}
        Generate Script
      </Button>
    </div>
  );
}

export default Topic;
