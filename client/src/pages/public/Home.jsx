import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EnquiryForm from '../../components/common/EnquiryForm';
import { Clock, BarChart, ArrowRight, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Full Stack',
    icon: 'devicon-react-original colored',
    desc: 'React, Node.js, Express & MongoDB',
    param: 'Full Stack',
  },
  {
    name: 'Backend Systems',
    icon: 'devicon-java-plain colored',
    desc: 'Spring Boot, Microservices & PostgreSQL',
    param: 'Backend',
  },
  {
    name: 'Data & AI',
    icon: 'devicon-python-plain colored',
    desc: 'Python, SQL, Pandas & Power BI',
    param: 'Data',
  },
  {
    name: 'DevOps & Cloud',
    icon: 'devicon-docker-plain colored',
    desc: 'Docker, Kubernetes, CI/CD & AWS',
    param: 'DevOps',
  },
  {
    name: 'Software Testing',
    icon: 'devicon-selenium-original colored',
    desc: 'Manual, Selenium & API Automation',
    param: 'Testing',
  },
];

const TIMELINE = [
  {
    num: '01',
    title: 'Choose a course',
    desc: 'Select a structured technology path aligned with current Indian hiring requirements.',
  },
  {
    num: '02',
    title: 'Attend live sessions',
    desc: 'Join interactive batches led by working software engineers who review code in real time.',
  },
  {
    num: '03',
    title: 'Build portfolio projects',
    desc: 'Develop end-to-end applications and microservices that you can deploy and showcase.',
  },
  {
    num: '04',
    title: 'Get placement support',
    desc: 'Receive resume reviews, targeted interview preparation, and direct job referrals.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The focus on writing actual backend services with Spring Boot and writing unit tests made all the difference during my technical interviews.',
    name: 'Aditya Verma',
    role: 'Software Engineer',
    course: 'Java Full Stack Development',
    initials: 'AV',
  },
  {
    quote:
      'We worked directly on Git repos and deployed APIs to cloud servers during class. No generic slide decks or pre-recorded fluff.',
    name: 'Pooja Sundaram',
    role: 'Frontend Developer',
    course: 'Full Stack Web Development',
    initials: 'PS',
  },
  {
    quote:
      'The SQL and Power BI assignments mirror actual company reporting dashboards. It helped me switch careers from non-IT within four months.',
    name: 'Karthik Rao',
    role: 'Junior Data Analyst',
    course: 'Data Analytics with Power BI & SQL',
    initials: 'KR',
  },
];

const Home = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['featuredCourses'],
    queryFn: async () => {
      const res = await api.get('/courses?limit=3');
      return res.data.data.courses;
    },
  });

  const courses = data || [];
  const primaryFeatured = courses[0];
  const secondaryFeatured = courses.slice(1, 3);

  return (
    <div className="space-y-20 md:space-y-28 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION: Asymmetric two-column split
          ───────────────────────────────────────────────────────────── */}
      <section className="pt-8 md:pt-16 max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] lg:leading-[52px] font-display font-bold tracking-tight text-ink">
              Practical software engineering courses taught by working developers
            </h1>

            <p className="text-base sm:text-lg text-muted max-w-xl leading-relaxed">
              Live batches, hands-on production code, and dedicated placement mentorship to prepare you for software roles in India.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/courses">
                <Button variant="primary">Browse courses</Button>
              </Link>
              <a
                href="#enquiry-section"
                className="text-sm font-semibold text-primary hover:text-primary-hover underline underline-offset-4 transition-colors"
              >
                Book a free demo
              </a>
            </div>

            {/* Factual Trust Line */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Live instructor-led batches
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Real repository projects
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Direct placement assistance
              </span>
            </div>
          </div>

          {/* Right Column: Real Photo with Offset Accent Shape */}
          <div className="lg:col-span-5 relative">
            {/* Offset Accent Shape behind */}
            <div
              className="absolute -bottom-3 -right-3 w-full h-full rounded-md bg-accent-soft -z-10"
              aria-hidden="true"
            />
            <div className="rounded-md overflow-hidden border border-border shadow-md bg-surface aspect-4/3 relative">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
                alt="Students collaborating at laptops in a computer lab"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. COURSE CATEGORIES: Compact row of text-and-logo tiles
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="mb-6">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
            Technology stacks
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
            Explore courses by discipline
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/courses?category=${encodeURIComponent(cat.param)}`}
              className="group p-4 rounded-md bg-surface border border-border hover:border-primary hover:shadow-md transition-all duration-150 flex flex-col justify-between"
            >
              <div className="mb-4">
                <i className={`${cat.icon} text-3xl block transition-transform group-hover:scale-105`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-ink group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted mt-1 leading-snug">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR COURSES: Asymmetric list (1 large + 2 companion)
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
              Popular programs
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
              Featured training cohorts
            </h2>
          </div>
          <Link
            to="/courses"
            className="text-sm font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1.5"
          >
            View all courses <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-md border border-border bg-surface p-6 animate-pulse space-y-4">
              <div className="h-48 bg-bg rounded-md" />
              <div className="h-6 bg-bg w-3/4 rounded" />
              <div className="h-4 bg-bg w-full rounded" />
              <div className="h-8 bg-bg w-1/3 rounded" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-md border border-border bg-surface p-5 animate-pulse space-y-3">
                <div className="h-28 bg-bg rounded-md" />
                <div className="h-5 bg-bg w-2/3 rounded" />
                <div className="h-6 bg-bg w-1/4 rounded" />
              </div>
              <div className="rounded-md border border-border bg-surface p-5 animate-pulse space-y-3">
                <div className="h-28 bg-bg rounded-md" />
                <div className="h-5 bg-bg w-2/3 rounded" />
                <div className="h-6 bg-bg w-1/4 rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Honest Error State */}
        {isError && (
          <div className="p-6 rounded-md bg-error-soft border border-error/20 text-center">
            <AlertCircle size={24} className="mx-auto text-error mb-2" />
            <p className="text-sm text-ink mb-3">
              Unable to load featured courses right now.
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        )}

        {/* Real Content */}
        {!isLoading && !isError && primaryFeatured && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary Large Card */}
            <div className="lg:col-span-7 rounded-md border border-border bg-surface p-6 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all duration-150">
              <div className="space-y-4">
                <div className="rounded-md overflow-hidden bg-bg aspect-16/9 relative border border-border">
                  <img
                    src={primaryFeatured.thumbnailUrl || 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&w=800&q=80'}
                    alt={primaryFeatured.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="category">{primaryFeatured.category}</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-display font-semibold text-ink">
                    {primaryFeatured.title}
                  </h3>
                  <p className="text-sm text-muted mt-2 leading-relaxed">
                    {primaryFeatured.shortDescription || primaryFeatured.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {primaryFeatured.duration}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <BarChart size={14} />
                    {primaryFeatured.level}
                  </span>
                  <span className="uppercase font-medium">
                    {primaryFeatured.mode}
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted block">Tuition fee</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-bold text-ink">
                      {formatPrice(primaryFeatured.discountPrice || primaryFeatured.price)}
                    </span>
                    {primaryFeatured.discountPrice && (
                      <span className="text-sm text-muted line-through">
                        {formatPrice(primaryFeatured.price)}
                      </span>
                    )}
                  </div>
                </div>

                <Link to={`/courses/${primaryFeatured.slug}`}>
                  <Button variant="primary" size="md">
                    View curriculum
                  </Button>
                </Link>
              </div>
            </div>

            {/* Secondary Compact Stack (2 items) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {secondaryFeatured.map((course) => (
                <div
                  key={course._id}
                  className="rounded-md border border-border bg-surface p-5 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all duration-150 flex-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="category">{course.category}</Badge>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Clock size={13} />
                        {course.duration}
                      </span>
                    </div>

                    <h4 className="text-lg font-display font-semibold text-ink">
                      {course.title}
                    </h4>

                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-lg font-display font-bold text-ink">
                        {formatPrice(course.discountPrice || course.price)}
                      </span>
                      {course.discountPrice && (
                        <span className="text-xs text-muted line-through ml-2">
                          {formatPrice(course.price)}
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/courses/${course.slug}`}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS: Numbered vertical timeline
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="mb-10 text-left">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
            Methodology
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
            How training proceeds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {TIMELINE.map((step) => (
            <div
              key={step.num}
              className="p-5 rounded-md bg-surface border border-border relative"
            >
              <span className="font-display font-bold text-2xl text-primary/70 block mb-2">
                {step.num}
              </span>
              <h3 className="text-base font-semibold text-ink mb-1.5">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. WHY JOB MANSION: Two-column narrative + stacked list
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="p-8 md:p-12 rounded-md bg-surface border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left side text */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Direct approach
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
                Why learn with Job Mansion
              </h2>
              <p className="text-base text-muted leading-relaxed">
                Most coaching centres rely on passive slides and high-volume classrooms. We structure every batch around technical competence, code reviews, and honest career mentorship.
              </p>
            </div>

            {/* Right side: 4 specific stacked points (no icons in circles) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-sm bg-bg border border-border">
                <h4 className="text-sm font-semibold text-ink mb-1">
                  Small cohorts of under 25 learners
                </h4>
                <p className="text-sm text-muted">
                  Every participant gets direct screen time, active code evaluation, and instructor answers during every session.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-bg border border-border">
                <h4 className="text-sm font-semibold text-ink mb-1">
                  Quarterly curriculum reviews
                </h4>
                <p className="text-sm text-muted">
                  Course modules are evaluated with lead developers working at Indian product firms and tier-1 service companies.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-bg border border-border">
                <h4 className="text-sm font-semibold text-ink mb-1">
                  Live code debugging during class
                </h4>
                <p className="text-sm text-muted">
                  We write code live, trigger runtime exceptions intentionally, and inspect stack traces together.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-bg border border-border">
                <h4 className="text-sm font-semibold text-ink mb-1">
                  Placement support until placement
                </h4>
                <p className="text-sm text-muted">
                  Continuous resume iteration, GitHub profile audit, and scheduled technical mock rounds until you complete your transition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. STUDENT VOICES: 3 testimonials with 8px radius avatars
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">
            Alumni feedback
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
            Feedback from former students
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-md bg-surface border border-border flex flex-col justify-between"
            >
              <blockquote className="text-sm text-ink leading-relaxed mb-6 italic">
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                {/* 8px radius avatar per DESIGN.md */}
                <div className="w-10 h-10 rounded-sm bg-primary-soft text-primary font-bold flex items-center justify-center text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">{t.name}</h4>
                  <p className="text-xs text-muted">
                    {t.role} • {t.course}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. CLOSING BAND: Full-width primary-color band with form
          ───────────────────────────────────────────────────────────── */}
      <section id="enquiry-section" className="bg-primary text-white py-16 md:py-20">
        <div className="max-w-[1120px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left col headline */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-soft">
                Take the next step
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                Speak with an instructor or attend a live demo
              </h2>
              <p className="text-sm md:text-base text-primary-soft leading-relaxed">
                Have questions about course prerequisites, batch timings, or placement support? Submit your details and our team will get back to you within one working day.
              </p>
            </div>

            {/* Right col: Reusable EnquiryForm */}
            <div className="lg:col-span-7">
              <EnquiryForm
                courseOptions={courses}
                title="Request a callback or demo"
                subtitle="Fill out the form below. No spam, ever."
                className="bg-surface text-ink"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
