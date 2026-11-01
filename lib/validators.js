import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const rupees = (label) =>
  z.coerce.number({ invalid_type_error: `${label} must be a number` }).int(`${label} must be a whole number`);

export const registerSchema = z.object({
  username: z.string().trim().min(2, 'Name is too short').max(40, 'Name is too long'),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+92|0)?3\d{9}$/, 'Enter a Pakistani mobile number like 03001234567')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  referralCode: z.string().trim().max(40).optional().or(z.literal('')),
  ageConfirmed: z.literal(true, { errorMap: () => ({ message: 'You must confirm you are 18 or older' }) }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password').max(100),
});

export const createGameSchema = z
  .object({
    gameName: z.string().trim().min(3, 'Game name is too short').max(80),
    description: z.string().trim().max(500).optional().default(''),
    gameAmount: rupees('Entry fee').min(1, 'Entry fee must be at least Rs 1').max(100000),
    requiredUsers: rupees('Seats').min(1).max(10_000_000),
    startTime: z.coerce.date({ invalid_type_error: 'Pick a start time' }),
    endTime: z.coerce.date({ invalid_type_error: 'Pick an end time' }),
    prizes: z
      .array(z.object({ prizeId: objectId, quantity: rupees('Quantity').min(1).max(10000) }))
      .min(1, 'Add at least one prize'),
  })
  .refine((v) => v.endTime > v.startTime, { message: 'End time must be after start time', path: ['endTime'] })
  .refine((v) => v.endTime > new Date(), { message: 'End time must be in the future', path: ['endTime'] });

export const updateGameSchema = z.object({
  gameName: z.string().trim().min(3).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  endTime: z.coerce.date().optional(),
  paused: z.boolean().optional(),
});

export const prizeSchema = z.object({
  prizeName: z.string().trim().min(2, 'Prize name is too short').max(80),
  prizeImage: z.string().url('Upload an image first'),
  prizeWorth: rupees('Worth').min(0).max(100_000_000),
  type: z.enum(['item', 'cash']).default('item'),
});

export const depositSchema = z.object({
  method: z.enum(['easypaisa', 'jazzcash', 'bank']),
  amount: rupees('Amount').min(1).max(500000),
  reference: z.string().trim().min(4, 'Enter the transaction ID from your SMS').max(60),
  accountNumber: z.string().trim().max(40).optional().default(''),
});

export const withdrawSchema = z.object({
  method: z.enum(['easypaisa', 'jazzcash', 'bank']),
  amount: rupees('Amount').min(1).max(500000),
  accountName: z.string().trim().min(2, 'Enter the account holder name').max(60),
  accountNumber: z.string().trim().min(6, 'Enter the account or mobile number').max(40),
});

export const reviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().trim().max(200).optional().default(''),
});

export const settingsSchema = z.object({
  depositAccounts: z
    .array(z.object({ method: z.enum(['easypaisa', 'jazzcash', 'bank']), title: z.string().trim().max(60), number: z.string().trim().max(40) }))
    .max(6),
  minDeposit: rupees('Minimum deposit').min(1),
  minWithdrawal: rupees('Minimum withdrawal').min(1),
  announcement: z.string().trim().max(200).optional().default(''),
});

export const adjustSchema = z.object({
  isBlocked: z.boolean().optional(),
  adjustAmount: rupees('Amount').optional(),
  adjustNote: z.string().trim().max(120).optional(),
});

export { objectId };
