import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing from the link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        token,
        password,
      });

      if (res.data.success) {
        showToast({
          message: 'Password reset successful. Please log in with your new password.',
          type: 'success',
        });
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to reset password. The link may have expired.';
      setError(msg);
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[440px] mx-auto px-5 py-12 md:py-16">
      <Card padding="md">
        <h1 className="text-2xl font-display font-bold text-ink mb-2">
          Set new password
        </h1>
        <p className="text-sm text-muted mb-6">
          Enter a secure new password for your Job Mansion account.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-sm bg-error-soft text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="new-password"
            type="password"
            label="New password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input
            id="confirm-password"
            type="password"
            label="Confirm password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Reset password
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Remembered your password?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
