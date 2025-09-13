import {
  Button,
  ButtonGroup,
  Card,
  Field,
  Flex,
  GridItem,
  Heading,
  Icon,
  IconButton,
  Input,
  Portal,
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
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="2">
        {taskTypes.map(type => {
          const thisTasks = tasksByType[type];
          const isDone = doneByType[type] === thisTasks.length;
          return (
            <Card.Root key={type} variant="outline" size="sm">
              <Card.Body>
                <Flex alignItems="center">
                  <Heading mb="2">{type} tasks</Heading>
                  <Text
                    fontSize="xs"
                    color={isDone ? 'fg.subtle' : undefined}
                    ml="auto"
                  >
                    {doneByType[type]}/{thisTasks.length}
                  </Text>
                </Flex>
                {thisTasks.length === 0 && (
                  <Text color="fg.muted">no tasks yet</Text>
                )}
                <Stack gap="1">
                  {thisTasks.map(task => {
                    const isDone = task.status === TASK_STATUSES.DONE;
                    const nextStatus = isDone
                      ? TASK_STATUSES.OPEN
                      : TASK_STATUSES.DONE;
                    return (
                      <Button
                        key={task.id}
                        variant="ghost"
                        colorPalette="gray"
                        fontWeight="normal"
                        justifyContent="start"
                        onClick={() =>
                          updateTaskMutation.mutate({
                            gameId,
                            taskId: task.id,
                            input: { status: nextStatus },
                          })
                        }
                        p="1"
                      >
                        <Icon colorPalette="purple" color="colorPalette.solid">
                          {isDone ? <LuCircleCheck /> : <LuCircle />}
                        </Icon>
                        <Tooltip content={task.text}>
                          <Text
                            truncate
                            color={isDone ? 'fg.muted' : undefined}
                            textDecoration={isDone ? 'line-through' : undefined}
                          >
                            {task.text}
                          </Text>
                        </Tooltip>
                        <IconButton
                          variant="ghost"
                          size="xs"
                          ms="auto"
                          colorPalette="gray"
                          onClick={e => {
                            e.stopPropagation();
                            deleteTaskMutation.mutate({
                              gameId,
                              taskId: task.id,
                            });
                          }}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </Button>
                    );
                  })}
                </Stack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </SimpleGrid>
    </>
  );
}

export default TasksTab;

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
