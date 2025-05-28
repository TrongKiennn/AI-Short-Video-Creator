// Fetches trending topics from a free third-party API (e.g., Google Trends via a public proxy or similar)
import axios from 'axios';
import { NextResponse } from 'next/server';

// Example: Using a public trending topics API (replace with a real one if needed)
const TRENDING_API_URL = 'https://api.gtrends.app/trends?geo=US';

export async function GET() {
  try {
    const { data } = await axios.get(TRENDING_API_URL);
    // Assume the API returns an array of trending topics in data.trends
    const topics = data.trends?.map((t) => t.title) || [];
    return NextResponse.json({ topics });
  } catch (e) {
    return NextResponse.json({ topics: [], error: e.message });
  }
}
