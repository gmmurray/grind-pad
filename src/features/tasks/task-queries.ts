import {
  calcNewPosition,
  isOutOfSpace,
  rebalancePositions,
} from '@/utils/ordering';
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { CreateTask, Task, UpdateTask } from './task-model';
import {
  createOwnTask,
  deleteOwnTask,
  getOwnGameTasks,
  rebalanceOwnTasks,
  updateOwnTask,
} from './tasks-service';

import { buildMutationHook } from '@/hooks/queries';

export const TASKS_QUERY_KEY = 'tasks';

export const taskQueryKeys = {
  getOwnGameTasks: (gameId: string) => [
    TASKS_QUERY_KEY,
    'own-game-tasks',
    { gameId },
  ],
};

export const getOwnGameTasksQueryOptions = (gameId: string) =>
  queryOptions({
    queryKey: taskQueryKeys.getOwnGameTasks(gameId),
    queryFn: () => getOwnGameTasks(gameId),
  });

export function useCreateOwnTaskMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTask) => {
      // grab cached tasks for this game/type
      const tasks =
        queryClient.getQueryData<Task[]>(
          getOwnGameTasksQueryOptions(gameId).queryKey,
        ) ?? [];

      const sameType = tasks.filter(t => t.type === input.type);
      const positions = sameType.map(t => t.position).sort((a, b) => a - b);

      // calc position for "append" semantics
      const newPos = calcNewPosition(positions, positions.length);

      return createOwnTask({ gameId, input: { ...input, position: newPos } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(getOwnGameTasksQueryOptions(gameId));
    },
  });
}

export function useMoveOwnTaskMutation(gameId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newIndex,
      siblings,
    }: {
      taskId: string;
      input: UpdateTask;
      newIndex: number;
      siblings: Task[];
    }) => {
      // sort siblings consistently by position first
      const sorted = [...siblings].sort((a, b) => a.position - b.position);

      // handle trivial case: no siblings
      if (sorted.length === 0) {
        return updateOwnTask({
          gameId,
          taskId,
          input: { position: 1000 },
        });
      }

      const positions = sorted.map(t => t.position);

      // calc candidate
      const candidate = calcNewPosition(positions, newIndex);

      const prev = positions[newIndex - 1] ?? Number.NEGATIVE_INFINITY;
      const next = positions[newIndex] ?? Number.POSITIVE_INFINITY;

      if (isOutOfSpace(candidate, prev, next)) {
        // full rebalance, keeping id/position aligned
        const rebalanced = rebalancePositions(sorted.length);
        const input = {
          tasks: sorted.map((t, i) => ({
            id: t.id,
            position: rebalanced[i],
          })),
        };
        await rebalanceOwnTasks({ gameId, input });
      } else {
        // simple update
        await updateOwnTask({
          gameId,
          taskId,
          input: { position: candidate },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(getOwnGameTasksQueryOptions(gameId));
    },
  });
}

export const useUpdateOwnTaskMutation = (gameId: string) =>
  buildMutationHook(updateOwnTask, taskQueryKeys.getOwnGameTasks(gameId))();

export const useRebalanceOwnTasksMutation = (gameId: string) =>
  buildMutationHook(rebalanceOwnTasks, taskQueryKeys.getOwnGameTasks(gameId))();

export const useDeleteOwnTaskMutation = (gameId: string) =>
  buildMutationHook(deleteOwnTask, taskQueryKeys.getOwnGameTasks(gameId))();
