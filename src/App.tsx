import { useEffect, useState } from 'react'
import { dummyPosts } from './data/dummyPosts'
import type { CatPost } from './types/CatPost'

import { MapView } from './components/MapView'
import { DetailModal } from './components/DetailModal'
import { PostModal } from './components/PostModal'

export default function App() {
  /**
   * 投稿一覧（最初はダミーデータ）
   * → PostModal から追加される
   */
  // StoredPost は表示用に imageUrl を持てるローカル表現
  type StoredPost = CatPost & { imageUrl?: string }

  // 初期値は localStorage があればそれを読み、なければダミーを使用
  const [posts, setPosts] = useState<StoredPost[]>(() => {
    try {
      const raw = localStorage.getItem('cat_posts')
      if (raw) return JSON.parse(raw) as StoredPost[]
    } catch (e) {
      console.warn('failed to read posts from localStorage', e)
    }
    return dummyPosts as StoredPost[]
  })

  /**
   * 選択中の投稿（ピンクリックで入る）
   */
  const [selectedPost, setSelectedPost] = useState<CatPost | null>(null)

  /**
   * 投稿モーダルの開閉
   */
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  /**
   * 新しい投稿を追加（ローカルのみ）
   */
  // File -> data URL
  const fileToDataUrl = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result)
        else reject(new Error('failed to read file as data url'))
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(f)
    })

  const handleSubmitPost = async (post: CatPost) => {
    console.log('🆕 [App] new post submitted:', post)
    console.log('🆕 [App] posts before:', posts.length)

    // 受け取った CatPost.imageFile があれば data URL に変換して imageUrl に入れる
    let imageUrl: string | undefined = undefined
    try {
      if (post.imageFile) {
        imageUrl = await fileToDataUrl(post.imageFile)
      }
    } catch (e) {
      console.error('failed to convert image file to data url', e)
    }

    const stored: StoredPost = {
      ...post,
      imageUrl: imageUrl ?? '',
    }

    setPosts(prev => {
      const next = [...prev, stored]
      console.log('🆕 [App] posts after:', next.length)
      return next
    })

    setIsPostModalOpen(false)
  }

  // posts が変わったら localStorage にシリアライズして保存する（imageFile は保存しない）
  useEffect(() => {
    try {
      const serializable = posts.map(p => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        comment: p.comment,
        createdAt: p.createdAt,
        imageUrl: p.imageUrl ?? null,
      }))
      localStorage.setItem('cat_posts', JSON.stringify(serializable))
    } catch (e) {
      console.warn('failed to save posts to localStorage', e)
    }
  }, [posts])

  return (
    <>
      {/* マップ表示 */}
      <MapView
        posts={posts}
        onPinClick={(post) => {
          console.log('📍 [App] pin clicked:', post)
          setSelectedPost(post)
        }}
      />

      {/* 投稿詳細モーダル */}
      {selectedPost && (
        <>
          {console.log('🪟 [App] open DetailModal:', selectedPost)}
          <DetailModal
            post={selectedPost}
            onClose={() => {
              console.log('❌ [App] close DetailModal')
              setSelectedPost(null)
            }}
          />
        </>
      )}

      {/* 投稿モーダル */}
      {isPostModalOpen && (
        <>
          {console.log('🪟 [App] open PostModal')}
          <PostModal
            onSubmit={handleSubmitPost}
            onClose={() => {
              console.log('❌ [App] close PostModal')
              setIsPostModalOpen(false)
            }}
          />
        </>
      )}

      {/* 仮の投稿ボタン（デザイン後回し） */}
      <button
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => {
          console.log('➕ [App] open PostModal button clicked')
          setIsPostModalOpen(true)
        }}
      >
        ＋ 投稿
      </button>
    </>
  )
}