import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


import { supabase } from './lib/supabase'

// 仮の猫投稿データ
const testCatPost = {
  lat: 35.6895, // 東京タワー近くの緯度
  lng: 139.6917, // 東京タワー近くの経度
  image_url: 'https://placekitten.com/200/300', // 仮の猫画像
  comment: 'テスト用の猫です'
}

// INSERT
supabase
  .from('cat_posts')
  .insert([testCatPost])
  .then(insertRes => {
    console.log('INSERT result:', insertRes)

    // INSERT が成功したら SELECT で確認
    supabase
      .from('cat_posts')
      .select('*')
      .then(selectRes => {
        console.log('SELECT after INSERT:', selectRes)
      })
  })