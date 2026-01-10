import { supabase } from './supabase'
import type { CatPost } from '../types/CatPost'

// DBスキーマに合わせた型（snake_case）
type DbCatPost = {
  id: string
  lat: number
  lng: number
  image_url: string
  comment: string
  created_at: string | null
}

/**
 * DB row (snake_case) → CatPost (camelCase) 変換
 */
function mapDbToCatPost(row: DbCatPost): CatPost {
  return {
    id: row.id,
    lat: row.lat,
    lng: row.lng,
    imageUrl: row.image_url,
    comment: row.comment,
    createdAt: row.created_at ?? undefined,
  }
}

/**
 * 投稿一覧を取得（新しい順）
 */
export async function listCatPosts(): Promise<CatPost[]> {
  console.log('📥 [posts] Fetching cat posts...')

  const { data, error } = await supabase
    .from('cat_posts')
    .select('id, lat, lng, image_url, comment, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ [posts] Failed to fetch posts:', error)
    throw error
  }

  console.log(`✅ [posts] Fetched ${data?.length ?? 0} posts`)
  return (data ?? []).map(mapDbToCatPost)
}

/**
 * 画像ファイルを Supabase Storage にアップロードして public URL を取得
 * バケット: cat-images
 */
async function uploadImageToStorage(file: File): Promise<string> {
  console.log('📤 [posts] Uploading image to storage...', {
    name: file.name,
    size: file.size,
    type: file.type
  })

  const extFromMime = (mime: string): string => {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg'
      case 'image/png':
        return 'png'
      case 'image/webp':
        return 'webp'
      default:
        return 'jpg'
    }
  }

  const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const fileExt = extFromMime(file.type || 'image/jpeg')
  const fileName = `${uuid}.${fileExt}`
  const filePath = `cats/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('cat-images')
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || 'image/jpeg',
    })

  if (uploadError) {
    console.error('❌ [posts] Failed to upload image:', uploadError)
    throw uploadError
  }

  const { data } = supabase.storage
    .from('cat-images')
    .getPublicUrl(filePath)

  console.log('✅ [posts] Image uploaded:', data.publicUrl)
  return data.publicUrl
}

export type CreateCatPostInput = {
  lat: number
  lng: number
  comment: string
  imageFile: File
}

/**
 * 新しい投稿を作成
 * 1. 画像を cat-images バケットにアップロード
 * 2. public URL を取得
 * 3. cat_posts テーブルに insert
 */
export async function createCatPost(input: CreateCatPostInput): Promise<CatPost> {
  console.log('🆕 [posts] Creating new cat post...', {
    lat: input.lat,
    lng: input.lng,
    comment: input.comment,
    hasFile: !!input.imageFile
  })

  if (!input.imageFile) {
    throw new Error('画像ファイルがありません')
  }

  // 安全対策: 画像ファイルのバリデーション
  const MAX_SIZE = 3 * 1024 * 1024 // 3MB
  const file = input.imageFile
  if (file.size > MAX_SIZE) {
    throw new Error('画像サイズが大きすぎます（最大3MB）')
  }
  const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  if (!allowedMimes.has(file.type)) {
    throw new Error('画像形式は JPEG/PNG/WebP のみ対応しています')
  }

  // 位置情報のバリデーション
  if (!Number.isFinite(input.lat) || input.lat < -90 || input.lat > 90) {
    throw new Error('緯度が不正です（-90〜90）')
  }
  if (!Number.isFinite(input.lng) || input.lng < -180 || input.lng > 180) {
    throw new Error('経度が不正です（-180〜180）')
  }

  // コメントのバリデーション（最大100文字）
  const normalizedComment = (input.comment ?? '').trim()
  if (normalizedComment.length > 100) {
    throw new Error('コメントは最大100文字までです')
  }

  // 1. 画像をアップロード
  const imageUrl = await uploadImageToStorage(file)

  // 2. DB に insert
  const insertPayload = {
    lat: input.lat,
    lng: input.lng,
    image_url: imageUrl,
    comment: normalizedComment,
  }

  console.log('📝 [posts] insertPayload:', insertPayload)


  const { data, error } = await supabase
    .from('cat_posts')
    .insert([insertPayload])
    .select('id, lat, lng, image_url, comment, created_at')
    .single()

  if (error) {
    console.error('❌ [posts] Failed to insert post:', error)
    throw error
  }

  console.log('✅ [posts] Post created successfully:', data)
  return mapDbToCatPost(data as DbCatPost)
}
