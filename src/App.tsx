import { useEffect, useState } from 'react'
import { dummyPosts } from './data/dummyPosts'
import type { CatPost } from './types/CatPost'
import { createCatPost } from './lib/posts'

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
   * モーダルの画面上の位置
   */
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number } | undefined>()

  /**
   * 投稿モーダルの開閉
   */
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  /**
   * 投稿中のローディング状態
   */
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * 新しい投稿を Supabase に保存
   */
  const handleSubmitPost = async (post: CatPost) => {
    if (isSubmitting) return
    console.log('🆕 [App] new post submitted:', post)

    // バリデーション
    if (!post.imageFile) {
      alert('画像を選択してください')
      return
    }
    if (!post.comment.trim()) {
      alert('コメントを入力してください')
      return
    }
    // NOTE: Temporarily disable location check to allow UI posting tests.
    // Re-enable this check once coordinate input is implemented.
    // if (post.lat === 0 && post.lng === 0) {
    //   alert('位置情報を設定してください')
    //   return
    // }

    setIsSubmitting(true)

    try {
      // Save the post using the shared helper which handles storage/backends
      const newPost = await createCatPost({ ...post, imageFile: post.imageFile! })

      if (!newPost) {
        throw new Error('投稿の作成に失敗しました')
      }

      // 投稿一覧の先頭に追加（最新順）
      setPosts(prev => [newPost, ...prev])

      // モーダルを閉じる
      setIsPostModalOpen(false)

      alert('投稿が完了しました！')
    } catch (error) {
      console.error('❌ [App] Failed to create post:', error)
      const message = error instanceof Error ? error.message : '投稿に失敗しました'
      alert(`エラー: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
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
        selectedPost={selectedPost}
        onPinClick={(post, position) => {
          console.log('📍 [App] pin clicked:', post)
          setSelectedPost(post)
          setModalPosition(position)
        }}
        onModalPositionUpdate={(position) => {
          setModalPosition(position)
        }}
      />

      {/* 投稿詳細モーダル */}
      {selectedPost && (
        <>
          {console.log('🪟 [App] open DetailModal:', selectedPost)}
          <DetailModal
            post={selectedPost}
            position={modalPosition}
            onClose={() => {
              console.log('❌ [App] close DetailModal')
              setSelectedPost(null)
              setModalPosition(undefined)
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
            isSubmitting={isSubmitting}
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