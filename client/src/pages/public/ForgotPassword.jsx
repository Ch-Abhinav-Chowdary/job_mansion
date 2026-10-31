import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { MailCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
      showToast({
        message: 'Password reset link generated.',
        type: 'success',
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to process reset request. Please check the email address.';
      setError(msg);
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[440px] mx-auto px-5 py-12 md:py-16">
      <Card padding="md">
        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-success-soft text-success flex items-center justify-center">
              <MailCheck size={24} strokeWidth={2} />
            </div>
            <h2 className="text-xl font-display font-bold text-ink">
              Check your email
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              If an account exists for <strong>{email}</strong>, a password reset link has been dispatched. The link expires in 30 minutes.
            </p>
            <p className="text-xs text-muted/80 bg-bg p-3 rounded-sm border border-border">
              Note: If SMTP email is not configured in local development, the reset link is printed directly to the server terminal logs.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Return to login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold text-ink">
                Forgot password
              </h1>
              <p className="text-sm text-muted mt-1">
                Enter your registered email address and we will generate a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-sm bg-error-soft text-error text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="forgot-email"
                type="email"
                label="Registered email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full"
              >
                Send reset link
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted">
              Remembered your credentials?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Log in
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
