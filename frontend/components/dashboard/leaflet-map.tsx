import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Custom icon for center location
const centerIcon = new L.DivIcon({
  html: `
    <div style="position: relative;">
      <div style="
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #a855f7, #6366f1);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.6);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      </style>
    </div>
  `,
  className: 'custom-center-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// Custom icons for assets based on type
const createAssetIcon = (type: string, status: string) => {
  const colors: Record<string, string> = {
    commercial: '#3b82f6',
    residential: '#10b981',
    'mixed-use': '#f59e0b',
  }
  
  const statusColors: Record<string, string> = {
    available: '#10b981',
    pending: '#f59e0b',
    sold: '#6b7280',
  }
  
  const color = colors[type.toLowerCase()] || '#a855f7'
  const statusColor = statusColors[status.toLowerCase()] || '#10b981'
  
  return new L.DivIcon({
    html: `
      <div style="position: relative; cursor: pointer;">
        <div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: ${statusColor};
            border-radius: 50%;
            transform: rotate(45deg);
            box-shadow: 0 0 8px ${statusColor};
          "></div>
        </div>
      </div>
    `,
    className: 'custom-asset-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

function MapController({ center, zoom, onClick }: { 
  center: [number, number]; 
  zoom: number;
  onClick: (lat: number, lng: number) => void 
}) {
  const map = useMap()
  
  useEffect(() => {
    if (map) {
      map.setView(center, zoom)
    }
  }, [center, zoom, map])

  useEffect(() => {
    if (!map) return
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onClick(e.latlng.lat, e.latlng.lng)
    }
    
    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onClick])

  return null
}

interface Asset {
  id: number
  name: string
  distance: number
  price: string
  area: string
  lat: number
  lng: number
  type: string
  status: string
}

interface LeafletMapProps {
  location: { lat: number; lng: number }
  onMapClick: (lat: number, lng: number) => void
  radius?: number
  assets?: Asset[]
  onAssetClick?: (asset: Asset) => void
}

export default function LeafletMap({ 
  location, 
  onMapClick, 
  radius = 5,
  assets = [],
  onAssetClick
}: LeafletMapProps) {
  const center: [number, number] = [location.lat, location.lng]
  const mapRef = useRef<L.Map | null>(null)

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "500px", width: "100%", borderRadius: "0.75rem", zIndex: 0 }}
      className="border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20"
      ref={mapRef}
      whenReady={() => {
        // Map is ready
      }}
    >
      <MapController center={center} zoom={12} onClick={onMapClick} />
      
      {/* Dark theme tile layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {/* Search radius circle */}
      <Circle
        center={center}
        radius={radius * 1000}
        pathOptions={{
          color: '#a855f7',
          fillColor: '#a855f7',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '10, 10',
        }}
      />
      
      {/* Center marker */}
      <Marker position={center} icon={centerIcon}>
        <Popup className="custom-popup">
          <div style={{ padding: '8px', minWidth: '200px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#a855f7' }}>
              📍 Your Location
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              Searching {radius}km radius
            </div>
          </div>
        </Popup>
      </Marker>
      
      {/* Asset markers */}
      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={[asset.lat, asset.lng]}
          icon={createAssetIcon(asset.type, asset.status)}
          eventHandlers={{
            click: () => onAssetClick?.(asset),
          }}
        >
          <Popup className="custom-popup" maxWidth={280}>
            <div style={{ padding: '12px', minWidth: '260px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                    {asset.name}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {asset.type}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  background: asset.status.toLowerCase() === 'available' ? '#10b98120' : '#f59e0b20',
                  color: asset.status.toLowerCase() === 'available' ? '#10b981' : '#f59e0b',
                  border: `1px solid ${asset.status.toLowerCase() === 'available' ? '#10b981' : '#f59e0b'}`,
                }}>
                  {asset.status}
                </div>
              </div>
              
              <div style={{ 
                padding: '8px',
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>
                  {asset.price}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                  {asset.area}
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: '#9ca3af'
              }}>
                <span>📏 {asset.distance}km away</span>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    onAssetClick?.(asset)
                  }}
                  style={{
                    padding: '4px 12px',
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

// Add custom CSS for popups
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .leaflet-popup-content-wrapper {
      background: #1e293b !important;
      color: white !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
      padding: 0 !important;
    }
    .leaflet-popup-tip {
      background: #1e293b !important;
    }
    .custom-asset-icon {
      transition: transform 0.2s ease;
    }
    .custom-asset-icon:hover {
      transform: scale(1.1);
      z-index: 1000 !important;
    }
    .leaflet-container {
      font-family: inherit;
    }
  `
  document.head.appendChild(style)
}