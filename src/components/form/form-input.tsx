import { Field, Input, type InputProps } from '@chakra-ui/react';
import { useFieldContext } from './use-app-form';

type FormInputProps = {
  label: string;
} & InputProps;

function FormInput({ label, ...inputProps }: FormInputProps) {
  const field = useFieldContext<string>();
  return (
    <Field.Root invalid={!field.state.meta.isValid}>
      <Field.Label>{label}</Field.Label>
      <Input
        {...inputProps}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
      />
      <Field.ErrorText>
        {field.state.meta.errors.map(e => e?.message).join(',')}
      </Field.ErrorText>
    </Field.Root>
  );
}
export default FormInput;
