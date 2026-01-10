// ...existing code...
import React, { useEffect, useState } from 'react'
import type { CatPost } from '../types/CatPost'

type PostModalProps = {
  onSubmit: (post: CatPost) => void
  onClose: () => void
}

export function PostModal({ onSubmit, onClose }: PostModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }

  const handleSubmit = () => {
    console.log('📝 [PostModal] submit clicked', { file, comment })

    const newPost: CatPost = {
      id: crypto.randomUUID(),
      imageUrl: '', // 空文字を渡し、親で data URL に置き換える
      comment,
      lat: 0,
      lng: 0,
      createdAt: new Date().toISOString(),
      imageFile: file ?? undefined, // File をそのまま渡す（将来のアップロード用）
    }

    onSubmit(newPost)
  }

  return (
    // バックドロップ + 中央のモーダルコンテナで地図の上に表示されるようにする
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'relative',
          background: '#fff',
          padding: 20,
          borderRadius: 8,
          width: '90%',
          maxWidth: 480,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <h2>New Cat Post</h2>

        <label style={{ display: 'block', marginBottom: 12 }}>
          画像を選択
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} />
        </label>

        {preview && (
          <div style={{ marginBottom: 12 }}>
            <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 12 }}>
          コメント
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} style={{ width: '100%' }} />
        </label>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={handleSubmit} style={{ padding: '8px 12px' }}>Submit</button>
          <button onClick={onClose} style={{ padding: '8px 12px' }}>Close</button>
        </div>
      </div>
    </div>
  )
}
// ...existing code...