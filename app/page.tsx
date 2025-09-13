'use client'

import { setRequestMeta } from "next/dist/server/request-meta";
import { useEffect, useState } from "react";

declare global{
  interface Window {
    Telegram?: {
      WebApp?: any
    }
  }
}

export default function Home () {
  const [isChannelMember, setChannelMember] = useState<Boolean | null> (null);
  const [isLoading, setIsLoading] = useState(false);
  const [TelegramId, setTelegramId] = useState<String| null>(null);
  const [channelUsername, setChannelUsername] = useState('');
  const [error, setError] = useState<Boolean| null>(null);

  useEffect(() => {
    if(window.Telegram?.WebApp) {
      const initDataString = window.Telegram.WebApp.initData;
      if(initDataString) {
        const urlParams = new URLSearchParams(initDataString);
        try {
          const user = JSON.parse(urlParams.get('user') || '{}');
          if(user.id){
            setTelegramId(user.id.toString())
          }
        }catch (error) {
          console.error('Error parsing data', error);
        }
      }
    }
  }, []);

  const checkChannelMembership = async () => {
    if(!TelegramId) {
      alert('This app can only be use Telegram ');
      return
    }

    if(!channelUsername) {
      alert('Please enter username');
      return
    }

    setIsLoading(true);

  try {
    const response = await fetch('/api/check-membership', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        TelegramId,
        channelUsername
      }) 
    })
     
    if(!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check membership')
    }

    const data = await response.json()
    setChannelMember(data.isMember);
    setError(null);
    
  } catch (error) {
    console.error('Error checking channel membership', error);
    setChannelMember(false);
    setError(error instanceof Error)
  }finally {
    setIsLoading(false)
  }

  }

  if(!TelegramId) {
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4x1 font-bold mb-8">Telegram membership check</h1>
      <p className="text-xl">This app can only be used whitchin telegram</p>
    </main>
  }

 

  return(
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4x1 font-bold mb-8">Telegram channel membership check</h1>
      <input
        type="text"
        value={channelUsername}
        onChange={(e) => setChannelUsername(e.target.value)}
        placeholder="Enter channel username @example"
        className="mb-4 p-2 border border-gray-300 rounded w-full max-w-xs"
      />
      <button
        onClick={checkChannelMembership}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={isLoading || !channelUsername}
      >
        {isLoading ? 'Checking... ': 'Check membership'}
      </button>
      {error && <p className="mt-4 text-red-500">{false}</p>}
      {isChannelMember !== null && !isLoading && (
        <p className="mt-4 text-xl">
          {isChannelMember? 'You are member of the channel' : 'You are not member the channel'}
        </p>
      )}
    </main>
  )
} 