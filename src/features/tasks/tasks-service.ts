import { pbClient } from '@/lib/pocketbase';
import { validateModelDbList } from '@/utils/validateModelDbList';
import { getUser } from '../auth/auth-service';
import { getOwnGame } from '../games/games-service';
import { TASKS_COLLECTION } from './task-constants';
import {
  type CreateTask,
  CreateTaskSchema,
  type RebalanceTasks,
  type Task,
  TaskSchema,
  type UpdateTask,
  UpdateTaskSchema,
} from './task-model';

export async function getOwnGameTask(
  gameId: string,
  taskId: string,
): Promise<Task | null> {
  const user = getUser();

  if (!user) {
    console.log('Unable to retrieve task: no user provided');
    return null;
  }

  const dbTask = await pbClient
    .collection(TASKS_COLLECTION)
    .getFirstListItem(
      `id="${taskId}" && user = "${user.id}" && game = "${gameId}"`,
    );

  const validated = TaskSchema.safeParse(dbTask);

  if (!validated.success) {
    console.log(`Invalid task retrieved from database with id: ${gameId}`);
    return null;
  }

  return validated.data;
}

export async function getOwnGameTasks(gameId: string): Promise<Task[]> {
  const user = getUser();

  if (!user) {
    console.log('Unable to retrieve tasks: no user provided');
    return [];
  }

  const dbTasks = await pbClient.collection(TASKS_COLLECTION).getFullList({
    filter: `game="${gameId}" && user = "${user.id}"`,
    sort: '+position',
  });

  return validateModelDbList(dbTasks, TaskSchema);
}

export async function createOwnTask({
  gameId,
  input,
}: { gameId: string; input: CreateTask }): Promise<Task> {
  const user = getUser();

  if (!user) {
    console.log('Unable to create task: no user provided');
    throw new Error('There was an error creating your task');
  }

  const validatedInput = CreateTaskSchema.parse(input);

  const dbTask = await pbClient
    .collection(TASKS_COLLECTION)
    .create({ ...validatedInput, user: user.id, game: gameId, status: 'open' });

  return TaskSchema.parse(dbTask);
}

export async function updateOwnTask({
  gameId,
  taskId,
  input,
}: { gameId: string; taskId: string; input: UpdateTask }): Promise<Task> {
  const validatedInput = UpdateTaskSchema.parse(input);

  const existingTask = await getOwnGameTask(gameId, taskId);

  if (!existingTask) {
    console.log(
      `Unable to update own task: task with id ${taskId} could not be found`,
    );
    throw new Error('There was an error saving your task');
  }

  const updates: Task = {
    ...existingTask,
    ...validatedInput,
  };

  const validatedUpdates = TaskSchema.parse(updates);

  const updated = await pbClient
    .collection(TASKS_COLLECTION)
    .update(taskId, validatedUpdates);

  return TaskSchema.parse(updated);
}

// export function moveOwnTask({gameId, taskId, input: }:{gameId:string, taskId:string, input: })

export async function rebalanceOwnTasks({
  gameId,
  input,
}: { gameId: string; input: RebalanceTasks }): Promise<void> {
  // implicitly validates user as well
  const game = await getOwnGame(gameId);

  if (!game) {
    console.log(`Unable to rebalance tasks due to user's access`);
    throw new Error('There was an error updating your tasks');
  }

  const promises = input.tasks.map(t =>
    pbClient.collection(TASKS_COLLECTION).update(t.id, {
      position: t.position,
    }),
  );

  await Promise.all(promises);
}

export async function deleteOwnTask({
  gameId,
  taskId,
}: { gameId: string; taskId: string }): Promise<void> {
  // implicitly validates user as well
  const task = await getOwnGameTask(gameId, taskId);

  if (!task) {
    console.log(`Unable to delete task due to user's access`);
    throw new Error('There was an error deleting your task');
  }

  await pbClient.collection(TASKS_COLLECTION).delete(taskId);
}
