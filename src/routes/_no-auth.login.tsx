import {
  AbsoluteCenter,
  Button,
  Card,
  Link as ChakraLink,
  Field,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { Link, createFileRoute } from '@tanstack/react-router';

import { toaster } from '@/components/ui/toaster';
import { LoginUserSchema } from '@/features/auth/auth-model';
import { useAuth } from '@/features/auth/provider/use-auth';
import z from 'zod';

export const Route = createFileRoute('/_no-auth/login')({
  component: RouteComponent,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
});

function RouteComponent() {
  const auth = useAuth();
  const searchParams = Route.useSearch();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await auth.login(value, searchParams.redirect);
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Unable to authenticate',
          type: 'error',
        });
      }
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: { onDynamic: LoginUserSchema },
  });

  return (
    <AbsoluteCenter w="full">
      <Card.Root maxW="lg" flex="1" m="4">
        <form
          onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Card.Header>login</Card.Header>
          <Card.Body>
            <Stack gap="4" w="full">
              <form.Field name="email">
                {field => (
                  <Field.Root invalid={!field.state.meta.isValid}>
                    <Field.Label>email</Field.Label>
                    <Input
                      placeholder="enter your email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                    />
                    <Field.ErrorText>
                      {field.state.meta.errors.map(e => e?.message).join(',')}
                    </Field.ErrorText>
                  </Field.Root>
                )}
              </form.Field>

              <form.Field name="password">
                {field => (
                  <Field.Root invalid={!field.state.meta.isValid}>
                    <Field.Label>password</Field.Label>
                    <Input
                      type="password"
                      placeholder="enter your password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={e => field.handleChange(e.target.value)}
                    />
                    <Field.ErrorText>
                      {field.state.meta.errors.map(e => e?.message).join(',')}
                    </Field.ErrorText>
                  </Field.Root>
                )}
              </form.Field>
              <Text color="fg.muted">
                {`Don't have an account yet? `}
                <ChakraLink asChild>
                  <Link to="/signup">Sign up</Link>
                </ChakraLink>{' '}
              </Text>
            </Stack>
          </Card.Body>
          <Card.Footer justifyContent="flex-end">
            <Button variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit" variant="solid">
              Sign in
            </Button>
          </Card.Footer>
        </form>
      </Card.Root>
    </AbsoluteCenter>
  );
}
