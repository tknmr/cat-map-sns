import type { CatPost } from '../types/CatPost'

/**
 * PostModalコンポーネント
 *
 * 【設計方針】
 * - このコンポーネントは「ローカル完結」を前提に実装する
 * - DB（Supabase）への保存は行わない
 *
 * 【役割】
 * - ユーザーから猫投稿情報（imageUrl / comment）を入力してもらう
 * - submit時に onSubmit(newPost) を呼び出すだけ
 *
 * 【備考】
 * - DB接続はハッカソン当日に App 側で差し替える想定
 * - このコンポーネント自体は DB を一切知らない設計とする
 */

type PostModalProps = {
  /**
   * 新しい投稿を親コンポーネントに渡すためのコールバック
   * ※ DB保存はここでは行わない
   */
  onSubmit: (post: CatPost) => void

  /**
   * モーダルを閉じる
   */
  onClose: () => void
}

export function PostModal({ onSubmit, onClose }: PostModalProps) {
  // NOTE:
  // onSubmit / onClose はこの後実装で使用予定（現時点では未使用だからエラーあるけど気にしないで）


  // TODO:
  // - imageUrl / comment の入力フォームを作る
  // - submit時に CatPost を組み立てて onSubmit に渡す
  return null
}