import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EnquiryForm from '../../components/common/EnquiryForm';
import {
  Clock,
  BarChart,
  Video,
  CheckCircle,
  ChevronDown,
  PlayCircle,
  ShieldCheck,
  FileText,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [activeSection, setActiveSection] = useState('overview');
  const [openModules, setOpenModules] = useState({ 0: true });
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  // 1. Fetch course details
  const {
    data: courseData,
    isLoading: courseLoading,
    isError: courseError,
  } = useQuery({
    queryKey: ['courseDetail', slug],
    queryFn: async () => {
      const res = await api.get(`/courses/${slug}`);
      return res.data.data.course;
    },
  });

  // 2. Fetch user enrollments if logged in
  const { data: userEnrollments } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const res = await api.get('/users/me/enrollments');
      return res.data.data.enrollments;
    },
    enabled: isAuthenticated,
  });

  const course = courseData;

  const isEnrolled = Boolean(
    userEnrollments?.some(
      (e) =>
        e.course?._id === course?._id ||
        e.course?.slug === course?.slug
    )
  );

  const toggleModule = (idx) => {
    setOpenModules((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // Dynamically load Razorpay checkout script if needed
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const [mockCheckoutOrder, setMockCheckoutOrder] = useState(null);
  const [mockVerifying, setMockVerifying] = useState(false);

  // Handle Enrollment / Payment
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (isEnrolled) {
      navigate(`/learn/${course.slug}`);
      return;
    }

    try {
      setPaying(true);

      // Step 1: Create order on server
      const { data: orderRes } = await api.post('/payments/create-order', {
        courseId: course._id,
      });

      const { orderId, amount, currency, keyId } = orderRes.data;

      // Check if we are running with mock development keys
      const isMock =
        !keyId ||
        keyId.includes('mock') ||
        keyId.includes('placeholder') ||
        orderId.startsWith('order_mock_');

      if (isMock) {
        setMockCheckoutOrder({ orderId, amount, currency, keyId });
        return;
      }

      // Step 2: For real Razorpay test/live keys, load SDK and open popup
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast({
          message: 'Razorpay SDK failed to load. Please check your internet connection.',
          type: 'error',
        });
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Job Mansion',
        description: course.title,
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#0E5A52',
        },
        handler: async (response) => {
          try {
            // Step 3: Verify payment on server
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              showToast({
                message: 'Enrollment confirmed! Welcome to the course.',
                type: 'success',
              });
              navigate(`/learn/${course.slug}`);
            }
          } catch (verifyErr) {
            showToast({
              message:
                verifyErr.response?.data?.message ||
                'Payment verification failed. Please contact support.',
              type: 'error',
            });
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        showToast({
          message: resp.error.description || 'Payment was cancelled or failed.',
          type: 'error',
        });
      });
      rzp.open();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to initialize checkout. Please try again.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setPaying(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!mockCheckoutOrder) return;
    try {
      setMockVerifying(true);
      const verifyRes = await api.post('/payments/verify', {
        razorpay_order_id: mockCheckoutOrder.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
      });

      if (verifyRes.data.success) {
        showToast({
          message: 'Test payment verified! Enrollment activated.',
          type: 'success',
        });
        setMockCheckoutOrder(null);
        navigate(`/learn/${course.slug}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Payment simulation failed.';
      showToast({ message: msg, type: 'error' });
    } finally {
      setMockVerifying(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-12 animate-pulse space-y-8">
        <div className="h-8 bg-surface rounded w-2/3" />
        <div className="h-4 bg-surface rounded w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-surface rounded-md" />
          <div className="lg:col-span-4 h-96 bg-surface rounded-md" />
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-16 text-center">
        <AlertCircle size={32} className="mx-auto text-error mb-3" />
        <h2 className="text-2xl font-display font-bold text-ink mb-2">
          Course not found
        </h2>
        <p className="text-muted mb-6">
          The requested course is not currently available or has been unpublished.
        </p>
        <Link to="/courses">
          <Button variant="primary">Browse available courses</Button>
        </Link>
      </div>
    );
  }

  const effectivePrice = course.discountPrice || course.price;
  const previewLessons = course.lessons?.filter((l) => l.isPreview) || [];

  return (
    <div className="pb-24 md:pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER: Title, one-line outcome, level, duration, mode
          ───────────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border py-10 md:py-14">
        <div className="max-w-[1120px] mx-auto px-5 md:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="category">{course.category}</Badge>
              <span className="text-xs text-muted uppercase tracking-wider font-medium">
                Cohort Training
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-ink tracking-tight">
              {course.title}
            </h1>

            <p className="text-base md:text-lg text-muted leading-relaxed">
              {course.shortDescription || course.description}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-ink pt-2">
              <span className="flex items-center gap-1.5">
                <Clock size={16} className="text-primary" />
                <span className="text-muted">Duration:</span>{' '}
                <strong>{course.duration}</strong>
              </span>

              <span className="flex items-center gap-1.5 capitalize">
                <BarChart size={16} className="text-primary" />
                <span className="text-muted">Level:</span>{' '}
                <strong>{course.level}</strong>
              </span>

              <span className="flex items-center gap-1.5 uppercase">
                <Video size={16} className="text-primary" />
                <span className="text-muted">Mode:</span>{' '}
                <strong>{course.mode}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. TWO-COLUMN LAYOUT: Left Sections + Right Sticky Enrollment Card
          ───────────────────────────────────────────────────────────── */}
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 pt-8 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Anchored Sections */}
          <div className="lg:col-span-8 space-y-12">
            {/* Nav Tabs */}
            <nav className="flex items-center gap-6 border-b border-border pb-3 text-sm font-medium">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'syllabus', label: 'Syllabus' },
                { id: 'previews', label: 'Preview lessons' },
                { id: 'faq', label: 'FAQ' },
              ].map((tab) => (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  onClick={() => setActiveSection(tab.id)}
                  className={`transition-colors ${
                    activeSection === tab.id
                      ? 'text-primary font-semibold border-b-2 border-primary pb-3 -mb-3.5'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {tab.label}
                </a>
              ))}
            </nav>

            {/* Section 1: Overview */}
            <section id="overview" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-ink">
                Course overview
              </h2>
              <div className="prose text-base text-ink leading-relaxed space-y-4">
                <p>{course.description}</p>
                <div className="p-4 rounded-md bg-surface border border-border">
                  <h4 className="text-sm font-semibold text-ink mb-2">
                    Prerequisites and equipment
                  </h4>
                  <ul className="text-sm text-muted list-disc list-inside space-y-1">
                    <li>Basic computer literacy and comfort with a text editor</li>
                    <li>Laptop or desktop with minimum 8 GB RAM</li>
                    <li>Stable internet connection for live video participation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2: Syllabus Accordion */}
            <section id="syllabus" className="space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-display font-semibold text-ink">
                  Syllabus breakdown
                </h2>
                <span className="text-xs text-muted">
                  {course.syllabus?.length || 0} modules
                </span>
              </div>

              <div className="space-y-3">
                {course.syllabus?.map((module, idx) => {
                  const isOpen = !!openModules[idx];
                  return (
                    <div
                      key={module._id || idx}
                      className="rounded-md border border-border bg-surface overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleModule(idx)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-bg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-primary-soft text-primary">
                            {idx + 1}
                          </span>
                          <span className="text-sm md:text-base font-semibold text-ink">
                            {module.title}
                          </span>
                        </div>
                        <ChevronDown
                          size={18}
                          className={`text-muted transition-transform duration-150 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 border-t border-border/50 bg-bg/30">
                          <ul className="space-y-2 mt-3">
                            {module.topics?.map((topic, tIdx) => (
                              <li
                                key={tIdx}
                                className="flex items-start gap-2 text-sm text-muted"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 3: Preview Lessons */}
            <section id="previews" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-ink">
                Preview lessons
              </h2>
              {previewLessons.length === 0 ? (
                <p className="text-sm text-muted">
                  No preview lessons are currently available for this course. Book a free demo to experience a live session.
                </p>
              ) : (
                <div className="space-y-3">
                  {previewLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="p-4 rounded-md border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <PlayCircle size={22} className="text-primary shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-ink">
                            {lesson.title}
                          </h4>
                          <span className="text-xs text-muted">Free sample lesson</span>
                        </div>
                      </div>
                      {lesson.videoUrl && (
                        <a
                          href={lesson.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Watch sample video
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 4: FAQ */}
            <section id="faq" className="space-y-4 scroll-mt-24">
              <h2 className="text-xl md:text-2xl font-display font-semibold text-ink">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-md bg-surface border border-border">
                  <h4 className="text-sm font-semibold text-ink mb-1">
                    What if I miss a live session?
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    All class recordings and code repositories are uploaded to your student dashboard within 24 hours of each lecture.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-surface border border-border">
                  <h4 className="text-sm font-semibold text-ink mb-1">
                    How does placement support work?
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    You receive 1:1 resume critiques, GitHub portfolio reviews, and scheduled mock technical interviews until you transition into a software role.
                  </p>
                </div>

                <div className="p-4 rounded-md bg-surface border border-border">
                  <h4 className="text-sm font-semibold text-ink mb-1">
                    Is there an installment option?
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    Yes, credit card and debit card EMI options are supported directly through Razorpay during checkout.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Enrollment Card (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20">
            <div className="p-6 rounded-md bg-surface border border-border shadow-md space-y-6">
              <div>
                <span className="text-xs text-muted block mb-1">Tuition fee</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-display font-bold text-ink">
                    {formatPrice(effectivePrice)}
                  </span>
                  {course.discountPrice && (
                    <span className="text-base text-muted line-through">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">One-time payment or EMI</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isEnrolled ? (
                  <Link to={`/learn/${course.slug}`} className="block">
                    <Button variant="primary" className="w-full">
                      Go to course
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      loading={paying}
                      onClick={handleEnroll}
                      className="w-full text-base"
                    >
                      {paying ? 'Processing...' : `Enroll now for ${formatPrice(effectivePrice)}`}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setDemoModalOpen(true)}
                      className="w-full text-sm"
                    >
                      Book a free demo
                    </Button>
                  </>
                )}
              </div>

              {/* What is Included List */}
              <div className="pt-4 border-t border-border space-y-2.5 text-xs text-ink">
                <span className="font-semibold block text-muted uppercase tracking-wider text-[11px]">
                  What is included
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-success shrink-0" />
                  <span>Full access to all course modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-success shrink-0" />
                  <span>Live code reviews by working engineers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-success shrink-0" />
                  <span>GitHub repositories & portfolio projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-success shrink-0" />
                  <span>Resume review & technical mock rounds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} className="text-success shrink-0" />
                  <span>Official course completion certificate</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-xs text-muted">
                <ShieldCheck size={16} className="text-primary" />
                <span>Secure payment via Razorpay</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Fixed Bottom Enrollment Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border p-4 shadow-md z-30 flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-muted block leading-none">Fee</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-display font-bold text-ink">
              {formatPrice(effectivePrice)}
            </span>
            {course.discountPrice && (
              <span className="text-xs text-muted line-through">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEnrolled && (
            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="text-xs font-semibold text-primary px-3 py-2"
            >
              Free demo
            </button>
          )}

          {isEnrolled ? (
            <Link to={`/learn/${course.slug}`}>
              <Button variant="primary" size="sm">
                Go to course
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              loading={paying}
              onClick={handleEnroll}
            >
              Enroll now
            </Button>
          )}
        </div>
      </div>

      {/* Free Demo Modal */}
      <Modal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        title="Book a free demo session"
      >
        <EnquiryForm
          defaultCourseId={course._id}
          title=""
          subtitle={`Attend an interactive introductory session for ${course.title}.`}
          onSuccess={() => setDemoModalOpen(false)}
        />
      </Modal>

      {/* Razorpay Test Checkout Simulation Modal (Development Mode) */}
      <Modal
        isOpen={!!mockCheckoutOrder}
        onClose={() => setMockCheckoutOrder(null)}
        title="Razorpay Test Checkout"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-sm bg-accent-soft/80 border border-border text-xs text-ink space-y-1">
            <strong>Development Environment Notice:</strong>
            <p className="text-muted leading-relaxed">
              Razorpay keys in <code className="text-ink font-mono font-semibold">server/.env</code> are mock credentials (<code className="font-mono">rzp_test_mock_12345678</code>). Razorpay's live servers reject dummy keys with 401 Unauthorized.
            </p>
            <p className="text-muted leading-relaxed">
              You can simulate checkout and verify signature activation right here. To enable Razorpay's official credit card / UPI popup, add real test keys from <strong className="text-ink">dashboard.razorpay.com</strong> into <code className="font-mono text-ink">server/.env</code>.
            </p>
          </div>

          <div className="p-4 rounded-sm bg-bg border border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Course:</span>
              <strong className="text-ink">{course.title}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Order ID:</span>
              <span className="font-mono text-xs text-muted">{mockCheckoutOrder?.orderId}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span className="text-ink">Amount:</span>
              <span className="text-primary">{formatPrice(mockCheckoutOrder?.amount)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              loading={mockVerifying}
              onClick={handleSimulatePayment}
              className="w-full"
            >
              Simulate Successful Payment
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                showToast({ message: 'Payment cancelled.', type: 'warning' });
                setMockCheckoutOrder(null);
              }}
              className="w-full text-muted hover:text-ink"
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetail;
