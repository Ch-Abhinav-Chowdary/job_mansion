import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { User, Lock, Shield, Mail, Phone } from 'lucide-react';

const Profile = () => {
  const { user, token, setSession } = useAuth();
  const { showToast } = useToast();

  // Profile edit state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Keep state synced if user context changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Update profile handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');

    try {
      setProfileLoading(true);
      const res = await api.put('/users/me', {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });

      const updatedUser = res.data.data.user;
      setSession(token, updatedUser);

      showToast({
        message: 'Profile information updated successfully.',
        type: 'success',
      });
      setProfileMsg('Changes saved.');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Unable to update profile. Please try again.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      setPwdLoading(true);
      await api.put('/users/me/password', {
        currentPassword,
        newPassword,
      });

      showToast({
        message: 'Password changed successfully.',
        type: 'success',
      });
      setPwdSuccess('Your password has been updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to change password. Please check your current password.';
      setPwdError(msg);
      showToast({ message: msg, type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-5 md:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
          Student Profile
        </h1>
        <p className="text-sm text-muted mt-1">
          Manage your contact credentials and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Personal Info Form */}
        <Card padding="md" className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-display font-semibold text-ink flex items-center gap-2">
              <User size={18} className="text-primary" /> Personal Information
            </h3>
            <Badge variant="category">{user?.role || 'user'}</Badge>
          </div>

          {profileMsg && (
            <div className="p-3 rounded-sm bg-success-soft text-success text-xs font-medium">
              {profileMsg}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              id="profile-name"
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Email address
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-bg border border-border text-sm text-muted">
                <Mail size={16} className="text-muted shrink-0" />
                <span className="truncate">{user?.email}</span>
              </div>
              <span className="text-[11px] text-muted mt-1 block">
                Email address is locked for account verification.
              </span>
            </div>

            <Input
              id="profile-phone"
              type="tel"
              label="Mobile phone"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              loading={profileLoading}
              className="w-full"
            >
              Save profile changes
            </Button>
          </form>
        </Card>

        {/* Right Column: Password Change Form */}
        <Card padding="md" className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-base font-display font-semibold text-ink flex items-center gap-2">
              <Lock size={18} className="text-primary" /> Security & Password
            </h3>
          </div>

          {pwdError && (
            <div className="p-3 rounded-sm bg-error-soft text-error text-xs font-medium">
              {pwdError}
            </div>
          )}

          {pwdSuccess && (
            <div className="p-3 rounded-sm bg-success-soft text-success text-xs font-medium">
              {pwdSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              id="current-password"
              type="password"
              label="Current password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              id="new-password"
              type="password"
              label="New password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              id="confirm-new-password"
              type="password"
              label="Confirm new password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="secondary"
              loading={pwdLoading}
              className="w-full"
            >
              Update password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
