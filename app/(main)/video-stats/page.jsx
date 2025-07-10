"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const ChartJS = dynamic(() => import("@/components/ChartJS"), { ssr: false });

function extractVideoId(urlOrId) {
  // Extract video ID from URL or return as is if already ID
  const regex = /(?:v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/;
  const match = urlOrId.match(regex);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  return null;
}

// Helper function to format duration
function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes.padStart(2, '0')}:`;
  result += seconds.padStart(2, '0');
  
  return result;
}

// Helper function to calculate engagement rate
function calculateEngagementRate(views, likes, comments) {
  const totalEngagement = Number(likes) + Number(comments);
  return ((totalEngagement / Number(views)) * 100).toFixed(2);
}

// Helper function to calculate view-to-like ratio
function calculateViewToLikeRatio(views, likes) {
  return (Number(views) / Number(likes)).toFixed(1);
}

// Helper function to calculate days since published
function calculateDaysSincePublished(publishedAt) {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffTime = Math.abs(now - published);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Helper function to calculate average daily views
function calculateAverageDailyViews(views, publishedAt) {
  const days = calculateDaysSincePublished(publishedAt);
  return Math.round(Number(views) / days);
}

// Helper function to extract keywords from text
function extractKeywords(text, limit = 10) {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

// Helper function to analyze sentiment (simple implementation)
function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'awesome', 'amazing', 'love', 'excellent', 'perfect', 'wonderful', 'fantastic', 'brilliant'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing', 'boring', 'stupid', 'useless', 'waste'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positive = 0;
  let negative = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positive++;
    if (negativeWords.includes(word)) negative++;
  });
  
  if (positive > negative) return 'positive';
  if (negative > positive) return 'negative';
  return 'neutral';
}

export default function VideoStatsPage() {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchStats = async (e) => {
    e.preventDefault();
    setError("");
    setStats(null);
    setChannelData(null);
    setComments([]);
    setLoading(true);
    
    const videoId = extractVideoId(input.trim());
    if (!videoId) {
      setError("Vui lòng nhập đúng link hoặc ID video YouTube.");
      setLoading(false);
      return;
    }

    try {
      // Fetch video data
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoId}&key=${API_KEY}`
      );
      const videoData = await videoRes.json();
      
      if (!videoData.items || !videoData.items.length) {
        setError("Không tìm thấy video.");
        setLoading(false);
        return;
      }

      const video = videoData.items[0];
      setStats(video);

      // Fetch channel data
      try {
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${video.snippet.channelId}&key=${API_KEY}`
        );
        const channelData = await channelRes.json();
        if (channelData.items && channelData.items.length > 0) {
          setChannelData(channelData.items[0]);
        }
      } catch (err) {
        console.log("Could not fetch channel data");
      }

      // Fetch comments (limited to 100 for performance)
      try {
        const commentsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&key=${API_KEY}`
        );
        const commentsData = await commentsRes.json();
        if (commentsData.items) {
          setComments(commentsData.items);
        }
      } catch (err) {
        console.log("Could not fetch comments");
      }

    } catch (err) {
      setError("Có lỗi xảy ra khi lấy dữ liệu.");
    }
    setLoading(false);
  };

  // Calculate additional metrics
  const daysSincePublished = stats ? calculateDaysSincePublished(stats.snippet.publishedAt) : 0;
  const averageDailyViews = stats ? calculateAverageDailyViews(stats.statistics.viewCount, stats.snippet.publishedAt) : 0;
  const commentKeywords = comments.length > 0 ? extractKeywords(comments.map(c => c.snippet.topLevelComment.snippet.textDisplay).join(' ')) : [];
  const sentimentAnalysis = comments.length > 0 ? comments.map(c => analyzeSentiment(c.snippet.topLevelComment.snippet.textDisplay)) : [];

  const positiveComments = sentimentAnalysis.filter(s => s === 'positive').length;
  const negativeComments = sentimentAnalysis.filter(s => s === 'negative').length;
  const neutralComments = sentimentAnalysis.filter(s => s === 'neutral').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 rounded-2xl via-yellow-50 via-blue-100 to-purple-100 rounded-2xl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-md mb-4">
            YouTube Video Analytics
          </h1>
          <p className="text-lg text-gray-700">
            Phân tích chuyên sâu video YouTube của bạn
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-10">
          <form onSubmit={fetchStats} className="flex gap-4 shadow-lg rounded-full p-2 bg-white/50 backdrop-blur-sm">
            <input
              type="text"
              placeholder="Nhập link hoặc ID video YouTube..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-5 py-3 bg-transparent border-none rounded-full focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-500"
            />
            <button 
              type="submit" 
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full transition-all duration-300 shadow-md"
              disabled={loading}
            >
              {loading ? '...' : 'Phân tích'}
            </button>
          </form>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
            <p className="mt-3 text-gray-600">Đang tải dữ liệu chi tiết...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-100/80 backdrop-blur-sm border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {stats && (
          <div className="space-y-8">
            {/* Video Section */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {stats.snippet.title}
                </h2>
                
                {/* Video Player Placeholder */}
                <div className="relative w-full mb-6">
                  <div className="aspect-video bg-gray-900/10 rounded-lg overflow-hidden">
                    <img 
                      src={stats.snippet.thumbnails.high?.url || stats.snippet.thumbnails.medium.url} 
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Basic Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {Number(stats.statistics.viewCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Lượt xem</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Number(stats.statistics.likeCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Lượt thích</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Number(stats.statistics.commentCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Bình luận</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatDuration(stats.contentDetails.duration)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Thời lượng</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                {channelData && (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                  Thông tin Kênh
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">
                      {Number(channelData.statistics.subscriberCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Subscribers</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {Number(channelData.statistics.videoCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Number(channelData.statistics.viewCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center p-4 bg-white/50 dark:bg-white/10 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(Number(channelData.statistics.viewCount) / Number(channelData.statistics.videoCount)).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Views/Video</div>
                  </div>
                </div>
              </div>
            )}

                {/* Video Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Kênh: </span>
                      <span className="text-gray-900 dark:text-white">{stats.snippet.channelTitle}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Ngày đăng: </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(stats.snippet.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Danh mục: </span>
                      <span className="text-gray-900 dark:text-white">{stats.snippet.categoryId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Ngôn ngữ: </span>
                      <span className="text-gray-900 dark:text-white">{stats.snippet.defaultLanguage || 'Không xác định'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Analytics */}
            {channelData && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Thông tin Kênh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {Number(channelData.statistics.subscriberCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Subscribers</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {Number(channelData.statistics.videoCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Videos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {Number(channelData.statistics.viewCount).toLocaleString()}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Total Views</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {Math.round(Number(channelData.statistics.viewCount) / Number(channelData.statistics.videoCount)).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Avg Views/Video</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'comments', 'analytics', 'insights'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab === 'overview' && 'Tổng quan'}
                      {tab === 'comments' && 'Bình luận'}
                      {tab === 'analytics' && 'Phân tích'}
                      {tab === 'insights' && 'Insights'}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Bar Chart */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Biểu đồ cột: Thống kê tương tác
                        </h4>
                        <div className="h-80">
                          <ChartJS
                            type="bar"
                            data={{
                              labels: ["Lượt xem", "Like", "Bình luận"],
                              datasets: [
                                {
                                  label: "Số lượng",
                                  data: [
                                    Number(stats.statistics.viewCount),
                                    Number(stats.statistics.likeCount),
                                    Number(stats.statistics.commentCount)
                                  ],
                                  backgroundColor: ["#3b82f6", "#22c55e", "#eab308"],
                                  borderRadius: 8,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { 
                                legend: { display: false },
                                title: {
                                  display: true,
                                  text: 'Thống kê tương tác',
                                  color: '#374151',
                                  font: { size: 16, weight: 'bold' }
                                }
                              },
                              scales: { 
                                y: { 
                                  beginAtZero: true,
                                  grid: { color: '#e5e7eb' }
                                },
                                x: { grid: { display: false } }
                              },
                            }}
                          />
                        </div>
                      </div>

                      {/* Doughnut Chart */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Biểu đồ tròn: Phân bố tương tác
                        </h4>
                        <div className="h-80">
                          <ChartJS
                            type="doughnut"
                            data={{
                              labels: ["Lượt xem", "Like", "Bình luận"],
                              datasets: [
                                {
                                  label: "Tỉ lệ",
                                  data: [
                                    Number(stats.statistics.viewCount),
                                    Number(stats.statistics.likeCount),
                                    Number(stats.statistics.commentCount)
                                  ],
                                  backgroundColor: ["#3b82f6", "#22c55e", "#eab308"],
                                  borderWidth: 2,
                                  borderColor: '#ffffff'
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { 
                                legend: { 
                                  position: 'bottom',
                                  labels: { padding: 20, usePointStyle: true }
                                },
                                title: {
                                  display: true,
                                  text: 'Phân bố tương tác',
                                  color: '#374151',
                                  font: { size: 16, weight: 'bold' }
                                }
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Performance Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Tỷ lệ tương tác</div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {calculateEngagementRate(stats.statistics.viewCount, stats.statistics.likeCount, stats.statistics.commentCount)}%
                        </div>
                        <div className="text-xs text-blue-500 dark:text-blue-400">(Like + Comment) / Views</div>
                      </div>
                      
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">Tỷ lệ like</div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {((Number(stats.statistics.likeCount) / Number(stats.statistics.viewCount)) * 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-green-500 dark:text-green-400">Likes / Views</div>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Tỷ lệ comment</div>
                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {((Number(stats.statistics.commentCount) / Number(stats.statistics.viewCount)) * 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-yellow-500 dark:text-yellow-400">Comments / Views</div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Thời lượng</div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {formatDuration(stats.contentDetails.duration)}
                        </div>
                        <div className="text-xs text-purple-500 dark:text-purple-400">Video duration</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    {comments.length > 0 ? (
                      <>
                        {/* Comments Sentiment Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {positiveComments}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">Bình luận tích cực</div>
                          </div>
                          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                              {negativeComments}
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400">Bình luận tiêu cực</div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                              {neutralComments}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Bình luận trung tính</div>
                          </div>
                        </div>

                        {/* Top Keywords */}
                        {commentKeywords.length > 0 && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                              Từ khóa phổ biến trong bình luận
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {commentKeywords.slice(0, 10).map((keyword, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                                >
                                  {keyword.word} ({keyword.count})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            Bình luận gần đây ({comments.length})
                          </h4>
                          {comments.slice(0, 10).map((comment, index) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <img
                                  src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl}
                                  alt="avatar"
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {comment.snippet.topLevelComment.snippet.authorDisplayName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.snippet.topLevelComment.snippet.publishedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                                    {comment.snippet.topLevelComment.snippet.textDisplay}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>👍 {comment.snippet.topLevelComment.snippet.likeCount}</span>
                                    <span>💬 {comment.snippet.totalReplyCount || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Không có bình luận nào hoặc bình luận bị tắt
                      </div>
                    )}
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Time-based Analytics */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Phân tích theo thời gian
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Lượt xem trung bình/ngày</div>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {averageDailyViews.toLocaleString()}
                            </div>
                          </div>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">Ngày đã đăng</div>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {daysSincePublished} ngày
                            </div>
                          </div>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Tỷ lệ xem/like</div>
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                              {calculateViewToLikeRatio(stats.statistics.viewCount, stats.statistics.likeCount)}:1
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Comparison */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          So sánh hiệu suất
                        </h4>
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Tỷ lệ tương tác</div>
                            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                              {calculateEngagementRate(stats.statistics.viewCount, stats.statistics.likeCount, stats.statistics.commentCount)}%
                            </div>
                            <div className="text-xs text-yellow-500 dark:text-yellow-400">
                              {calculateEngagementRate(stats.statistics.viewCount, stats.statistics.likeCount, stats.statistics.commentCount) > 5 ? 'Tuyệt vời' : 
                               calculateEngagementRate(stats.statistics.viewCount, stats.statistics.likeCount, stats.statistics.commentCount) > 2 ? 'Tốt' : 'Cần cải thiện'}
                            </div>
                          </div>
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Hiệu suất video</div>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                              {Math.round((Number(stats.statistics.viewCount) / 1000000) * 100)}%
                            </div>
                            <div className="text-xs text-indigo-500 dark:text-indigo-400">So với 1M views</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insights Tab */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recommendations */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Khuyến nghị cải thiện
                        </h4>
                        <div className="space-y-3">
                          {calculateEngagementRate(stats.statistics.viewCount, stats.statistics.likeCount, stats.statistics.commentCount) < 2 && (
                            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Tỷ lệ tương tác thấp. Hãy tạo nội dung hấp dẫn hơn và khuyến khích người xem tương tác.
                              </p>
                            </div>
                          )}
                          {Number(stats.statistics.commentCount) < Number(stats.statistics.likeCount) * 0.1 && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                Ít bình luận. Hãy đặt câu hỏi và khuyến khích thảo luận trong video.
                              </p>
                            </div>
                          )}
                          {daysSincePublished > 30 && averageDailyViews < 1000 && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded">
                              <p className="text-sm text-red-800 dark:text-red-200">
                                Video cũ và ít lượt xem. Cân nhắc tạo nội dung mới hoặc quảng cáo lại.
                              </p>
                            </div>
                          )}
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 rounded">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              Thời lượng video {formatDuration(stats.contentDetails.duration)} phù hợp cho nội dung ngắn.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content Analysis */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Phân tích nội dung
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Tiêu đề:</strong> {stats.snippet.title.length > 50 ? 'Tiêu đề dài, có thể tối ưu' : 'Tiêu đề có độ dài phù hợp'}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Mô tả:</strong> {stats.snippet.description.length > 100 ? 'Mô tả chi tiết' : 'Mô tả ngắn gọn'}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>Tags:</strong> {stats.snippet.tags ? `${stats.snippet.tags.length} tags` : 'Không có tags'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
