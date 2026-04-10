import {
  Paper,
  Title,
  Stack,
  Group,
  Badge,
  Text,
  Button,
  ActionIcon,
  Flex,
  Skeleton,
} from '@mantine/core';
import { IconPlayerPlay, IconEdit, IconClock } from '@tabler/icons-react';
import { Role } from '../../../types';
import { getStatusColor, getPriorityColor } from '../../../utils/colors';
import { useTasks } from '../hooks/useTasks';
import { StatePage } from '../../../StatePage/StatePage';

export const TaskSkeleton = () => {
  return (
    <Paper p="md" withBorder>
      <Flex justify="space-between" mb="md">
        <Title order={3}>Мои активные задачи</Title>
        <Skeleton h={28} w={92} />
      </Flex>
      <Stack>
        {[...Array(3)].map((_, i) => (
          <Paper key={i} p="sm" withBorder>
            <Flex gap={4} direction={'column'}>
              <Skeleton h={25} w={'60%'} />
              <Skeleton h={20} w={'30%'}/>
              <Skeleton h={18} w={'40%'}/>
            </Flex>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};
