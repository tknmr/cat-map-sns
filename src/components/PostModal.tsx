import React, { useState } from 'react'
import type { CatPost } from '../types/CatPost'

/**
 * PostModalコンポーネント
 *
 * 役割:
 * - 新しい CatPost を作成する
 * - 入力に集中し、保存は親コンポーネントに渡す
 */

type PostModalProps = {
  onSubmit: (newPost: CatPost) => void
  onClose: () => void
}