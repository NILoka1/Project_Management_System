import { Flex, Grid, Group, Skeleton, Stack, Text } from '@mantine/core';
import { JSX } from 'react';

export const FullProjectSkeleton = (): JSX.Element => {
  return (
    <Stack gap={5}>
      <Group gap={2}>
        <Text fz={14}>Название</Text>
        <Skeleton h={36} />
      </Group>
      <Group gap={2}>
        <Text fz={14}>Описание</Text>
        <Skeleton h={36} />
      </Group>
      <Group gap={2}>
        <Text fz={14}>Статус</Text>
        <Skeleton h={36} />
      </Group>
      <Group gap={2}>
        <Text fz={14}>Прогресс</Text>
        <Skeleton h={36} />
      </Group>
      <Group gap={2}>
        <Text fz={14}>Бюджет</Text>
        <Skeleton h={36} />
      </Group>
      <Group gap={2}>
        <Text fz={14}>Дата начала</Text>
        <Skeleton h={36} />
      </Group>
            <Group gap={2}>
        <Text fz={14}>Дата окончания</Text>
        <Skeleton h={36} />
      </Group>
      <Flex>
        <Text fz={14} miw={'110px'}>
          Дата создания:
        </Text>
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
