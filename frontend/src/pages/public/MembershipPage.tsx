/**
 * MembershipPage - Community Membership Registration
 * Multi-step form for joining the Secwépemc Hunting Society
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';

interface MembershipForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  community: string;
  city: string;
  interests: string[];
  newsletter: boolean;
  message: string;
}

const initialForm: MembershipForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  community: '',
  city: '',
  interests: [],
  newsletter: true,
  message: '',
};

const interestOptions = [
  { id: 'food-sovereignty', label: 'Food Sovereignty & Hunting' },
  { id: 'cultural-camps', label: 'Cultural Camps' },
  { id: 'youth-mentorship', label: 'Youth Mentorship' },
  { id: 'land-stewardship', label: 'Land Stewardship' },
  { id: 'language', label: 'Language & Culture' },
  { id: 'healing-wellness', label: 'Healing & Wellness' },
  { id: 'volunteering', label: 'Volunteering' },
];

const membershipBenefits = [
  { icon: '⛺', title: 'Camp Priority', description: 'First access to cultural camp registration' },
  { icon: '📨', title: 'Newsletter', description: 'Monthly updates on programs and events' },
  { icon: '🤝', title: 'Community', description: 'Connect with other members and Elders' },
  { icon: '🎁', title: 'Discounts', description: 'Member pricing on workshops and programs' },
];

export function MembershipPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MembershipForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof MembershipForm, string>>>({});

  const updateField = <K extends keyof MembershipForm>(field: K, value: MembershipForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleInterest = (id: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const validateStep1 = () => {
    const newErrors: typeof errors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Required';
    if (!form.lastName.trim()) newErrors.lastName = 'Required';
    if (!form.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend
    console.log('Membership form submitted:', form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-shs-cream">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-shs-forest-800 mb-4">Welcome to the Community!</h1>
          <p className="text-shs-text-body mb-8">
            Thank you for your interest in joining the Secwépemc Hunting Society, {form.firstName}! 
            We've received your membership application and will be in touch soon.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shs-cream">
      {/* Hero */}
      <Hero
        headline="Join Our Community"
        subheadline="Become a member of the Secwépemc Hunting Society and connect with cultural programs, events, and our community."
        size="medium"
      />

      {/* Benefits */}
      <section className="py-12 bg-white border-b border-shs-stone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-bold text-shs-forest-800 mb-8">Member Benefits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {membershipBenefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-4 rounded-xl bg-shs-sand/50">
                <div className="text-3xl mb-2">{benefit.icon}</div>
                <h3 className="font-semibold text-shs-forest-800 text-sm">{benefit.title}</h3>
                <p className="text-xs text-shs-text-muted mt-1">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step >= s
                      ? 'bg-shs-forest-600 text-white'
                      : 'bg-shs-stone text-shs-text-muted'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 md:w-24 h-1 mx-2 rounded transition-colors ${
                      step > s ? 'bg-shs-forest-600' : 'bg-shs-stone'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-shs-stone p-8 shadow-sm">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-shs-forest-800 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500 ${
                        errors.firstName ? 'border-red-500' : 'border-shs-stone'
                      }`}
                      placeholder="Your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500 ${
                        errors.lastName ? 'border-red-500' : 'border-shs-stone'
                      }`}
                      placeholder="Your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500 ${
                      errors.email ? 'border-red-500' : 'border-shs-stone'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500"
                    placeholder="(250) 555-0000"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-shs-forest-800 mb-6">Location</h2>
                <div>
                  <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                    Community (if applicable)
                  </label>
                  <input
                    type="text"
                    value={form.community}
                    onChange={(e) => updateField('community', e.target.value)}
                    className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500"
                    placeholder="e.g., Tk'emlúps te Secwépemc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                    City/Town
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500"
                    placeholder="e.g., Kamloops, Chase, Salmon Arm"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-shs-forest-800 mb-2">Areas of Interest</h2>
                <p className="text-sm text-shs-text-muted mb-6">
                  Select the programs and activities you're most interested in.
                </p>
                <div className="space-y-3">
                  {interestOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                        form.interests.includes(opt.id)
                          ? 'bg-shs-forest-50 border-shs-forest-500'
                          : 'border-shs-stone hover:bg-shs-sand/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.interests.includes(opt.id)}
                        onChange={() => toggleInterest(opt.id)}
                        className="w-5 h-5 text-shs-forest-600 rounded border-shs-stone focus:ring-shs-forest-500"
                      />
                      <span className="text-shs-forest-800 font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-3 mt-6">
                  <input
                    type="checkbox"
                    checked={form.newsletter}
                    onChange={(e) => updateField('newsletter', e.target.checked)}
                    className="w-5 h-5 text-shs-forest-600 rounded border-shs-stone focus:ring-shs-forest-500"
                  />
                  <span className="text-sm text-shs-text-body">
                    Subscribe to our newsletter for updates
                  </span>
                </label>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-shs-forest-800 mb-6">Review & Submit</h2>
                <div className="bg-shs-sand/50 rounded-xl p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-shs-text-muted">Name</span>
                      <p className="font-medium text-shs-forest-800">{form.firstName} {form.lastName}</p>
                    </div>
                    <div>
                      <span className="text-shs-text-muted">Email</span>
                      <p className="font-medium text-shs-forest-800">{form.email}</p>
                    </div>
                    {form.phone && (
                      <div>
                        <span className="text-shs-text-muted">Phone</span>
                        <p className="font-medium text-shs-forest-800">{form.phone}</p>
                      </div>
                    )}
                    {form.city && (
                      <div>
                        <span className="text-shs-text-muted">Location</span>
                        <p className="font-medium text-shs-forest-800">
                          {form.community ? `${form.community}, ` : ''}{form.city}
                        </p>
                      </div>
                    )}
                  </div>
                  {form.interests.length > 0 && (
                    <div>
                      <span className="text-sm text-shs-text-muted">Interests</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.interests.map((id) => (
                          <span
                            key={id}
                            className="px-3 py-1 bg-shs-forest-100 text-shs-forest-700 text-xs rounded-full"
                          >
                            {interestOptions.find((o) => o.id === id)?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-shs-forest-700 mb-2">
                    Anything else you'd like to share? (optional)
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:outline-none focus:ring-2 focus:ring-shs-forest-500 resize-none"
                    placeholder="Tell us about yourself or any questions you have..."
                  />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-shs-stone">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 text-shs-forest-700 font-medium hover:bg-shs-sand rounded-xl transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-shs-amber-500 text-white font-semibold rounded-xl hover:bg-shs-amber-600 transition-colors shadow-lg"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-xs text-shs-text-muted mt-6">
            Already a member? <Link to="/contact" className="text-shs-forest-600 hover:underline">Contact us</Link> for help.
          </p>
        </div>
      </section>
    </div>
  );
}
