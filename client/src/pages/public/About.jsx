import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { ArrowRight, Check } from 'lucide-react';

const PRINCIPLES = [
  {
    title: 'Code over slides',
    desc: 'Students learn software development by writing, debugging, and deploying applications, not by memorizing PowerPoint bullets.',
  },
  {
    title: 'Honest pricing in rupees',
    desc: 'Tuition fees are displayed openly with no surprise registration fees, mandatory upsells, or hidden loan commissions.',
  },
  {
    title: 'Small cohorts with accountable faculty',
    desc: 'Batches are capped under 25 participants to ensure instructors can review individual commits and pull requests.',
  },
  {
    title: 'Placement grounded in technical skill',
    desc: 'We do not promise automatic job guarantees. We prepare students to clear rigorous technical coding tests and system design rounds.',
  },
];

const TEAM = [
  {
    name: '[founder name]',
    role: 'Founder & Lead Instructor',
    bio: 'Former senior backend engineer with over a decade of production experience across distributed systems and cloud services.',
    initials: 'FN',
  },
  {
    name: '[instructor name]',
    role: 'Frontend Engineering Lead',
    bio: 'Specialist in modern React, browser performance, accessibility standards, and frontend system architecture.',
    initials: 'IN',
  },
  {
    name: '[advisor name]',
    role: 'Career & Placement Coordinator',
    bio: 'Coordinates technical mock rounds, portfolio audits, and direct connections with technology hiring managers.',
    initials: 'AN',
  },
];

const About = () => {
  return (
    <div className="pb-16 md:pb-24 space-y-16 md:space-y-24">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER
          ───────────────────────────────────────────────────────────── */}
      <section className="pt-10 md:pt-14 max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Our background
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
            About Job Mansion
          </h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Founded in [year founded], Job Mansion was established to bridge the gap between academic computer science curricula and the expectations of modern software engineering teams in India.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. STORY WITH REAL PHOTO
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
              Training built around actual work
            </h2>
            <div className="space-y-3 text-sm md:text-base text-ink leading-relaxed">
              <p>
                Many traditional training institutes operate like mass coaching centres. They rush through outdated slides, assign generic calculator assignments, and make unrealistic placement claims.
              </p>
              <p>
                Job Mansion was created on a different model: smaller cohorts, working engineers as instructors, and assignments that reflect actual sprint tickets. Every learner leaves with GitHub repositories containing clean commits, automated tests, and live deployed applications.
              </p>
              <p>
                Whether you are an engineering graduate seeking your first developer role or an experienced professional transitioning into full stack or data engineering, our focus remains on craft and competence.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-md overflow-hidden border border-border shadow-md bg-surface aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                alt="Engineering learners collaborating around code on laptops"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PRINCIPLES IN PLAIN LANGUAGE
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
            Core values
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
            How we operate
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRINCIPLES.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-md bg-surface border border-border space-y-2"
            >
              <h3 className="text-base font-semibold text-ink flex items-center gap-2">
                <Check size={18} className="text-primary" />
                {item.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed pl-6">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. TEAM SECTION: Consistent 8px radius avatars
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
            Instructional team
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink">
            Led by experienced engineers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="p-6 rounded-md bg-surface border border-border flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* 8px radius avatar per DESIGN.md */}
                <div className="w-14 h-14 rounded-sm bg-primary-soft text-primary font-display font-bold text-lg flex items-center justify-center">
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">{member.name}</h3>
                  <p className="text-xs font-medium text-primary mt-0.5">
                    {member.role}
                  </p>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CLOSING CALL TO ACTION
          ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1120px] mx-auto px-5 md:px-8">
        <div className="p-8 md:p-12 rounded-md bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl md:text-2xl font-display font-bold text-ink">
              Ready to begin your training?
            </h3>
            <p className="text-sm text-muted max-w-lg">
              Explore our current course syllabi or get in touch with our team for questions about cohorts and prerequisites.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/courses">
              <Button variant="primary">Browse courses</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary">Contact us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
