import { Text } from '@mantine/core';
export const StatePage = ({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) => {
  if (loading) return <Text>Загрузка...</Text>;
  if (error) return <Text c={'red'}>{error}</Text>;
  return <>{children}</>;
};

// import { StatePage } from '../../components/StatePage';
//    <StatePage error={error} loading={loading}></StatePage>
