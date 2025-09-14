import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Field,
  Flex,
  GridItem,
  Heading,
  IconButton,
  Input,
  Portal,
  ProgressCircle,
  Select,
  SimpleGrid,
  Stack,
  Text,
  createListCollection,
} from '@chakra-ui/react';

import { Tooltip } from '@/components/ui/tooltip';
import {
  CreateTaskSchema,
  TASK_STATUSES,
  TASK_TYPES,
  type Task,
  type TaskType,
  taskTypes,
} from '@/features/tasks/task-model';
import {
  getOwnGameTasksQueryOptions,
  useCreateOwnTaskMutation,
  useDeleteOwnTaskMutation,
  useMoveOwnTaskMutation,
  useUpdateOwnTaskMutation,
} from '@/features/tasks/task-queries';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type PropsWithChildren, useMemo } from 'react';
import { LuCircle, LuCircleCheck, LuRotateCcw, LuTrash2 } from 'react-icons/lu';
type TasksTabProps = {
  gameId: string;
};

function TasksTab({ gameId }: TasksTabProps) {
  const { data: tasksData } = useSuspenseQuery(
    getOwnGameTasksQueryOptions(gameId),
  );

  const createTaskMutation = useCreateOwnTaskMutation(gameId);
  const createTaskForm = useForm({
    defaultValues: {
      text: '',
      position: 0,
      type: TASK_TYPES.DAILY as TaskType,
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: { onDynamic: CreateTaskSchema },
    onSubmit: async ({ value }) => {
      createTaskMutation.mutate(value, {
        onSuccess: () => {
          // only reset text field - user may be trying to add multiple tasks of the same type
          createTaskForm.resetField('text');
        },
      });
    },
  });

  const updateTaskMutation = useUpdateOwnTaskMutation(gameId);
  const deleteTaskMutation = useDeleteOwnTaskMutation(gameId);
  const moveOwnTaskMutation = useMoveOwnTaskMutation(gameId);

  const taskLookup = useMemo(() => {
    return new Map(tasksData.map(t => [t.id, t]));
  }, [tasksData]);

  const tasksByType = useMemo(() => {
    return splitByType(tasksData);
  }, [tasksData]);

  const doneByType = useMemo(() => {
    return Object.entries(tasksByType).reduce(
      (prev, [type, tasks]) => {
        prev[type as TaskType] = tasks.filter(
          t => t.status === TASK_STATUSES.DONE,
        ).length;
        return prev;
      },
      {} as Record<TaskType, number>,
    );
  }, [tasksByType]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const activeTask = taskLookup.get(event.active.id.toString());
    const overTask = event.over
      ? taskLookup.get(event.over.id.toString())
      : undefined;

    // return if either task doesn't exist, if they are the same task, or if they are not the same type
    if (
      !activeTask ||
      !overTask ||
      activeTask.id === overTask.id ||
      activeTask.type !== overTask.type
    ) {
      return;
    }

    const tasksOfSameType = tasksByType[activeTask.type];

    // find current and new positions
    const oldIndex = tasksOfSameType.findIndex(t => t.id === activeTask.id);
    const newIndex = tasksOfSameType.findIndex(t => t.id === overTask.id);

    // no movement needed
    if (oldIndex === newIndex) return;

    moveOwnTaskMutation.mutate({
      taskId: activeTask.id,
      newIndex: newIndex,
      allTasks: tasksOfSameType,
    });
  };

  return (
    <>
      {/* NEW TASK */}
      <SimpleGrid mb="4" gap="2" columns={5} asChild>
        <form
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            createTaskForm.handleSubmit();
          }}
        >
          <GridItem colSpan={{ base: 4, md: 3 }}>
            <createTaskForm.Field name="text">
              {field => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Input
                    placeholder="collect loot"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={e => field.handleChange(e.target.value)}
                  />
                  <Field.ErrorText>
                    {field.state.meta.errors.map(e => e?.message).join(',')}
                  </Field.ErrorText>
                </Field.Root>
              )}
            </createTaskForm.Field>
          </GridItem>
          <GridItem colSpan={{ base: 1, md: 1 }}>
            <createTaskForm.Field name="type">
              {field => (
                <Field.Root invalid={!field.state.meta.isValid}>
                  <Select.Root
                    collection={taskTypeCollection}
                    value={[field.state.value]}
                    onBlur={field.handleBlur}
                    onValueChange={e =>
                      field.handleChange((e.value as TaskType[])[0])
                    }
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="type" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {taskTypeCollection.items.map(type => (
                            <Select.Item item={type} key={type.value}>
                              {type.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                  <Field.ErrorText>
                    {field.state.meta.errors.map(e => e?.message).join(',')}
                  </Field.ErrorText>
                </Field.Root>
              )}
            </createTaskForm.Field>
          </GridItem>
          <GridItem colSpan={{ base: 5, md: 'auto' }}>
            <ButtonGroup w="full" attached>
              <Button type="submit">save</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => createTaskForm.reset()}
              >
                <LuRotateCcw />
              </Button>
            </ButtonGroup>
          </GridItem>
        </form>
      </SimpleGrid>

      {/* TASK GRID */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="2" h="full">
          {taskTypes.map(type => {
            const thisTasks = tasksByType[type];
            return (
              <SortableContext
                key={type}
                items={thisTasks}
                strategy={verticalListSortingStrategy}
              >
                <Card.Root key={type} variant="outline" size="sm" h="full">
                  <Card.Body>
                    <Flex alignItems="center">
                      <Heading mb="2">{type} tasks</Heading>
                      {!!thisTasks.length && (
                        <ProgressCircle.Root
                          value={(doneByType[type] / thisTasks.length) * 100}
                          size="xs"
                          ml="auto"
                        >
                          <ProgressCircle.Circle>
                            <ProgressCircle.Track />
                            <ProgressCircle.Range />
                          </ProgressCircle.Circle>
                        </ProgressCircle.Root>
                      )}
                    </Flex>
                    {thisTasks.length === 0 && (
                      <Box>
                        <Text color="fg.muted">no tasks yet</Text>
                      </Box>
                    )}
                    <Stack gap="1">
                      {thisTasks.map(task => {
                        const isDone = task.status === TASK_STATUSES.DONE;
                        const nextStatus = isDone
                          ? TASK_STATUSES.OPEN
                          : TASK_STATUSES.DONE;
                        return (
                          <SortableTask key={task.id} id={task.id}>
                            <Flex
                              key={task.id}
                              justifyContent="start"
                              _hover={{
                                bg: 'colorPalette.subtle',
                                cursor: 'pointer',
                              }}
                              borderRadius="lg"
                              alignItems={'center'}
                            >
                              <IconButton
                                variant="plain"
                                size="sm"
                                onPointerDown={e => e.stopPropagation()}
                                _hover={{
                                  color: 'fg',
                                }}
                                onClick={() =>
                                  updateTaskMutation.mutate({
                                    gameId,
                                    taskId: task.id,
                                    input: { status: nextStatus },
                                  })
                                }
                              >
                                {isDone ? <LuCircleCheck /> : <LuCircle />}
                              </IconButton>
                              <Tooltip content={task.text}>
                                <Text
                                  fontWeight="normal"
                                  truncate
                                  color={isDone ? 'fg.muted' : undefined}
                                  textDecoration={
                                    isDone ? 'line-through' : undefined
                                  }
                                >
                                  {task.text}
                                </Text>
                              </Tooltip>
                              <IconButton
                                variant="plain"
                                size="xs"
                                ms="auto"
                                colorPalette="gray"
                                onPointerDown={e => e.stopPropagation()}
                                _hover={{
                                  color: 'fg.error',
                                }}
                                onClick={() =>
                                  deleteTaskMutation.mutate({
                                    gameId,
                                    taskId: task.id,
                                  })
                                }
                              >
                                <LuTrash2 />
                              </IconButton>
                            </Flex>
                          </SortableTask>
                        );
                      })}
                    </Stack>
                  </Card.Body>
                </Card.Root>
              </SortableContext>
            );
          })}
        </SimpleGrid>
      </DndContext>
    </>
  );
}

export default TasksTab;

type SortableTaskProps = {
  id: string;
} & PropsWithChildren;
function SortableTask({ id, children }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const splitByType = (tasks: Task[]) => {
  const result: { daily: Task[]; weekly: Task[]; other: Task[] } = {
    daily: [],
    weekly: [],
    other: [],
  };

  for (const task of tasks) {
    if (task.type === TASK_TYPES.DAILY) {
      result.daily.push(task);
    } else if (task.type === TASK_TYPES.WEEKLY) {
      result.weekly.push(task);
    } else if (task.type === TASK_TYPES.OTHER) {
      result.other.push(task);
    }
  }

  return result;
};

const taskTypeCollection = createListCollection({
  items: taskTypes.map(t => ({ label: t, value: t })),
});
