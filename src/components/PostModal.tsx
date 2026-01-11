import React, { useEffect, useState } from 'react'
import './PostModal.css'
import type { CatPost } from '../types/CatPost'
import { LocationPicker } from './LocationPicker' // ★追加: パスが合っているか確認してください

// 画像パスは実際の環境に合わせてください
import placeholderImg from '../assets/cat.png'

type PostModalProps = {
  onSubmit: (post: CatPost) => void
  onClose: () => void
  isSubmitting?: boolean
}

export function PostModal({ onSubmit, onClose, isSubmitting = false }: PostModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  
  // ★追加: 位置情報のローディング状態
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  // ★追加: 地図選択モードかどうか
  const [showMapPicker, setShowMapPicker] = useState(false)
  // ★追加: 地図で選択された位置情報
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null)

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

    const MAX_FILE_MB = 5 
    const maxBytes = MAX_FILE_MB * 1024 * 1024

    if (chosen.size > maxBytes) {
      const sizeMb = (chosen.size / (1024 * 1024)).toFixed(2)
      setFile(null)
      setFileError(`画像サイズは ${MAX_FILE_MB}MB 以下である必要があります（選択: ${sizeMb}MB）`)
      if (e.target) e.target.value = ''
      return
    }

    setFileError(null)
    setFile(chosen)
  }

  const MAX_COMMENT = 100

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value.replace(/\r?\n/g, ' ')
    setComment(raw.slice(0, MAX_COMMENT))
  }

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handleCommentPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\r?\n/g, ' ')
    const next = (comment + text).slice(0, MAX_COMMENT)
    setComment(next)
  }

  // --- ★ここから位置情報＆投稿ロジック ---

  // 実際の投稿処理（GPS取得後 or 地図選択後に呼ばれる）
  const submitPost = (lat: number, lng: number) => {
    console.log('📝 [PostModal] submitting with:', { lat, lng })

    const newPost: CatPost = {
      id: crypto.randomUUID(),
      imageUrl: '', 
      comment,
      lat,
      lng,
      createdAt: new Date().toISOString(),
      imageFile: file ?? undefined,
    }

    onSubmit(newPost)
    setIsLocationLoading(false)
  }

  const handleSubmit = () => {
    if (!file) return

    // 1. 地図で場所を選んでいた場合
    if (selectedLocation) {
        submitPost(selectedLocation.lat, selectedLocation.lng)
        return
    }

    // 2. 選んでいない場合はGPS取得へ
    setIsLocationLoading(true)

    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報に対応していません')
      setIsLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log('📍 GPS取得成功:', latitude, longitude)
        submitPost(latitude, longitude)
      },
      (error) => {
        console.error('位置情報の取得に失敗しました', error)
        alert('現在地が取得できませんでした。位置情報の許可を確認してください。')
        setIsLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // 地図モードへの切り替え
  const handleOpenMap = () => {
    setShowMapPicker(true)
  }

  const handleMapConfirm = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setShowMapPicker(false)
  }

  const handleMapCancel = () => {
    setShowMapPicker(false)
  }

  // --- ★描画リターン ---

  // 地図選択モードなら LocationPicker を表示
  if (showMapPicker) {
    return <LocationPicker onConfirm={handleMapConfirm} onCancel={handleMapCancel} />
  }

  // 通常モード
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
          {/* 地図から選ぶボタン */}
          <button 
             className="pm-btn pm-btn--secondary" 
             onClick={handleOpenMap}
             disabled={isSubmitting || isLocationLoading}
          >
             {selectedLocation ? '場所を変更' : '地図から選ぶ'}
          </button>

          {/* 投稿ボタン */}
          <button
            className="pm-btn pm-btn--primary"
            onClick={handleSubmit}
            disabled={!file || !!fileError || isSubmitting || isLocationLoading}
          >
            {isSubmitting ? '送信中...' 
              : isLocationLoading ? '位置情報を取得中...' 
              : selectedLocation ? 'ピンを立てた位置で投稿'
              : '現在地で投稿'}
          </button>
        </div>
      </div>
    </div>
  )
}