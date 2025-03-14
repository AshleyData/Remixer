import { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `Please remix the following text in a creative and interesting way. Make it engaging while keeping the core message intact: ${inputText}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      setOutputText(data.content?.[0]?.text || 'No content received from the API.');
    } catch (error) {
      console.error('Detailed error:', error)
      if (error instanceof Error) {
        setOutputText(`Error: ${error.message}`)
      } else {
        setOutputText('Error remixing content. Please check your API key and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Content Remixer</h1>
        
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Input Text</h2>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Remix Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Remixing...' : 'Remix Content'}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Remixed Output</h2>
            <div className="w-full min-h-[8rem] p-3 border border-gray-300 rounded-md bg-gray-50 whitespace-pre-wrap">
              {outputText || 'Your remixed content will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
