import { useState } from 'react'
import { dummyPosts } from './data/dummyPosts'
import type { CatPost } from './types/CatPost'
import { MapView } from './components/MapView'
import { DetailModal } from './components/DetailModal'


export default function App() {
  const [posts] = useState<CatPost[]>(dummyPosts)
  const [selectedPost, setSelectedPost] = useState<CatPost | null>(null)

  return (
    <>
      <MapView
        posts={posts}
        onPinClick={(post: CatPost) => {
          setSelectedPost(post)
        }}
      />

      {selectedPost && (
        <DetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  )
}