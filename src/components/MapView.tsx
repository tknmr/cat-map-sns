import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { CatPost } from '../types/CatPost'

/**
 * MapViewコンポーネント
 *
 * 役割:
 * - 地図表示
 * - CatPost[] をピンで表示
 * - ピン押下時に親コンポーネントへ通知
 *
 * 注意:
 * - stateを持たない（純粋に表示専用）
 * - データの保存や更新は親に任せる
 */

type Props = {
  posts: CatPost[]
  onPinClick: (post: CatPost) => void
}

export function MapView({ posts, onPinClick }: Props) {
  return (
    <MapContainer
      center={[35.6812, 139.7671]}
      zoom={13}
      style={{ height: '100vh', width: '100vw' }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {posts.map((post) => (
        <Marker
          key={post.id}
          position={[post.lat, post.lng]}
          eventHandlers={{
            click: () => onPinClick(post),
          }}
        />
      ))}
    </MapContainer>
  )
}