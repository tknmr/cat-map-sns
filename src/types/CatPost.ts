/**
 * 猫投稿のデータ構造
 * ※この型は変更禁止
 */

export type CatPost = {
  id: string       // 投稿を一意に識別
  lat: number      // 緯度
  lng: number      // 経度
  imageUrl: string // 写真URL
  comment: string  // コメント
  createdAt?: string // (任意) 投稿日時
  imageFile?: File
}