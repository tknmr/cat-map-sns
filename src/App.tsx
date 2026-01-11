import { useEffect, useState } from 'react'
import type { CatPost } from './types/CatPost'
import { createCatPost, listCatPosts } from './lib/posts'
import { supabase } from './lib/supabase'

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

  const [posts, setPosts] = useState<StoredPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

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
   * マウント時にDBから投稿一覧を取得
   */
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        setFetchError(null)
        const data = await listCatPosts()
        
        // ★修正1: ここは 'updatedPosts' ではなく 'data' をセットする
        setPosts(data)
        
        console.log('✅ [App] Loaded posts from DB:', data.length)
      } catch (error) {
        console.error('❌ [App] Failed to fetch posts:', error)
        const message = error instanceof Error ? error.message : '投稿の取得に失敗しました'
        setFetchError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  /**
   * Supabase Realtime: 新しい投稿をリアルタイムで受信
   */
  useEffect(() => {
    console.log('🔌 [App] Setting up Realtime subscription...')

    const channel = supabase
      .channel('cat_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cat_posts'
        },
        (payload) => {
          console.log('🆕 [App] New post received via Realtime:', payload)

          // payload.new contains the inserted row
          const newRow = payload.new as {
            id: string
            lat: number
            lng: number
            image_url: string
            comment: string
            created_at: string | null
          }

          // Convert snake_case to camelCase
          const newPost: CatPost = {
            id: newRow.id,
            lat: newRow.lat,
            lng: newRow.lng,
            imageUrl: newRow.image_url,
            comment: newRow.comment,
            createdAt: newRow.created_at ?? undefined,
          }

          // Add new post to the beginning of the list (most recent first)
          setPosts((prevPosts) => {
            // Check if post already exists (avoid duplicates)
            const exists = prevPosts.some(p => p.id === newPost.id)
            if (exists) {
              console.log('⚠️ [App] Post already exists, skipping duplicate')
              return prevPosts
            }
            console.log('✅ [App] Adding new post to map')
            return [newPost, ...prevPosts]
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 [App] Realtime subscription status:', status)
      })

    // Cleanup: unsubscribe when component unmounts
    return () => {
      console.log('🔌 [App] Cleaning up Realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [])

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

    setIsSubmitting(true)

    try {
      // Save the post using the shared helper which handles storage/backends
      const newPost = await createCatPost({ ...post, imageFile: post.imageFile! })

      if (!newPost) {
        throw new Error('投稿の作成に失敗しました')
      }

      // モーダルを閉じる
      setIsPostModalOpen(false)

      // DBから最新の投稿一覧を再取得して反映
      const updatedPosts = await listCatPosts()
      
      // ★修正2: 取得した updatedPosts を state にセットする行が抜けていました
      setPosts(updatedPosts)

      // 新しい投稿を選択状態にする（地図移動用）
      setSelectedPost(newPost)

      alert('投稿が完了しました！')
    } catch (error) {
      console.error('❌ [App] Failed to create post:', error)
      const message = error instanceof Error ? error.message : '投稿に失敗しました'
      alert(`エラー: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ローディング中またはエラー時の表示
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.5rem' }}>
        読み込み中... 🐾
      </div>
    )
  }

  if (fetchError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <p style={{ color: 'red', fontSize: '1.2rem' }}>エラー: {fetchError}</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </div>
    )
  }

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