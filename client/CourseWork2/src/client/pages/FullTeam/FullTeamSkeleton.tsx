import { Flex, Grid, Group, Skeleton, Stack, Text } from '@mantine/core';

export const FullTeamSkeleton = () => {
  return (
    <Stack>
      <Group gap={2}>
        <Text fz={14}>Название:</Text>
        <Skeleton h={36} />
      </Group>
      <Group gap={2}>
        <Text fz={14}>Описание:</Text>
        <Skeleton h={36} />
      </Group>
      <Flex>
        <Text fz={14} miw={'110px'}>Дата создания:</Text>
        <Skeleton h={22} />
      </Flex>
      <Grid>
        <Grid.Col span={6}>
          <Skeleton h={300} />
        </Grid.Col>
        <Grid.Col span={6}>
          <Skeleton h={300} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
