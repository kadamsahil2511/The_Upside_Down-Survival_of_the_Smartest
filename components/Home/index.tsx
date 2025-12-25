'use client'

import dynamic from 'next/dynamic'

// Dynamically import the game component to avoid SSR issues with Phaser
const PhaserGame = dynamic(() => import('@/components/game/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#1a0a0a]">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">The Upside Down</h1>
        <p className="text-white">Loading game...</p>
      </div>
    </div>
  ),
})

export function Demo() {
  return (
    <div className="w-full h-full min-h-screen bg-[#1a0a0a]">
      <PhaserGame />
    </div>
  )
}

