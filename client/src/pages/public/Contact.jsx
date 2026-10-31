import EnquiryForm from '../../components/common/EnquiryForm';
import { Mail, Phone, MapPin, Clock, Compass } from 'lucide-react';

const Contact = () => {
  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-10 md:py-16">
      {/* Top Header */}
      <div className="mb-10 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted block mb-1">
          Get in touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
          Contact our admissions team
        </h1>
        <p className="text-base text-muted mt-2 leading-relaxed">
          Whether you want to enquire about batch timings, understand prerequisites, or visit our centre, we are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Col: EnquiryForm */}
        <div className="lg:col-span-7">
          <EnquiryForm
            title="Send us a message"
            subtitle="Fill out the form below. We respond within one working day."
          />
        </div>

        {/* Right Col: Contact Details, Working Hours, Map Placeholder */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contact Details Card */}
          <div className="p-6 rounded-md bg-surface border border-border shadow-sm space-y-5">
            <h3 className="text-base font-display font-semibold text-ink">
              Training Centre & Office
            </h3>

            <div className="space-y-4 text-sm text-ink">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-ink">Job Mansion Institute</strong>
                  <span className="text-muted leading-relaxed">
                    Tech Corridor, Outer Ring Road, Bengaluru, Karnataka 560103, India
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-ink">Email</strong>
                  <a
                    href="mailto:admissions@jobmansion.com"
                    className="text-primary hover:underline"
                  >
                    admissions@jobmansion.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-ink">Phone & WhatsApp</strong>
                  <a
                    href="tel:+919876543210"
                    className="text-primary hover:underline"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-border">
                <Clock size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <strong className="block text-ink">Working hours</strong>
                  <span className="text-muted block">
                    Monday to Saturday: 9:30 AM – 6:30 PM IST
                  </span>
                  <span className="text-xs text-muted block mt-0.5">
                    Closed on Sundays and national public holidays
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="p-6 rounded-md bg-surface border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-ink flex items-center gap-1.5">
                <Compass size={16} className="text-primary" /> Location map
              </h4>
              <span className="text-xs text-muted">Bengaluru Campus</span>
            </div>

            <div className="w-full h-48 rounded-sm bg-bg border border-border flex flex-col items-center justify-center p-4 text-center">
              <MapPin size={28} className="text-muted mb-2" />
              <p className="text-xs font-semibold text-ink">
                Outer Ring Road Tech Zone
              </p>
              <p className="text-[11px] text-muted mt-1 max-w-xs">
                Near Marathahalli flyover, accessible by Metro feeder bus and BMTC lines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
