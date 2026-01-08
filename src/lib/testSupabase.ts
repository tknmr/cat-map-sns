import { supabase } from './supabase'

const testCatPost = {
  lat: 35.6895,
  lng: 139.6917,
  image_url: 'https://placekitten.com/200/300',
  comment: 'テスト用の猫です'
}

supabase
  .from('cat_posts')
  .insert([testCatPost])
  .then(res => console.log('INSERT result:', res))