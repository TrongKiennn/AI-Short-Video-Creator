import React from 'react'
import VideoList from './_components/VideoList'

function Dashboard() {
  return (
    <div>
      <h2 className='font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 drop-shadow-md'>My Video</h2>
      <VideoList/>
    </div>
    
  )
}

export default Dashboard