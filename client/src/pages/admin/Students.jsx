import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';

const Students = () => {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminStudentsList', search, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ userId, isActive }) => {
      await api.patch(`/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: (_, variables) => {
      showToast({
        message: `User status changed to ${variables.isActive ? 'Active' : 'Blocked'}.`,
        type: 'success',
      });
      queryClient.invalidateQueries(['adminStudentsList']);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update user status.';
      showToast({ message: msg, type: 'error' });
    },
  });

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Student & User Accounts
          </h1>
          <p className="text-sm text-muted mt-0.5">
            View registered learners, inspect contact profiles, and manage access.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-sm bg-surface border border-border-strong text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-md bg-surface border border-border animate-pulse" />
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-bg/60 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isSelf = u._id === currentAdmin?._id;
                return (
                  <tr
                    key={u._id}
                    className="hover:bg-primary-soft/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-ink">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3 text-muted">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-sm bg-accent-soft text-ink">
                          <Shield size={12} /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted font-medium">User</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'active' : 'failed'}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isSelf ? (
                        <span className="text-xs text-muted italic">Self</span>
                      ) : (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              userId: u._id,
                              isActive: !u.isActive,
                            })
                          }
                          className={`text-xs font-semibold px-2.5 py-1 rounded-sm transition-colors ${
                            u.isActive
                              ? 'text-error hover:bg-error-soft'
                              : 'text-success hover:bg-success-soft'
                          }`}
                        >
                          {u.isActive ? 'Block access' : 'Unblock'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Students;
