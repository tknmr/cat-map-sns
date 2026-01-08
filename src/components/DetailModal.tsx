// src/components/DetailModal.tsx
import type { CatPost } from '../types/CatPost'

/**
 * DetailModalコンポーネント
 *
 * 役割:
 * - 選択中の CatPost 詳細表示
 * - 編集や削除などの操作は持たない
 */


type DetailModalProps = {
  post: CatPost
  onClose: () => void
}

export function DetailModal({ post, onClose }: DetailModalProps) {
  return (
    <div className="modal">
      <button onClick={onClose}>×</button>

      <img src={post.imageUrl} alt="猫の写真" />

      <p>{post.comment}</p>

      {post.createdAt && (
        <small>{post.createdAt}</small>
      )}
    </div>
  )
}