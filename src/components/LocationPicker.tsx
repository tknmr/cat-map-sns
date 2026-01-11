// LocationPicker.tsx
import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// ★1. 画像をインポート（パスは MapView と同じ階層ならこれでOK）
import pinImage from '../assets/pin_neko_360.png'

// ★2. カスタムアイコンを定義（MapViewから流用）
const customIcon = L.icon({
  iconUrl: pinImage,
  iconSize: [40, 40],   // サイズ
  iconAnchor: [20, 40], // アンカー位置（真ん中下）
  popupAnchor: [0, -40] // ポップアップ位置
})

// Leafletのデフォルトアイコン設定（これがないとアイコンが表示されないことがあるため）
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type Props = {
  onConfirm: (lat: number, lng: number) => void
  onCancel: () => void
}

// クリックイベントをハンドリングするコンポーネント
function MapEvents({ onLocationSelect }: { onLocationSelect: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })
  return null
}

export function LocationPicker({ onConfirm, onCancel }: Props) {
  // 初期位置（東京駅周辺）
  const [position, setPosition] = useState<L.LatLng | null>(null)

  const handleConfirm = () => {
    if (position) {
      onConfirm(position.lat, position.lng)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* マップ部分 */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[35.6812, 139.7671]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* クリック検知 */}
          <MapEvents onLocationSelect={setPosition} />

          {/* 選択した場所にピンを表示 */}
          {position && <Marker position={position} icon={customIcon} />}
        </MapContainer>
      </div>

      {/* 下部の操作バー */}
      <div style={{ padding: '16px', background: 'white', borderTop: '1px solid #ddd', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={onCancel}
          style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff' }}
        >
          キャンセル
        </button>
        <button 
          onClick={handleConfirm}
          disabled={!position}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '8px', 
            border: 'none', 
            background: position ? '#0b76ef' : '#ccc', 
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          この場所で決定
        </button>
      </div>
    </div>
  )
}