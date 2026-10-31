const { z } = require('zod');

// Update profile (name, phone, avatar optional)
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
});

// Change password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128),
});

module.exports = { updateProfileSchema, changePasswordSchema };
