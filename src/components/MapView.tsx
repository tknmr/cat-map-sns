import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import L from 'leaflet'
import pinImage from '../assets/pin_neko_360.png'
import type { CatPost } from '../types/CatPost'

// カスタムアイコン定義（pin_neko_360.pngの縦横比を保つ）
const customIcon = L.icon({
  iconUrl: pinImage,
  iconSize: [40, 40], // 縦横比を保ったサイズ（360x360なので1:1）
  iconAnchor: [20, 40], // アイコンの下部を座標点に合わせる
  popupAnchor: [0, -40], // ポップアップ表示位置
})

/**
 * MapViewコンポーネント
 *
 * 役割:
 * - 地図表示
 * - CatPost[] をピンで表示
 * - ピン押下時に親コンポーネントへ通知
 * - マップ動時にモーダル位置を更新
 *
 * 注意:
 * - stateを持たない（純粋に表示専用）
 * - データの保存や更新は親に任せる
 */

type Props = {
  posts: CatPost[]
  onPinClick: (post: CatPost, screenPosition?: { x: number; y: number }) => void
  selectedPost?: CatPost | null
  onModalPositionUpdate?: (position: { x: number; y: number }) => void
}

function MapContent({ posts, onPinClick, selectedPost, onModalPositionUpdate }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!selectedPost || !onModalPositionUpdate) return

    const updatePosition = () => {
      const containerPoint = map.latLngToContainerPoint([selectedPost.lat, selectedPost.lng])
      onModalPositionUpdate({ x: containerPoint.x, y: containerPoint.y })
    }

    // マップのパン・ズーム・リサイズイベントをリッスン
    map.on('move', updatePosition)
    map.on('zoom', updatePosition)
    map.on('resize', updatePosition)

    return () => {
      map.off('move', updatePosition)
      map.off('zoom', updatePosition)
      map.off('resize', updatePosition)
    }
  }, [map, selectedPost, onModalPositionUpdate])

  return (
    <>
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {posts.map((post) => (
        <Marker
          key={post.id}
          position={[post.lat, post.lng]}
          icon={customIcon}
          eventHandlers={{
            click: () => {
              const containerPoint = map.latLngToContainerPoint([post.lat, post.lng])
              onPinClick(post, { x: containerPoint.x, y: containerPoint.y })
            },
          }}
        />
      ))}
    </>
  )
}

export function MapView({ posts, onPinClick, selectedPost, onModalPositionUpdate }: Props) {
  return (
    <MapContainer
      center={[35.6812, 139.7671]}
      zoom={13}
      style={{ height: '100vh', width: '100vw' }}
    >
      <MapContent posts={posts} onPinClick={onPinClick} selectedPost={selectedPost} onModalPositionUpdate={onModalPositionUpdate} />
    </MapContainer>
  )
}