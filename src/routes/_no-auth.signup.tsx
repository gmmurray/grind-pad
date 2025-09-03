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
import { SignupUserSchema } from '@/features/auth/auth-model';
import { useAuth } from '@/features/auth/provider/use-auth';

export const Route = createFileRoute('/_no-auth/signup')({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();

  const form = useForm({
    defaultValues: {
      email: '',
      emailVisibility: true,
      password: '',
      passwordConfirm: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await auth.signup(value);
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Unable to signup',
          type: 'error',
        });
      }
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'change',
    }),
    validators: { onDynamic: SignupUserSchema },
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
          <Card.Header>signup</Card.Header>
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

              <form.Field name="passwordConfirm">
                {field => (
                  <Field.Root invalid={!field.state.meta.isValid}>
                    <Field.Label>confirm password</Field.Label>
                    <Input
                      type="password"
                      placeholder="confirm your password"
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
                Already have an account?{' '}
                <ChakraLink asChild>
                  <Link to="/login">Log in instead</Link>
                </ChakraLink>{' '}
              </Text>
            </Stack>
          </Card.Body>
          <Card.Footer justifyContent="flex-end">
            <Button variant="outline" asChild>
              <Link to="/">Cancel</Link>
            </Button>
            <Button type="submit" variant="solid">
              Sign up
            </Button>
          </Card.Footer>
        </form>
      </Card.Root>
    </AbsoluteCenter>
  );
}
