import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

interface SavedTweet {
  id: number
  content: string
  created_at: string
}

interface EditDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (content: string) => void
  initialContent: string
}

function EditDialog({ isOpen, onClose, onSave, initialContent }: EditDialogProps) {
  const [editedContent, setEditedContent] = useState(initialContent)
  const [charCount, setCharCount] = useState(initialContent.length)

  useEffect(() => {
    if (isOpen) {
      setEditedContent(initialContent)
      setCharCount(initialContent.length)
    }
  }, [isOpen, initialContent])

  const handleSave = () => {
    onSave(editedContent)
    onClose()
  }

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">Edit Tweet</h3>
        <textarea
          value={editedContent}
          onChange={(e) => {
            setEditedContent(e.target.value)
            setCharCount(e.target.value.length)
          }}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
        />
        <div className="flex justify-between items-center">
          <span className={`text-sm ${charCount > 280 ? 'text-red-500' : 'text-gray-500'}`}>
            {charCount}/280 characters
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={charCount > 280}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null
}

function App() {
  const [inputText, setInputText] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentEditTweet, setCurrentEditTweet] = useState('')

  useEffect(() => {
    fetchSavedTweets()
  }, [])

  const fetchSavedTweets = async () => {
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching saved tweets:', error)
      return
    }

    setSavedTweets(data || [])
  }

  const handleSaveTweet = async (content: string) => {
    const { error } = await supabase
      .from('saved_tweets')
      .insert([{ content }])
    
    if (error) {
      console.error('Error saving tweet:', error)
      return
    }

    fetchSavedTweets()
  }

  const handleDeleteSavedTweet = async (id: number) => {
    const { error } = await supabase
      .from('saved_tweets')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting tweet:', error)
      return
    }

    fetchSavedTweets()
  }

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

  const handleEditAndSave = (content: string) => {
    handleSaveTweet(content)
  }

  const openEditDialog = (tweet: string) => {
    setCurrentEditTweet(tweet)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1">
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditDialog(tweet)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                              title="Edit tweet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleSaveTweet(tweet)}
                              className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                              title="Save tweet"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <a 
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                              title="Post to Twitter"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                              </svg>
                            </a>
                          </div>
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

      {/* Saved Tweets Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-96' : 'w-12'
        } overflow-hidden`}
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-8 -left-3 bg-white p-2 rounded-l-lg shadow-md hover:bg-gray-50 transition-colors ${
            isSidebarOpen ? '' : 'rotate-180'
          }`}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg 
            className="w-4 h-4 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Fixed-width content container */}
        <div className="w-96">
          <div className={`h-full flex flex-col transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Saved Tweets</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {savedTweets.map((tweet) => (
                  <div 
                    key={tweet.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">{tweet.content}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(tweet.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditDialog(tweet.content)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit tweet"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSavedTweet(tweet.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete tweet"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet.content)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Post to Twitter"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {savedTweets.length === 0 && (
                  <p className="text-center text-gray-500">No saved tweets yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleEditAndSave}
        initialContent={currentEditTweet}
      />
    </div>
  )
}

export default App

