import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { CheckCircle2, MessageSquare } from 'lucide-react';

const indianPhoneRegex = /^[6-9]\d{9}$/;

const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters)'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, 'Please enter a valid 10-digit Indian mobile number'),
  type: z.enum(['enquiry', 'demo']),
  course: z.string().optional(),
  message: z
    .string()
    .trim()
    .min(5, 'Please provide at least a short message (minimum 5 characters)'),
});

const EnquiryForm = ({
  defaultCourseId = '',
  courseOptions = [],
  title = 'Send an enquiry',
  subtitle = 'Our admissions team responds within one working day.',
  className = '',
  onSuccess,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      type: 'enquiry',
      course: defaultCourseId || '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        type: data.type,
        message: data.message,
      };
      if (data.course && data.course.trim() !== '') {
        payload.course = data.course;
      }

      await api.post('/enquiries', payload);
      setSubmitted(true);
      showToast({
        message: 'Enquiry received. We will contact you shortly.',
        type: 'success',
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Could not submit enquiry. Please check your network and try again.';
      setSubmitError(msg);
      showToast({ message: msg, type: 'error' });
    }
  };

  if (submitted) {
    return (
      <div
        className={`p-6 md:p-8 rounded-md bg-surface border border-border shadow-sm text-center ${className}`}
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-success-soft flex items-center justify-center text-success">
          <CheckCircle2 size={24} strokeWidth={2} />
        </div>
        <h3 className="text-xl font-display font-semibold text-ink mb-2">
          Thank you for reaching out
        </h3>
        <p className="text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">
          Your request has been received. Our course advisor will contact you by phone or email within one working day.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`p-6 md:p-8 rounded-md bg-surface border border-border shadow-sm text-ink ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-xl font-display font-semibold text-ink">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted mt-1">{subtitle}</p>
        )}
      </div>

      {submitError && (
        <div className="p-3 mb-4 rounded-sm bg-error-soft text-error text-sm">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Enquiry Type Radio */}
        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            I want to
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2.5 rounded-sm border border-border-strong cursor-pointer hover:bg-bg has-[:checked]:border-primary has-[:checked]:bg-primary-soft transition-colors">
              <input
                type="radio"
                value="enquiry"
                {...register('type')}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-ink">Ask a question</span>
            </label>
            <label className="flex items-center gap-2 p-2.5 rounded-sm border border-border-strong cursor-pointer hover:bg-bg has-[:checked]:border-primary has-[:checked]:bg-primary-soft transition-colors">
              <input
                type="radio"
                value="demo"
                {...register('type')}
                className="accent-primary"
              />
              <span className="text-sm font-medium text-ink">Book a free demo</span>
            </label>
          </div>
          {errors.type && (
            <p className="mt-1 text-xs text-error">{errors.type.message}</p>
          )}
        </div>

        {/* Full Name */}
        <Input
          id="enquiry-name"
          label="Full name"
          placeholder="e.g. Ramesh Kumar"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email & Phone grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="enquiry-email"
            type="email"
            label="Email address"
            placeholder="you@domain.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="enquiry-phone"
            type="tel"
            label="Mobile number"
            placeholder="10-digit number"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        {/* Optional Course Selection */}
        {courseOptions.length > 0 && (
          <Select
            id="enquiry-course"
            label="Course of interest (optional)"
            error={errors.course?.message}
            {...register('course')}
          >
            <option value="">Select a course or general guidance</option>
            {courseOptions.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        )}

        {/* Message */}
        <Textarea
          id="enquiry-message"
          rows={3}
          label="Your question or learning background"
          placeholder="Tell us what you want to achieve or when you prefer to attend a demo session."
          error={errors.message?.message}
          {...register('message')}
        />

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="w-full"
        >
          Send enquiry
        </Button>
      </form>
    </div>
  );
};

export default EnquiryForm;
