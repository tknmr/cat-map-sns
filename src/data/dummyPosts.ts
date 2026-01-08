import type { CatPost } from '../types/CatPost';

export const dummyPosts: CatPost[] = [
  {
    id: '1',
    lat: 35.6895,
    lng: 139.6917,
    imageUrl: 'https://placekitten.com/320/220',
    comment: '東京タワー近くで見かけた猫。人懐っこい。',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    lat: 35.6586,
    lng: 139.7454,
    imageUrl: 'https://placekitten.com/300/200',
    comment: '芝公園で昼寝中。',
    createdAt: '2024-12-05T15:30:00Z',
  },
];
