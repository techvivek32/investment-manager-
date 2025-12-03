'use client'

import type React from 'react'

interface MapProps {
  latitude: number
  longitude: number
  zoom?: number
  height?: number
}

export default function Map({ latitude, longitude, zoom = 15, height = 280 }: MapProps) {
  const delta = 0.01
  const left = longitude - delta
  const right = longitude + delta
  const top = latitude + delta
  const bottom = latitude - delta
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`
  const link = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <iframe
        title="location-map"
        width="100%"
        height={height}
        frameBorder="0"
        scrolling="no"
        src={src}
      />
      <div className="p-2 text-xs text-gray-500 bg-gray-50">
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600">View Larger Map</a>
      </div>
    </div>
  )
}

