const { z } = require('zod');

const courseQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const syllabusModuleSchema = z.object({
  title: z
    .string({ required_error: 'Module title is required' })
    .trim()
    .min(1, 'Module title cannot be empty'),
  topics: z
    .array(z.string().trim())
    .default([]),
});

const lessonSchema = z.object({
  title: z
    .string({ required_error: 'Lesson title is required' })
    .trim()
    .min(1, 'Lesson title cannot be empty'),
  videoUrl: z
    .string({ required_error: 'Video URL is required' })
    .trim()
    .url('Video URL must be a valid URL'),
  order: z.number().int().default(0),
  isPreview: z.boolean().default(false),
});

const createCourseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(2, 'Category must be at least 2 characters'),
  shortDescription: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  thumbnailUrl: z.string().trim().optional().default(''),
  price: z
    .number({ required_error: 'Price in paise is required' })
    .int('Price must be an integer representing paise (e.g. 1999900 for ₹19,999)')
    .min(0, 'Price must be non-negative'),
  discountPrice: z
    .number()
    .int('Discount price must be an integer representing paise')
    .min(0, 'Discount price must be non-negative')
    .optional()
    .nullable(),
  duration: z.string().trim().optional().default(''),
  mode: z.enum(['online', 'offline', 'hybrid']).default('online'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  syllabus: z.array(syllabusModuleSchema).default([]),
  lessons: z.array(lessonSchema).default([]),
  isPublished: z.boolean().default(false),
});

const updateCourseSchema = createCourseSchema.partial();

module.exports = {
  courseQuerySchema,
  createCourseSchema,
  updateCourseSchema,
};
