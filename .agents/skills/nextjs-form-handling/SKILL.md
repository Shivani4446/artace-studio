---
name: nextjs-form-handling
description: Use for any form creation (login, contact, checkout, etc.) in Next.js, with Server Actions, validation, and clear loading/error states.
---

Build robust forms with validation and strong UX.

## When To Use
- Use for any new form flow in App Router.
- Use when handling mutation actions from UI to server.
- Use when adding client validation, server validation, and status states.

## Instructions
- Use Server Actions for form submission.
- Validate input with Zod and provide explicit schemas.
- Add loading, success, and error UI states.
- Mark interactive form components with `'use client'`.
- Prefer `react-hook-form` for complex forms and field-level control.
- Return structured errors from actions and display them near relevant fields.

## Example
```tsx
// components/ContactForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { submitContact } from '@/actions/contact';

export function ContactForm() {
  const [state, formAction] = useFormState(submitContact, { error: null });

  return (
    <form action={formAction} className="max-w-md space-y-6">
      <input
        name="email"
        type="email"
        required
        className="w-full rounded-lg border px-4 py-2"
        placeholder="Your email"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        Submit
      </button>
      {state?.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
```

## Guidelines
- Keep schema and action contracts close to the form flow.
- Preserve user input on failed submission.
- Use accessible labels, help text, and error messaging.
