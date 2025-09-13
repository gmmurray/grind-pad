import {
  type MutationFunction,
  type QueryKey,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

export function buildMutationHook<
  TData = unknown,
  TVariables = void,
  TError = Error,
  TContext = unknown,
>(mutationFn: MutationFunction<TData, TVariables>, queryKey: QueryKey) {
  return (): UseMutationResult<TData, TError, TVariables, TContext> => {
    const queryClient = useQueryClient();

    return useMutation<TData, TError, TVariables, TContext>({
      mutationFn,
      onSuccess: async () =>
        await queryClient.invalidateQueries({
          queryKey,
        }),
    });
  };
}
