import { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3002/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: inputText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      const tweetText = data.content?.[0]?.text || '';
      // Split the text by '|||' and clean up each tweet
      const separatedTweets = tweetText
        .split('|||')
        .map((tweet: string) => tweet.trim())
        .filter(Boolean)
        .map((tweet: string) => tweet.replace(/^\d+\.\s*/, '')); // Remove numbers at start of tweets
      setTweets(separatedTweets);
    } catch (error) {
      console.error('Detailed error:', error)
      if (error instanceof Error) {
        setTweets([`Error: ${error.message}`])
      } else {
        setTweets(['Error remixing content. Please check your API key and try again.'])
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Tweet Generator</h1>
        
        <div className="space-y-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg w-full">
            <div className="p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-700">Blog Post</h2>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your blog post here..."
                className="w-full h-40 p-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
              className="px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg shadow-md"
            >
              {isLoading ? 'Generating...' : 'Generate Tweets'}
            </button>
          </div>

          {/* Tweets Section */}
          {tweets.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg w-full">
              <div className="p-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-700">Generated Tweets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {tweets.map((tweet, index) => (
                    <div 
                      key={index}
                      className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow"
                    >
                      <p className="text-gray-800 whitespace-pre-wrap text-base">{tweet}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {tweet.length}/280 characters
                        </span>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Tweet
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
