import { z } from 'zod';

// ── Step 1: Account creation ───────────────────────────────────────────────

export const accountSchema = z
  .object({
    first_name: z.string().trim().min(1, 'auth.register.err.firstName'),
    last_name: z.string().trim().min(1, 'auth.register.err.lastName'),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9_]{3,30}$/, 'auth.register.err.username'),
    email: z.string().trim().email('auth.register.err.email'),
    phone_number: z
      .string()
      .trim()
      .regex(/^(?:\+91[-\s]?)?[6-9]\d{9}$|^[6-9]\d{9}$/, 'auth.register.err.mobile'),
    password: z
      .string()
      .min(8, 'auth.register.err.password')
      .regex(/[a-zA-Z]/, 'auth.register.err.password')
      .regex(/[0-9]/, 'auth.register.err.password'),
    confirm_password: z.string().min(1, 'auth.register.err.confirmPassword'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'auth.register.err.confirmPassword',
    path: ['confirm_password'],
  });

export type AccountFormValues = z.infer<typeof accountSchema>;

// ── Step 2: User profile ───────────────────────────────────────────────────

export const profileSchema = z.object({
  preferred_language: z.enum(['en', 'hi', 'gu']).default('en'),
  entrepreneur_type: z.enum(['aspiring', 'new', 'existing']).optional(),
  experience: z.enum(['none', 'lt1', '1_3', '3_5', 'gt5']).optional(),
  default_state: z.number().int().positive().optional().nullable(),
  default_district: z.number().int().positive().optional().nullable(),
  default_block: z.string().trim().optional().nullable(),
  default_village: z.string().trim().optional().nullable(),
  own_capital: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().min(0).nullable().optional()
  ),
  business_interest: z.string().optional(),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, { message: 'auth.register.termsRequired' }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
