import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import { Mail, Phone, Clock, MessageSquare, CheckCircle } from 'lucide-react';

const STATUSES = ['new', 'contacted', 'closed'];

const Enquiries = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminEnquiriesList', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '50');

      const res = await api.get(`/admin/enquiries?${params.toString()}`);
      return res.data.data.enquiries;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/admin/enquiries/${id}`, { status });
    },
    onSuccess: () => {
      showToast({ message: 'Enquiry status updated.', type: 'success' });
      queryClient.invalidateQueries(['adminEnquiriesList']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update status.';
      showToast({ message: msg, type: 'error' });
    },
  });

  const enquiries = data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Admissions & Demo Enquiries
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Incoming questions and demo booking requests from prospective students.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Status:</span>
          {['', 'new', 'contacted', 'closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-sm capitalize border transition-colors ${
                statusFilter === st
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-ink hover:bg-bg'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-md bg-surface border border-border animate-pulse" />
      ) : enquiries.length === 0 ? (
        <div className="p-8 rounded-md bg-surface border border-border text-center text-sm text-muted">
          No enquiries found matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enquiries.map((enq) => (
            <div
              key={enq._id}
              className="p-5 rounded-md bg-surface border border-border shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-primary-soft text-primary">
                      {enq.type === 'demo' ? 'Free demo' : 'General inquiry'}
                    </span>
                    {enq.course && (
                      <span className="text-xs text-muted truncate max-w-[150px]">
                        {enq.course.title || 'Course'}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm capitalize ${
                      enq.status === 'new'
                        ? 'bg-accent-soft text-ink font-bold'
                        : enq.status === 'contacted'
                        ? 'bg-primary-soft text-primary'
                        : 'bg-bg text-muted'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-ink">{enq.name}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mt-1">
                    <a
                      href={`mailto:${enq.email}`}
                      className="hover:text-primary flex items-center gap-1"
                    >
                      <Mail size={12} /> {enq.email}
                    </a>
                    <a
                      href={`tel:${enq.phone}`}
                      className="hover:text-primary flex items-center gap-1"
                    >
                      <Phone size={12} /> {enq.phone}
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-sm bg-bg border border-border text-xs text-ink leading-relaxed">
                  "{enq.message}"
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">
                  Received on {new Date(enq.createdAt).toLocaleDateString('en-IN')}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-muted font-medium">Update:</span>
                  <select
                    value={enq.status}
                    disabled={statusMutation.isPending}
                    onChange={(e) =>
                      statusMutation.mutate({
                        id: enq._id,
                        status: e.target.value,
                      })
                    }
                    className="text-xs py-1 px-2 rounded-sm bg-surface border border-border-strong text-ink focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Enquiries;
