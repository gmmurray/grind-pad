import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import FormInput from './form-input';

export const { fieldContext, formContext, useFieldContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    FormInput,
  },
  formComponents: {},
});
