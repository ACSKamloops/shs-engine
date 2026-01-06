/**
 * MembershipPage - Community Membership (Modernized Jan 2026)
 * Features: Animated step wizard, Framer Motion, hero image, glassmorphism form
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

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
  firstName: '', lastName: '', email: '', phone: '',
  community: '', city: '', interests: [], newsletter: true, message: '',
};

const interestOptions = [
  { id: 'food-sovereignty', label: 'Food Sovereignty & Hunting', icon: '🦌' },
  { id: 'cultural-camps', label: 'Cultural Camps', icon: '🏕️' },
  { id: 'youth-mentorship', label: 'Youth Mentorship', icon: '👨‍👧' },
  { id: 'land-stewardship', label: 'Land Stewardship', icon: '🌲' },
  { id: 'language', label: 'Language & Culture', icon: '🗣️' },
  { id: 'healing-wellness', label: 'Healing & Wellness', icon: '💚' },
  { id: 'volunteering', label: 'Volunteering', icon: '🤝' },
];

const membershipBenefits = [
  { icon: '⛺', title: 'Camp Priority', description: 'First access to cultural camp registration' },
  { icon: '📨', title: 'Newsletter', description: 'Monthly updates on programs and events' },
  { icon: '🤝', title: 'Community', description: 'Connect with other members and Elders' },
  { icon: '🎁', title: 'Discounts', description: 'Member pricing on workshops and programs' },
];

const stepLabels = ['Personal', 'Location', 'Interests', 'Review'];

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
    console.log('Membership form submitted:', form);
    setSubmitted(true);
  };

  // Success State
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl"
            >
              🎉
            </motion.span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to the Community!</h1>
          <p className="text-xl text-emerald-200 mb-10">
            Thank you for joining us, {form.firstName}! We've received your membership application and will be in touch soon.
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-700 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
            >
              <span>Return Home</span>
              <span>→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/heroes/membership_hero.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-emerald-900/80" />
        
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-6xl mb-6"
            >
              🤗
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
              Join Our Community
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Become a member and connect with cultural programs, events, and our community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 bg-gradient-to-b from-emerald-900 to-shs-sand">
        <div className="max-w-5xl mx-auto px-4">
          <SectionReveal>
            <h2 className="text-center text-2xl font-bold text-white mb-8">Member Benefits</h2>
          </SectionReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {membershipBenefits.map((benefit, index) => (
              <AnimatedCard key={benefit.title} delay={index * 0.1} className="p-5 text-center" glass>
                <motion.span 
                  className="text-4xl block mb-3"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {benefit.icon}
                </motion.span>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-gray-500">{benefit.description}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-2xl mx-auto px-4">
          {/* Animated Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            {[1, 2, 3, 4].map((s, i) => (
              <div key={s} className="flex items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      scale: step === s ? [1, 1.1, 1] : 1,
                      boxShadow: step === s ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                    transition={{ duration: 0.5, repeat: step === s ? Infinity : 0, repeatDelay: 1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      step > s
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg'
                        : step === s
                        ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </motion.div>
                  <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap ${
                    step >= s ? 'text-emerald-700 font-medium' : 'text-gray-400'
                  }`}>
                    {stepLabels[i]}
                  </span>
                </motion.div>
                {s < 4 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step > s ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-12 md:w-20 h-1 mx-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded origin-left"
                    style={{ backgroundColor: step > s ? undefined : '#e5e7eb' }}
                  />
                )}
              </div>
            ))}
          </div>

          <SectionReveal delay={0.2}>
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-white/50 p-8 md:p-10 shadow-2xl mt-8"
            >
              <AnimatePresence mode="wait">
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <FloatingIcon icon="👤" size="lg" />
                      <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'firstName', label: 'First Name' },
                        { name: 'lastName', label: 'Last Name' },
                      ].map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{field.label} *</label>
                          <input
                            type="text"
                            value={form[field.name as keyof MembershipForm] as string}
                            onChange={(e) => updateField(field.name as keyof MembershipForm, e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50 ${
                              errors[field.name as keyof MembershipForm] ? 'border-red-400' : 'border-gray-200'
                            }`}
                          />
                          {errors[field.name as keyof MembershipForm] && (
                            <p className="text-red-500 text-xs mt-1">{errors[field.name as keyof MembershipForm]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50 ${
                          errors.email ? 'border-red-400' : 'border-gray-200'
                        }`}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
                        placeholder="(250) 555-0000"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <FloatingIcon icon="📍" size="lg" />
                      <h2 className="text-2xl font-bold text-gray-800">Your Location</h2>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Community (if applicable)</label>
                      <input
                        type="text"
                        value={form.community}
                        onChange={(e) => updateField('community', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
                        placeholder="e.g., Tk'emlúps te Secwépemc"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City/Town</label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50"
                        placeholder="e.g., Kamloops, Chase, Salmon Arm"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Interests */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FloatingIcon icon="✨" size="lg" />
                      <h2 className="text-2xl font-bold text-gray-800">Areas of Interest</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Select the programs you're most interested in.</p>
                    <div className="grid grid-cols-1 gap-3">
                      {interestOptions.map((opt, i) => (
                        <motion.label
                          key={opt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                            form.interests.includes(opt.id)
                              ? 'bg-emerald-50 border-emerald-400 shadow-md'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <span className="text-gray-800 font-medium flex-1">{opt.label}</span>
                          <input
                            type="checkbox"
                            checked={form.interests.includes(opt.id)}
                            onChange={() => toggleInterest(opt.id)}
                            className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                          />
                        </motion.label>
                      ))}
                    </div>
                    <label className="flex items-center gap-3 mt-6 p-4 bg-emerald-50 rounded-xl">
                      <input
                        type="checkbox"
                        checked={form.newsletter}
                        onChange={(e) => updateField('newsletter', e.target.checked)}
                        className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">📨 Subscribe to our newsletter for updates</span>
                    </label>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <FloatingIcon icon="📋" size="lg" />
                      <h2 className="text-2xl font-bold text-gray-800">Review & Submit</h2>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400 text-xs">Name</span>
                          <p className="font-semibold text-gray-800">{form.firstName} {form.lastName}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs">Email</span>
                          <p className="font-semibold text-gray-800">{form.email}</p>
                        </div>
                        {form.phone && (
                          <div>
                            <span className="text-gray-400 text-xs">Phone</span>
                            <p className="font-semibold text-gray-800">{form.phone}</p>
                          </div>
                        )}
                        {form.city && (
                          <div>
                            <span className="text-gray-400 text-xs">Location</span>
                            <p className="font-semibold text-gray-800">
                              {form.community ? `${form.community}, ` : ''}{form.city}
                            </p>
                          </div>
                        )}
                      </div>
                      {form.interests.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-xs">Interests</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {form.interests.map((id) => {
                              const opt = interestOptions.find((o) => o.id === id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                                >
                                  <span>{opt?.icon}</span> {opt?.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anything else? (optional)</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => updateField('message', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all bg-gray-50/50 resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <motion.button
                    type="button"
                    whileHover={{ x: -4 }}
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <span>←</span> Back
                  </motion.button>
                ) : (
                  <div />
                )}
                {step < 4 ? (
                  <GlowButton onClick={handleNext} className="flex items-center gap-2">
                    Next <span>→</span>
                  </GlowButton>
                ) : (
                  <GlowButton className="flex items-center gap-2">
                    Submit Application ✨
                  </GlowButton>
                )}
              </div>
            </motion.form>
          </SectionReveal>

          <p className="text-center text-xs text-gray-400 mt-6">
            Already a member? <Link to="/contact" className="text-emerald-600 hover:underline">Contact us</Link> for help.
          </p>
        </div>
      </section>
    </div>
  );
}

export default MembershipPage;
