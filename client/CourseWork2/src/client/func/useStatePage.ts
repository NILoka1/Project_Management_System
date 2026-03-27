import { useState } from 'react';
export const useStatePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  return { error, setError, loading, setLoading };
};
