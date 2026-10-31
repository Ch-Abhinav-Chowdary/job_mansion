import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Intended destination (if redirected by ProtectedRoute)
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(email.trim(), password);
      showToast({
        message: `Welcome back, ${loggedUser.name}!`,
        type: 'success',
      });

      // Redirect destination: admin to /admin (if not explicitly headed elsewhere),
      // or user to dashboard or the original intended location
      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Invalid credentials. Please verify your email and password.';
      setError(msg);
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[440px] mx-auto px-5 py-12 md:py-16">
      <Card padding="md">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-ink">
            Log in to Job Mansion
          </h1>
          <p className="text-sm text-muted mt-1">
            Access your enrolled courses, learning portal, and live batch sessions.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-sm bg-error-soft text-error text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            type="email"
            label="Email address"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-ink"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Log in
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="text-primary hover:underline font-medium"
          >
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
