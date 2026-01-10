// ...existing code...
import React, { useEffect, useState } from 'react'
import './PostModal.css'
import type { CatPost } from '../types/CatPost'

import placeholderImg from './cat.png'
type PostModalProps = {
  onSubmit: (post: CatPost) => void
  onClose: () => void
}

export function PostModal({ onSubmit, onClose }: PostModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)

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
    const chosen = e.target.files?.[0] ?? null
    if (!chosen) {
      setFile(null)
      setFileError(null)
      return
    }

    const MAX_FILE_MB = 5 // 最大ファイルサイズ（MB）
    const maxBytes = MAX_FILE_MB * 1024 * 1024

    if (chosen.size > maxBytes) {
      const sizeMb = (chosen.size / (1024 * 1024)).toFixed(2)
      setFile(null)
      setFileError(`画像サイズは ${MAX_FILE_MB}MB 以下である必要があります（選択: ${sizeMb}MB）`)
      // clear the input so user can re-select same file if they want
      if (e.target) e.target.value = ''
      return
    }

    // ok
    setFileError(null)
    setFile(chosen)
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

  const MAX_COMMENT = 100

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // remove newlines and trim to max length
    const raw = e.target.value.replace(/\r?\n/g, ' ')
    setComment(raw.slice(0, MAX_COMMENT))
  }

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // prevent newline
      e.preventDefault()
    }
  }

  const handleCommentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\r?\n/g, ' ')
    const next = (comment + text).slice(0, MAX_COMMENT)
    setComment(next)
  }

  

  return (
    <div className="pm-root">
      <div className="pm-backdrop" onClick={onClose} />

      <div className="pm-modal" role="dialog" aria-modal="true">
        <div className="pm-header">
          <h2 className="pm-title">New Cat Post</h2>
          <button className="pm-close" onClick={onClose} aria-label="close">✕</button>
        </div>

        <label className="pm-label pm-file-label">
          {preview ? (
            <span className="pm-file-label-text">
              <img src={preview} className="pm-file-selected-img" alt="selected" />
            </span>
          ) : (
            <span className="pm-file-label-text">
              <img 
                src={placeholderImg} 
                className="pm-file-illustration" 
                alt="イラスト" 
                style={{ width: '64px', height: '64px', objectFit: 'contain' }} 
              />


              <div className="pm-file-caption">画像を選択</div>
            </span>
          )}
          <input className="pm-file-input" type="file" accept="image/*" onChange={handleFileChange} />
        </label>
  {fileError && <div className="pm-file-error" role="alert">{fileError}</div>}

        <div className="pm-media-row">
          <div className="pm-bubble pm-bubble--with-image">
            <textarea
              className="pm-bubble-textarea"
              value={comment}
              onChange={handleCommentChange}
              onKeyDown={handleCommentKeyDown}
              onPaste={handleCommentPaste}
              rows={4}
              placeholder="コメントを入力"
            />
            <div className="pm-counter">{comment.length}/{MAX_COMMENT}</div>
          </div>
        </div>

        <div className="pm-actions">
          <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={!file || !!fileError}>投稿</button>
        </div>
      </div>
    </div>
  )
}
// ...existing code...