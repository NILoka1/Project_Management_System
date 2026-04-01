import { Text } from '@mantine/core';
import { JSX } from 'react';
export const StatePage = ({
  loading,
  error,
  children,
  Skeleton,
}: {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
  Skeleton?: JSX.Element;
}) => {
  if (loading) {
    if (Skeleton) {
      return Skeleton;
    }
    return <Text>Загрузка...</Text>;
  }
  if (error) return <Text c={'red'}>{error}</Text>;


  return <>{children}</>;
};

// import { StatePage } from '../../components/StatePage';
//    <StatePage error={error} loading={loading}></StatePage>
