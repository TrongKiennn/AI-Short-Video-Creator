'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { SparkleIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const originalSuggestions = [
  'Historic Story',
  'Kids Story',
  'Motivational Story',
  'Funny Story',
  'AI Innovation',
  'AI in Education',
  'Horror Story',
  'Tech Breakthrough',
  'AI in Healthcare',
  'True Crime Story',
  'Fantasy Adventure',
  'Science Fiction',
  'Animal Story',
  'Space Mystery',
];

function Topic({ onHandleInputChange }) {
  const [selectedTopic, setselectTopic] = useState();
  const [selectedScriptIndex, setSelectedScriptIndex] = useState();
  const [scripts, setScript] = useState();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(originalSuggestions);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Function to normalize text for duplicate comparison (lowercase)
  const normalizeForComparison = (text) => {
    return text
      .replace(/^[,\-.\s]+|[,\-.\s]+$/g, '') // Remove specific punctuation (comma, hyphen, period, space) from start/end
      .toLowerCase()
      .trim();
  };

  // Function to normalize and remove duplicates while preserving order
  const normalizeAndRemoveDuplicates = (apiTopics, originalTopics) => {
    const seen = new Set();

    // Add API topics first (normalized for duplicate checking)
    apiTopics.forEach((topic) => {
      const normalized = normalizeForComparison(topic);
      if (normalized) {
        seen.add(normalized);
      }
    });

    // Add original topics if they don't duplicate API topics
    originalTopics.forEach((topic) => {
      const normalized = normalizeForComparison(topic);
      if (normalized) {
        seen.add(normalized);
      }
    });

    // Convert Set back to array and capitalize first letter for display
    return Array.from(seen).map(
      (topic) => topic.charAt(0).toUpperCase() + topic.slice(1)
    );
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
    setLoading(true);
    setselectTopic(null);
    setSelectedScriptIndex(null);
    try {
      const result = await axios.post('/api/generate_script', {
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
    fetchTrendingTopics();
  }, []);

  return (
    <div>
      <h2 className="mb-1">Project Title</h2>
      <Input
        placeholder="Enter your project title"
        onChange={(event) => onHandleInputChange('title', event.target.value)}
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
                    setselectTopic(suggestion);
                    onHandleInputChange('topic', suggestion);
                    console.log(selectedTopic);
                    console.log(suggestion);
                  }}
                  className={`m-1 ${suggestion === selectedTopic && 'bg-secondary text-white'}`}
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
                  onHandleInputChange('topic', event.target.value)
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
                  ${selectedScriptIndex == index && 'border-white bg-secondary'}
                `}
                  onClick={() => {
                    console.log('Selected index:', index);
                    onHandleInputChange('script', item.content);
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
