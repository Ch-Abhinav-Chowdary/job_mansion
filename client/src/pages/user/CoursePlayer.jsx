import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  BookOpen,
  FileCode,
} from 'lucide-react';

const CoursePlayer = () => {
  const { courseSlug } = useParams();
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [openModules, setOpenModules] = useState({ 0: true });

  // 1. Fetch public course info to get _id
  const {
    data: baseCourse,
    isLoading: baseLoading,
    isError: baseError,
  } = useQuery({
    queryKey: ['playerCourseBase', courseSlug],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseSlug}`);
      return res.data.data.course;
    },
  });

  const courseId = baseCourse?._id;

  // 2. Fetch full course content with video URLs (requires enrollment)
  const {
    data: fullCourseData,
    isLoading: contentLoading,
    isError: contentError,
    error: contentErrObj,
  } = useQuery({
    queryKey: ['courseFullContent', courseId],
    queryFn: async () => {
      const res = await api.get(`/courses/${courseId}/content`);
      return res.data.data.course;
    },
    enabled: !!courseId,
    retry: false,
  });

  const course = fullCourseData || baseCourse;
  const lessons = course?.lessons || [];
  const activeLesson = lessons[activeLessonIndex] || lessons[0];

  const isForbidden =
    contentError && contentErrObj?.response?.status === 403;

  const toggleModule = (idx) => {
    setOpenModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Convert youtube watch URL to embed URL if applicable
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
      return url;
    } catch (_) {
      return url;
    }
  };

  if (baseLoading || (contentLoading && !isForbidden)) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-surface rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 bg-surface rounded-md" />
          <div className="lg:col-span-4 h-96 bg-surface rounded-md" />
        </div>
      </div>
    );
  }

  // Not enrolled guard state
  if (isForbidden) {
    return (
      <div className="max-w-[640px] mx-auto px-5 py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-warning-soft text-warning flex items-center justify-center">
          <Lock size={24} />
        </div>
        <h1 className="text-2xl font-display font-bold text-ink">
          Enrollment required
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          Full classroom videos and curriculum repositories for <strong>{baseCourse?.title}</strong> are only accessible to enrolled students.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link to={`/courses/${courseSlug}`}>
            <Button variant="primary">Enroll in this course</Button>
          </Link>
          <Link to="/my-courses">
            <Button variant="secondary">Back to my courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (baseError || !course) {
    return (
      <div className="max-w-[640px] mx-auto px-5 py-16 text-center space-y-4">
        <h1 className="text-2xl font-display font-bold text-ink">
          Course not found
        </h1>
        <Link to="/courses">
          <Button variant="primary">Browse courses</Button>
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(activeLesson?.videoUrl);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/my-courses"
            className="p-1.5 rounded-sm hover:bg-bg text-muted hover:text-ink transition-colors"
            title="Back to my courses"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <span className="text-xs text-muted block uppercase tracking-wider font-semibold">
              Classroom
            </span>
            <h1 className="text-lg md:text-xl font-display font-bold text-ink truncate max-w-xl">
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="category">{course.category}</Badge>
          <Badge variant="active">Live Cohort</Badge>
        </div>
      </div>

      {/* Main Grid: Video Player on Left + Lesson/Syllabus Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Player & Details */}
        <div className="lg:col-span-8 space-y-5">
          {/* Video Container */}
          <div className="rounded-md overflow-hidden bg-ink aspect-video border border-border shadow-md relative">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={activeLesson?.title || 'Lesson video'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/70">
                <PlayCircle size={48} className="mb-2 text-white/40" />
                <p className="text-sm font-medium">
                  Select a lesson to begin playback
                </p>
                <p className="text-xs text-white/40 mt-1 max-w-sm">
                  Live sessions are recorded and made available here after class.
                </p>
              </div>
            )}
          </div>

          {/* Active Lesson Metadata */}
          <div className="p-6 rounded-md bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Lesson {(activeLessonIndex + 1).toString().padStart(2, '0')} of {lessons.length}
              </span>
              {activeLesson?.isPreview && (
                <Badge variant="featured">Free preview</Badge>
              )}
            </div>

            <h2 className="text-xl font-display font-bold text-ink">
              {activeLesson?.title || 'Lesson title'}
            </h2>

            <p className="text-sm text-muted leading-relaxed">
              Follow along with your local development environment. Review the topics list in the sidebar and build the corresponding sprint tasks.
            </p>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>Instructor-verified syllabus code</span>
              <div className="flex items-center gap-1.5 font-medium text-ink">
                <FileCode size={14} className="text-primary" />
                Repository branch: main
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lessons & Syllabus Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-md border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
              Lessons playlist ({lessons.length})
            </h3>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {lessons.map((lesson, idx) => {
                const isActive = idx === activeLessonIndex;
                return (
                  <button
                    key={lesson._id || idx}
                    type="button"
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`w-full p-2.5 rounded-sm text-left flex items-start gap-2.5 transition-colors ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-xs'
                        : 'hover:bg-primary-soft text-ink'
                    }`}
                  >
                    <PlayCircle
                      size={18}
                      className={`shrink-0 mt-0.5 ${
                        isActive ? 'text-white' : 'text-primary'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">
                        {lesson.title}
                      </p>
                      {lesson.isPreview && (
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isActive ? 'text-accent-soft' : 'text-muted'
                          }`}
                        >
                          Preview
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Syllabus Modules Accordion */}
          <div className="rounded-md border border-border bg-surface p-4 space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Course modules
            </h3>

            <div className="space-y-2">
              {course.syllabus?.map((mod, idx) => {
                const isOpen = !!openModules[idx];
                return (
                  <div
                    key={mod._id || idx}
                    className="border border-border rounded-sm overflow-hidden text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleModule(idx)}
                      className="w-full p-2.5 text-left bg-bg flex items-center justify-between font-semibold text-ink hover:bg-bg/80"
                    >
                      <span className="truncate pr-2">{mod.title}</span>
                      <ChevronDown
                        size={14}
                        className={`text-muted shrink-0 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-3 bg-surface border-t border-border space-y-1.5">
                        {mod.topics?.map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-start gap-2 text-muted"
                          >
                            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
