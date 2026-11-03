import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Register = () => {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
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
      const newUser = await registerUser(
        name.trim(),
        email.trim(),
        password,
        phone.trim() || undefined
      );

      showToast({
        message: `Account created! Welcome to Job Mansion, ${newUser.name}.`,
        type: 'success',
      });

      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.message === 'Network Error'
          ? 'Unable to connect to server. The server may be waking up, please wait a moment and try again.'
          : err.message || 'Registration failed. Please try again.');
      setError(msg);
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[460px] mx-auto px-5 py-12 md:py-16">
      <Card padding="md">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-ink">
            Create your student account
          </h1>
          <p className="text-sm text-muted mt-1">
            Sign up to enroll in batches, access curriculum repositories, and submit projects.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-sm bg-error-soft text-error text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="register-name"
            label="Full name"
            placeholder="e.g. Anand Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            id="register-email"
            type="email"
            label="Email address"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            id="register-phone"
            type="tel"
            label="Mobile number (optional)"
            placeholder="10-digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />

          <Input
            id="register-password"
            type="password"
            label="Password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            id="register-confirm-password"
            type="password"
            label="Confirm password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Create account
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted">
          Already registered?{' '}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
