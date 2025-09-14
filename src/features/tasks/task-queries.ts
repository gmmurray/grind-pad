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
import type { CreateTask, Task } from './task-model';
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
      allTasks,
    }: {
      taskId: string;
      newIndex: number;
      allTasks: Task[]; // All tasks of the same type, including the one being moved
    }) => {
      // Find the task being moved
      const movingTask = allTasks.find(t => t.id === taskId);
      if (!movingTask) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      // Remove the moving task from the list to get siblings
      const siblings = allTasks.filter(t => t.id !== taskId);

      // Sort siblings by position for consistent ordering
      const sortedSiblings = [...siblings].sort(
        (a, b) => a.position - b.position,
      );

      // Validate newIndex bounds
      if (newIndex < 0 || newIndex > sortedSiblings.length) {
        throw new Error(
          `Invalid newIndex: ${newIndex}. Must be between 0 and ${sortedSiblings.length}`,
        );
      }

      // Handle trivial case: no siblings (first task of this type)
      if (sortedSiblings.length === 0) {
        return updateOwnTask({
          gameId,
          taskId,
          input: { position: 1000 },
        });
      }

      const positions = sortedSiblings.map(t => t.position);

      // Calculate candidate position for the new index
      const candidate = calcNewPosition(positions, newIndex);

      // Check boundaries around the insertion point
      const prev = positions[newIndex - 1] ?? Number.NEGATIVE_INFINITY;
      const next = positions[newIndex] ?? Number.POSITIVE_INFINITY;

      if (isOutOfSpace(candidate, prev, next)) {
        // Need full rebalance - create the final desired order
        const reorderedTasks = [...sortedSiblings];
        reorderedTasks.splice(newIndex, 0, movingTask);

        const rebalanced = rebalancePositions(reorderedTasks.length);
        const input = {
          tasks: reorderedTasks.map((t, i) => ({
            id: t.id,
            position: rebalanced[i],
          })),
        };

        await rebalanceOwnTasks({ gameId, input });
      } else {
        // Simple position update
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
