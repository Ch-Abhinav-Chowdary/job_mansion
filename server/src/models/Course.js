const mongoose = require('mongoose');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const syllabusModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
    },
  },
  { _id: true }
);

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price in paise is required'],
      min: [0, 'Price must be non-negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Price must be an integer representing paise',
      },
    },
    discountPrice: {
      type: Number,
      default: null,
      min: [0, 'Discount price must be non-negative'],
      validate: {
        validator: function (v) {
          return v === null || Number.isInteger(v);
        },
        message: 'Discount price must be an integer representing paise',
      },
    },
    duration: {
      type: String,
      default: '',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    syllabus: {
      type: [syllabusModuleSchema],
      default: [],
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate a unique slug from title before validation
courseSchema.pre('validate', async function () {
  if (!this.slug || this.isModified('title')) {
    const baseSlug = slugify(this.title || 'course');
    let candidateSlug = baseSlug;
    let counter = 1;
    // Check for collisions across existing courses if DB connection is active
    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.models.Course) {
      while (await mongoose.models.Course.findOne({ slug: candidateSlug, _id: { $ne: this._id } })) {
        candidateSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }
    this.slug = candidateSlug;
  }
});

// Indexes as specified in Project Guide Section 6
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
