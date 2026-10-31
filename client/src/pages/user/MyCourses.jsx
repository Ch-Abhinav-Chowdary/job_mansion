import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { BookOpen, Clock, PlayCircle, Video } from 'lucide-react';

const MyCourses = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      const res = await api.get('/users/me/enrollments');
      return res.data.data.enrollments;
    },
  });

  const enrollments = data || [];

  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-8 md:py-12 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
          My enrolled courses
        </h1>
        <p className="text-sm text-muted mt-1">
          Access course syllabus, recorded lectures, and project repositories.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-md bg-surface border border-border animate-pulse"
            />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="You are not enrolled in any programs right now. Check our courses and select a learning cohort."
          action={
            <Link to="/courses">
              <Button variant="primary">Browse course catalog</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const course = item.course;
            if (!course) return null;

            return (
              <div
                key={item._id}
                className="rounded-md border border-border bg-surface flex flex-col justify-between hover:border-primary transition-colors p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="category">{course.category}</Badge>
                    <Badge variant="active">Active</Badge>
                  </div>

                  <h3 className="text-lg font-display font-semibold text-ink line-clamp-1">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1 uppercase">
                      <Video size={13} />
                      {course.mode}
                    </span>
                  </div>

                  <p className="text-xs text-muted">
                    Enrolled on {new Date(item.enrolledAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="pt-3 border-t border-border">
                  <Link to={`/learn/${course.slug}`}>
                    <Button variant="primary" size="sm" className="w-full inline-flex items-center justify-center gap-1.5">
                      <PlayCircle size={16} /> Open classroom
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
