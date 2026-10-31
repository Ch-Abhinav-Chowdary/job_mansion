import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Video,
  ListPlus,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = ['Full Stack', 'Backend', 'Data', 'DevOps', 'Testing'];

const CourseForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Full Stack');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [priceRupees, setPriceRupees] = useState('');
  const [discountRupees, setDiscountRupees] = useState('');
  const [duration, setDuration] = useState('3 months');
  const [level, setLevel] = useState('beginner');
  const [mode, setMode] = useState('online');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // Syllabus & Lessons
  const [syllabus, setSyllabus] = useState([
    { title: 'Module 1: Foundations', topics: 'Topic 1, Topic 2, Topic 3' },
  ]);
  const [lessons, setLessons] = useState([
    {
      title: '01. Course Introduction',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPreview: true,
    },
  ]);

  // Load existing course if editing
  const { data: existingCourse } = useQuery({
    queryKey: ['adminCourseEdit', id],
    queryFn: async () => {
      const res = await api.get('/admin/courses?limit=100');
      const all = res.data.data.courses || [];
      return all.find((c) => c._id === id);
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingCourse) {
      setTitle(existingCourse.title || '');
      setCategory(existingCourse.category || 'Full Stack');
      setShortDescription(existingCourse.shortDescription || '');
      setDescription(existingCourse.description || '');
      setPriceRupees(
        existingCourse.price ? (existingCourse.price / 100).toString() : ''
      );
      setDiscountRupees(
        existingCourse.discountPrice
          ? (existingCourse.discountPrice / 100).toString()
          : ''
      );
      setDuration(existingCourse.duration || '3 months');
      setLevel(existingCourse.level || 'beginner');
      setMode(existingCourse.mode || 'online');
      setThumbnailUrl(existingCourse.thumbnailUrl || '');
      setIsPublished(Boolean(existingCourse.isPublished));

      if (existingCourse.syllabus?.length > 0) {
        setSyllabus(
          existingCourse.syllabus.map((s) => ({
            title: s.title,
            topics: Array.isArray(s.topics) ? s.topics.join(', ') : '',
          }))
        );
      }

      if (existingCourse.lessons?.length > 0) {
        setLessons(
          existingCourse.lessons.map((l) => ({
            title: l.title,
            videoUrl: l.videoUrl || '',
            isPreview: Boolean(l.isPreview),
          }))
        );
      }
    }
  }, [existingCourse]);

  // Handle Thumbnail File Upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast({ message: 'Image must be under 2 MB.', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.url) {
        setThumbnailUrl(res.data.data.url);
        showToast({ message: 'Thumbnail uploaded to Cloudinary.', type: 'success' });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Upload failed. Ensure Cloudinary credentials are set in .env.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Syllabus helpers
  const addModule = () => {
    setSyllabus((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}: New Topic`,
        topics: 'Topic 1, Topic 2',
      },
    ]);
  };

  const removeModule = (idx) => {
    setSyllabus((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateModule = (idx, field, val) => {
    setSyllabus((prev) =>
      prev.map((mod, i) => (i === idx ? { ...mod, [field]: val } : mod))
    );
  };

  // Lesson helpers
  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        title: `${(prev.length + 1).toString().padStart(2, '0')}. New Lesson`,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isPreview: false,
      },
    ]);
  };

  const removeLesson = (idx) => {
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLesson = (idx, field, val) => {
    setLessons((prev) =>
      prev.map((les, i) => (i === idx ? { ...les, [field]: val } : les))
    );
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !priceRupees) {
      showToast({
        message: 'Please complete required fields (Title, Price).',
        type: 'error',
      });
      return;
    }

    // Convert rupees to paise integer
    const pricePaise = Math.round(parseFloat(priceRupees) * 100);
    const discountPaise = discountRupees
      ? Math.round(parseFloat(discountRupees) * 100)
      : null;

    // Parse syllabus topics
    const formattedSyllabus = syllabus.map((m) => ({
      title: m.title.trim(),
      topics: m.topics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }));

    // Parse lessons with order
    const formattedLessons = lessons.map((l, idx) => ({
      title: l.title.trim(),
      videoUrl: l.videoUrl.trim(),
      order: idx + 1,
      isPreview: Boolean(l.isPreview),
    }));

    const payload = {
      title: title.trim(),
      category: category.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: pricePaise,
      discountPrice: discountPaise,
      duration: duration.trim(),
      level,
      mode,
      thumbnailUrl: thumbnailUrl.trim(),
      syllabus: formattedSyllabus,
      lessons: formattedLessons,
      isPublished,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/admin/courses/${id}`, payload);
        showToast({ message: 'Course updated successfully.', type: 'success' });
      } else {
        await api.post('/admin/courses', payload);
        showToast({ message: 'New course created.', type: 'success' });
      }
      navigate('/admin/courses');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save course.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[840px] mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/courses"
          className="p-1.5 rounded-sm hover:bg-bg text-muted hover:text-ink"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-sm text-muted">
            Configure pricing in rupees, syllabus modules, and lesson video URLs.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Course Info */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-base font-display font-semibold text-ink border-b border-border pb-2">
            1. Basic Information
          </h3>

          <Input
            id="course-title"
            label="Course title"
            placeholder="e.g. Modern Full Stack Engineering"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="course-category"
              label="Category / Discipline"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>

            <Select
              id="course-level"
              label="Experience level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>

            <Select
              id="course-mode"
              label="Delivery mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="online">Online Live</option>
              <option value="hybrid">Hybrid</option>
              <option value="offline">In-person</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="course-duration"
              label="Duration"
              placeholder="e.g. 4 months"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Publication status
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-sm border border-border cursor-pointer bg-bg hover:bg-bg/80">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-medium text-ink">
                  Published (visible in public catalog)
                </span>
              </label>
            </div>
          </div>

          <Input
            id="course-short-desc"
            label="Short one-line outcome description"
            placeholder="Summary shown on cards and headers"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />

          <Textarea
            id="course-full-desc"
            rows={4}
            label="Full curriculum description"
            placeholder="Detailed course overview, prerequisites, and learning objectives"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Card>

        {/* Pricing in Rupees */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-base font-display font-semibold text-ink border-b border-border pb-2">
            2. Tuition & Pricing (Entered in INR ₹)
          </h3>
          <p className="text-xs text-muted">
            Prices are entered in standard rupees here and converted automatically to paise for database storage.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="course-price"
              type="number"
              label="Base tuition fee (₹)"
              placeholder="e.g. 24999"
              value={priceRupees}
              onChange={(e) => setPriceRupees(e.target.value)}
              required
            />

            <Input
              id="course-discount"
              type="number"
              label="Discounted fee (₹, optional)"
              placeholder="e.g. 19999"
              value={discountRupees}
              onChange={(e) => setDiscountRupees(e.target.value)}
            />
          </div>
        </Card>

        {/* Thumbnail Image */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-base font-display font-semibold text-ink border-b border-border pb-2">
            3. Thumbnail Image
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-48 h-32 rounded-md bg-bg border border-border overflow-hidden shrink-0 flex items-center justify-center">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Course preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted">No thumbnail uploaded</span>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full">
              <Input
                id="course-thumbnail-url"
                label="Thumbnail image URL"
                placeholder="https://images.unsplash.com/..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
              />

              <div>
                <label className="text-xs font-medium text-muted block mb-1">
                  Or upload image file (Cloudinary, max 2 MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border file:border-border file:text-xs file:font-medium file:bg-surface hover:file:bg-bg cursor-pointer"
                />
                {uploading && (
                  <span className="text-xs text-primary block mt-1">
                    Uploading image...
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Syllabus Modules Editor */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-base font-display font-semibold text-ink">
              4. Syllabus Modules ({syllabus.length})
            </h3>
            <button
              type="button"
              onClick={addModule}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus size={14} /> Add module
            </button>
          </div>

          <div className="space-y-3">
            {syllabus.map((mod, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-sm border border-border bg-bg/40 space-y-2 relative"
              >
                <div className="flex items-center justify-between gap-3">
                  <Input
                    id={`mod-title-${idx}`}
                    label={`Module ${idx + 1} Title`}
                    value={mod.title}
                    onChange={(e) => updateModule(idx, 'title', e.target.value)}
                    required
                  />
                  {syllabus.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(idx)}
                      className="p-1.5 text-muted hover:text-error self-end mb-1"
                      title="Remove module"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <Input
                  id={`mod-topics-${idx}`}
                  label="Topics (comma-separated list)"
                  placeholder="React Hooks, Virtual DOM, JSX"
                  value={mod.topics}
                  onChange={(e) => updateModule(idx, 'topics', e.target.value)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Lessons Playlist Editor */}
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-base font-display font-semibold text-ink">
              5. Lessons & Video URLs ({lessons.length})
            </h3>
            <button
              type="button"
              onClick={addLesson}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <Plus size={14} /> Add lesson
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map((les, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-sm border border-border bg-bg/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      id={`les-title-${idx}`}
                      label={`Lesson ${idx + 1} Title`}
                      value={les.title}
                      onChange={(e) => updateLesson(idx, 'title', e.target.value)}
                      required
                    />

                    <Input
                      id={`les-url-${idx}`}
                      label="Video Stream URL (YouTube / MP4)"
                      value={les.videoUrl}
                      onChange={(e) =>
                        updateLesson(idx, 'videoUrl', e.target.value)
                      }
                      required
                    />
                  </div>

                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(idx)}
                      className="p-1.5 text-muted hover:text-error self-end mb-1"
                      title="Remove lesson"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={les.isPreview}
                    onChange={(e) =>
                      updateLesson(idx, 'isPreview', e.target.checked)
                    }
                    className="accent-primary"
                  />
                  <span className="text-xs text-muted font-medium">
                    Mark as free sample preview (visible to visitors before enrollment)
                  </span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link to="/admin/courses">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Save course changes' : 'Create and publish course'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
