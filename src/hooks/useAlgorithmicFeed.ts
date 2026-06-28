// Disabled — was causing performance issues with 100 post queries every 2 minutes
import { useState } from 'react';
import { Post } from './usePosts';

export const useAlgorithmicFeed = () => {
  const [posts] = useState<Post[]>([]);
  return { posts, loading: false, refetch: () => {} };
};
