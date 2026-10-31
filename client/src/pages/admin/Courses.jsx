import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';

const AdminCourses = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [deleteModalCourse, setDeleteModalCourse] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminCoursesList'],
    queryFn: async () => {
      const res = await api.get('/admin/courses?limit=50');
      return res.data.data.courses;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/courses/${id}`);
    },
    onSuccess: () => {
      showToast({ message: 'Course unpublished / deleted.', type: 'success' });
      queryClient.invalidateQueries(['adminCoursesList']);
      setDeleteModalCourse(null);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete course.';
      showToast({ message: msg, type: 'error' });
    },
  });

  const courses = data || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Course Management
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Create, update syllabus content, and control cohort publication states.
          </p>
        </div>

        <Link to="/admin/courses/new">
          <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
            <Plus size={16} /> New course
          </Button>
        </Link>
      </div>

      {/* Courses Table */}
      {isLoading ? (
        <div className="h-64 rounded-md bg-surface border border-border animate-pulse" />
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-bg/60 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Duration / Mode
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((course) => (
                <tr
                  key={course._id}
                  className="hover:bg-primary-soft/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-sm bg-bg border border-border overflow-hidden shrink-0">
                        {course.thumbnailUrl ? (
                          <img
                            src={course.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted font-bold">
                            JM
                          </div>
                        )}
                      </div>
                      <div>
                        <strong className="block text-ink text-sm font-semibold leading-snug">
                          {course.title}
                        </strong>
                        <span className="text-xs text-muted font-mono">
                          /{course.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="category">{course.category}</Badge>
                  </td>

                  <td className="px-4 py-3 text-sm">
                    <span className="font-semibold text-ink">
                      {formatPrice(course.discountPrice || course.price)}
                    </span>
                    {course.discountPrice && (
                      <span className="text-xs text-muted line-through block">
                        {formatPrice(course.price)}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-muted">
                    <span>{course.duration}</span> • <span className="uppercase">{course.mode}</span>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={course.isPublished ? 'published' : 'draft'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/courses/${course.slug}`}
                        target="_blank"
                        className="p-1.5 text-muted hover:text-ink rounded-sm"
                        title="View live page"
                      >
                        <ExternalLink size={16} />
                      </Link>

                      <Link
                        to={`/admin/courses/${course._id}/edit`}
                        className="p-1.5 text-primary hover:bg-primary-soft rounded-sm"
                        title="Edit course & syllabus"
                      >
                        <Edit2 size={16} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteModalCourse(course)}
                        className="p-1.5 text-error hover:bg-error-soft rounded-sm"
                        title="Unpublish / Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalCourse}
        onClose={() => setDeleteModalCourse(null)}
        title="Unpublish course"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink leading-relaxed">
            Are you sure you want to unpublish <strong>{deleteModalCourse?.title}</strong>? Students will no longer see this course in the catalog.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalCourse(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteModalCourse._id)}
            >
              Unpublish course
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCourses;
