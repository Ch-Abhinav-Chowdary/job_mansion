import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import { CreditCard, Filter, ArrowDownUp } from 'lucide-react';

const AdminPayments = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminPaymentsList', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', page.toString());
      params.set('limit', '30');

      const res = await api.get(`/admin/payments?${params.toString()}`);
      return res.data.data;
    },
  });

  const payments = data?.payments || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">
            Payment Transactions
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Real-time ledger of Razorpay checkout orders and verified signatures.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Filter status:</span>
          {['', 'paid', 'created', 'failed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
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
      ) : payments.length === 0 ? (
        <div className="p-8 rounded-md bg-surface border border-border text-center text-sm text-muted">
          No payment transactions found matching the selected filter.
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-bg/60 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Student / User
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Course
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Order ID / Payment ID
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-primary-soft/30 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-ink">
                    {p.user?.name || 'Student'}
                    <span className="block text-xs text-muted font-normal">
                      {p.user?.email}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium text-ink">
                    {p.course?.title || 'Course'}
                  </td>

                  <td className="px-4 py-3 font-bold text-ink">
                    {formatPrice(p.amount)}
                  </td>

                  <td className="px-4 py-3 text-xs font-mono text-muted space-y-0.5">
                    <div>{p.razorpayOrderId}</div>
                    {p.razorpayPaymentId && (
                      <div className="text-primary font-semibold">
                        {p.razorpayPaymentId}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={p.status}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
