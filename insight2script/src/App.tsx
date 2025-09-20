import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { Atom } from 'react-loading-indicators';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [trendData, setTrendData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password state
  const [password, setPassword] = useState('');
  const [verified, setVerified] = useState(false);

  const correctPassword = import.meta.env.VITE_APP_PASSWORD;

  const handleVerify = () => {
    if (password === correctPassword) {
      setVerified(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !verified) return;

    setIsLoading(true);
    setContent('');
    setTrendData(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || '');
        setTrendData(data.trend_data || null);
      } else {
        setContent('Error generating content. Please try again.');
      }
    } catch (error) {
      setContent(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && verified) {
      e.preventDefault();
      handleGenerate();
    }
  };

  // Convert yearwise values to chart data
  const chartData = trendData
    ? [
        { year: '2018', score: trendData.score_2018 },
        { year: '2019', score: trendData.score_2019 },
        { year: '2020', score: trendData.score_2020 },
        { year: '2021', score: trendData.score_2021 },
        { year: '2022', score: trendData.score_2022 },
        { year: '2023', score: trendData.score_2023 },
        { year: '2024', score: trendData.score_2024 },
        { year: '2025', score: trendData.score_2025 },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative">

      {/* Password Overlay */}
      {!verified && (
        <div className="password-container flex flex-col items-center justify-center min-h-screen bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Enter Password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 px-4 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleVerify}
              className="w-full h-12 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {/* Main App Content (blurred until verified) */}
      <div className={`${!verified ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Insight2Script</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Prompt Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-6 shadow-lg mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Enter your prompt</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={verified ? "Describe what you'd like to generate..." : "Enter password to unlock..."}
                className="w-full h-32 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition-all"
                disabled={isLoading || !verified}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isLoading || !verified}
                  className="disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {isLoading ? 'Generating...' : 'Generate Content'}
                </button>
              </div>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center p-6">
              <Atom color="#5dcee5" size="medium" text="" textColor="" />
            </div>
          )}

          {/* Results */}
          {!isLoading && (trendData || content) && (
            <div className="space-y-6">
              {/* Trend Data */}
              {trendData && (
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Trend Analysis</h3>

                  <p className="mb-2">
                    <strong>Trendiness Score:</strong> {trendData.score ?? 'N/A'}
                  </p>

                  <p className="mb-4">
                    <strong>Reasoning:</strong> {trendData.reasoning ?? 'No reasoning available.'}
                  </p>

                  {/* Chart */}
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#82ca9d" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No trend data available.</p>
                  )}
                </div>
              )}

              {/* Generated Content */}
              {content && (
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-blue-200/50 shadow-lg animate-fadeIn p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Generated Content
                  </h3>
                  <div className="bg-white/60 rounded-xl p-6 border border-blue-100">
                    <pre className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed">{content}</pre>
                  </div>
                  <div className="border-t border-blue-100 p-4 bg-blue-50/50 rounded-b-2xl">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Content generated successfully</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(content)}
                        className="copy-button font-medium transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!content && !trendData && !isLoading && verified && (
            <div className="bg-white/30 backdrop-blur-sm rounded-2xl border border-blue-200/30 p-12 text-center">
              <FileText className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to generate content</h3>
              <p className="text-gray-500">Enter a prompt above and click "Generate Content" to get started</p>
            </div>
          )}
        </main>

        <footer className="bg-white/70 text-center py-4 border-t border-gray-200 text-sm text-gray-600">
          © {new Date().getFullYear()} Insight2Script. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default App;
