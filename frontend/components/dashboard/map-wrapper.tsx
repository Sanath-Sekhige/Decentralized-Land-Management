'use client'

import dynamic from 'next/dynamic'

const MapSection = dynamic(() => import('./map-section'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-900 border border-purple-500/30 rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
})

export default function MapWrapper() {
  return <MapSection />
}
