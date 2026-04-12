import { useState } from 'react';
export const useStatePage = (): {
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  return { error, setError, loading, setLoading };
};
