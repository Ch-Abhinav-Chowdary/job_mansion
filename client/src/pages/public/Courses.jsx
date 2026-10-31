import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import {
  Search,
  Filter,
  X,
  Clock,
  BarChart,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Full Stack',
  'Backend',
  'Data',
  'DevOps',
  'Testing',
];

const LEVELS = [
  { label: 'All levels', value: '' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const MODES = [
  { label: 'All modes', value: '' },
  { label: 'Online live', value: 'online' },
  { label: 'Hybrid classroom', value: 'hybrid' },
];

const SORTS = [
  { label: 'Default order', value: '' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
];

// Map categories to devicon classes
const CATEGORY_ICONS = {
  'Full Stack': 'devicon-react-original colored',
  Backend: 'devicon-java-plain colored',
  Data: 'devicon-python-plain colored',
  DevOps: 'devicon-docker-plain colored',
  Testing: 'devicon-selenium-original colored',
};

const Courses = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const currentCategory = searchParams.get('category') || '';
  const currentLevel = searchParams.get('level') || '';
  const currentMode = searchParams.get('mode') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || '';

  // Local search input for debouncing
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Debounce search update to URL query params
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput.trim()) {
          next.set('search', searchInput.trim());
        } else {
          next.delete('search');
        }
        return next;
      });
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // Keep input in sync if URL changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  const updateParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  // Fetch all published courses
  const { data, isLoading, isError } = useQuery({
    queryKey: ['coursesList', currentCategory, currentSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentCategory && currentCategory !== 'All') {
        params.set('category', currentCategory);
      }
      if (currentSearch) {
        params.set('search', currentSearch);
      }
      params.set('limit', '50');
      const res = await api.get(`/courses?${params.toString()}`);
      return res.data.data.courses;
    },
  });

  const rawCourses = data || [];

  // Filter client-side by level, mode, and sort
  const filteredCourses = useMemo(() => {
    let list = [...rawCourses];

    if (currentLevel) {
      list = list.filter((c) => c.level === currentLevel);
    }
    if (currentMode) {
      list = list.filter((c) => c.mode === currentMode);
    }

    if (currentSort === 'price_asc') {
      list.sort(
        (a, b) =>
          (a.discountPrice || a.price) - (b.discountPrice || b.price)
      );
    } else if (currentSort === 'price_desc') {
      list.sort(
        (a, b) =>
          (b.discountPrice || b.price) - (a.discountPrice || a.price)
      );
    }

    return list;
  }, [rawCourses, currentLevel, currentMode, currentSort]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: rawCourses.length };
    rawCourses.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [rawCourses]);

  const hasActiveFilters =
    Boolean(currentCategory && currentCategory !== 'All') ||
    Boolean(currentLevel) ||
    Boolean(currentMode) ||
    Boolean(currentSearch) ||
    Boolean(currentSort);

  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-8 md:py-12">
      {/* Top Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink">
          Software engineering courses
        </h1>
        <p className="text-sm md:text-base text-muted mt-1 max-w-2xl">
          Structured curricula with hands-on repositories, real batch mentorship, and placement assistance.
        </p>
      </div>

      {/* Main Grid: Filter Column + Course Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Left Filter Column */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 p-5 rounded-md bg-surface border border-border sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
              Discipline
            </label>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const isSelected =
                  (cat === 'All' && !currentCategory) ||
                  currentCategory === cat;
                const count = categoryCounts[cat] || 0;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-soft text-primary font-semibold'
                        : 'text-ink hover:bg-bg'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-xs text-muted">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level */}
          <div className="pt-4 border-t border-border">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
              Experience level
            </label>
            <div className="space-y-1">
              {LEVELS.map((lvl) => (
                <label
                  key={lvl.label}
                  className="flex items-center gap-2 text-sm text-ink cursor-pointer py-1 px-1 rounded-sm hover:bg-bg"
                >
                  <input
                    type="radio"
                    name="level"
                    value={lvl.value}
                    checked={currentLevel === lvl.value}
                    onChange={(e) => updateParam('level', e.target.value)}
                    className="accent-primary"
                  />
                  <span>{lvl.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div className="pt-4 border-t border-border">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
              Delivery mode
            </label>
            <div className="space-y-1">
              {MODES.map((m) => (
                <label
                  key={m.label}
                  className="flex items-center gap-2 text-sm text-ink cursor-pointer py-1 px-1 rounded-sm hover:bg-bg"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.value}
                    checked={currentMode === m.value}
                    onChange={(e) => updateParam('mode', e.target.value)}
                    className="accent-primary"
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Area: Controls + Course Cards */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Control Bar: Search + Sort + Mobile Filter Button */}
          <div className="p-4 rounded-md bg-surface border border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by technology or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm rounded-sm bg-surface border border-border-strong text-ink placeholder:text-muted focus:border-primary focus:outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Right Controls: Sort & Mobile filter button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-muted whitespace-nowrap">
                {filteredCourses.length}{' '}
                {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </span>

              {/* Sort Dropdown */}
              <select
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                aria-label="Sort courses"
                className="text-xs sm:text-sm py-1.5 px-2.5 rounded-sm bg-surface border border-border-strong text-ink focus:border-primary focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.label} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden p-2 rounded-sm border border-border-strong text-ink hover:bg-bg inline-flex items-center gap-1.5 text-xs font-medium"
              >
                <Filter size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-surface p-5 animate-pulse space-y-4"
                >
                  <div className="h-36 bg-bg rounded-md" />
                  <div className="h-5 bg-bg w-3/4 rounded" />
                  <div className="h-4 bg-bg w-full rounded" />
                  <div className="h-6 bg-bg w-1/2 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCourses.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title="No courses match. Clear filters"
              description="Try broadening your search term or resetting your discipline and mode filters."
              action={
                <Button variant="secondary" onClick={clearAllFilters}>
                  Reset all filters
                </Button>
              }
            />
          )}

          {/* Course Grid: 1 col on mobile, 2 on 768px, 3 on 1120px (per DESIGN.md: "1 column on 375, 2 on 768, 3 on 1120 — never 5") */}
          {!isLoading && filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const iconClass =
                  CATEGORY_ICONS[course.category] || 'devicon-javascript-plain colored';

                return (
                  <Link
                    key={course._id}
                    to={`/courses/${course.slug}`}
                    className="group rounded-md border border-border bg-surface flex flex-col justify-between hover:border-primary hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 overflow-hidden"
                  >
                    <div>
                      {/* Logo-on-tinted-background thumbnail */}
                      <div className="h-40 bg-primary-soft/40 border-b border-border p-6 flex items-center justify-center relative">
                        <i
                          className={`${iconClass} text-5xl transition-transform duration-150 group-hover:scale-110`}
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="category">{course.category}</Badge>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-display font-semibold text-ink group-hover:text-primary transition-colors line-clamp-1">
                          {course.title}
                        </h3>

                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {course.shortDescription || course.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted pt-2 border-t border-border">
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <BarChart size={13} />
                            {course.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Price & Action */}
                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-border flex items-baseline justify-between">
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

                        <span className="text-xs font-semibold text-primary group-hover:underline">
                          View details
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom-Sheet Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div className="fixed inset-x-0 bottom-0 bg-surface rounded-t-md p-6 max-h-[80vh] overflow-y-auto space-y-6 shadow-md border-t border-border animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-semibold text-ink">Filter courses</h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-muted hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
                Discipline
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected =
                    (cat === 'All' && !currentCategory) ||
                    currentCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => updateParam('category', cat === 'All' ? '' : cat)}
                      className={`py-2 px-3 rounded-sm text-xs font-medium text-center border ${
                        isSelected
                          ? 'border-primary bg-primary-soft text-primary font-semibold'
                          : 'border-border text-ink bg-bg'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
                Experience level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.label}
                    type="button"
                    onClick={() => updateParam('level', lvl.value)}
                    className={`py-2 px-3 rounded-sm text-xs font-medium text-center border ${
                      currentLevel === lvl.value
                        ? 'border-primary bg-primary-soft text-primary font-semibold'
                        : 'border-border text-ink bg-bg'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">
                Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => updateParam('mode', m.value)}
                    className={`py-2 px-3 rounded-sm text-xs font-medium text-center border ${
                      currentMode === m.value
                        ? 'border-primary bg-primary-soft text-primary font-semibold'
                        : 'border-border text-ink bg-bg'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
