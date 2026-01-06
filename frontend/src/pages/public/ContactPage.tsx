/**
 * ContactPage - Contact Form (Modernized Jan 2026)
 * Features: Framer Motion animations, hero image, glassmorphism form, animated success state
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedCard, SectionReveal, FloatingIcon, GlowButton } from '../../components/ui/AnimatedComponents';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  interest: string;
}

const contactMethods = [
  { icon: '📍', title: 'Location', value: 'Chase, BC', subtitle: 'Secwepemcúl̓ecw Territory' },
  { icon: '📧', title: 'Email', value: 'info@secwepemchuntingsociety.ca', link: 'mailto:info@secwepemchuntingsociety.ca' },
  { icon: '📱', title: 'Social', value: 'Follow us', links: [
    { platform: 'Facebook', url: '#' },
    { platform: 'Instagram', url: '#' },
  ]},
];

export function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '', email: '', phone: '', subject: '', message: '', interest: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/heroes/contact_hero.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-shs-forest-900/80" />
        
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
              💬
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
              Get in Touch
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              We'd love to hear from you. Reach out with questions, partnership inquiries, or to learn more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-gradient-to-b from-shs-forest-900 via-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <SectionReveal>
                <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>
              </SectionReveal>
              
              {contactMethods.map((method, index) => (
                <AnimatedCard key={method.title} delay={index * 0.1} className="p-5" glass>
                  <div className="flex items-start gap-4">
                    <motion.span 
                      className="text-3xl"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {method.icon}
                    </motion.span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{method.title}</h3>
                      {method.link ? (
                        <a href={method.link} className="text-emerald-600 hover:text-emerald-700 transition-colors text-sm">
                          {method.value}
                        </a>
                      ) : method.links ? (
                        <div className="flex gap-3 mt-2">
                          {method.links.map(l => (
                            <motion.a
                              key={l.platform}
                              href={l.url}
                              whileHover={{ scale: 1.1 }}
                              className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition-colors"
                            >
                              {l.platform === 'Facebook' ? 'f' : 'ig'}
                            </motion.a>
                          ))}
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600 text-sm">{method.value}</p>
                          {method.subtitle && <p className="text-gray-400 text-xs">{method.subtitle}</p>}
                        </>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              ))}

              {/* FAQ Link */}
              <AnimatedCard delay={0.4} className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <FloatingIcon icon="💡" size="md" />
                  <div>
                    <h3 className="font-bold text-amber-800 mb-1">Looking for camp info?</h3>
                    <p className="text-amber-700 text-sm mb-3">Check our Cultural Camps page for program details.</p>
                    <motion.div whileHover={{ x: 4 }}>
                      <Link to="/cultural-camps" className="text-amber-600 font-semibold text-sm hover:text-amber-800 flex items-center gap-1">
                        View Cultural Camps <span>→</span>
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <SectionReveal delay={0.2}>
                <motion.div 
                  className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 border border-white/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-16"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                        >
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-4xl"
                          >
                            ✓
                          </motion.span>
                        </motion.div>
                        <h3 className="text-3xl font-extrabold text-gray-800 mb-4">Message Sent!</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                          Thank you for reaching out. We'll get back to you within 2-3 business days.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setIsSubmitted(false);
                            setFormData({ name: '', email: '', phone: '', subject: '', message: '', interest: '' });
                          }}
                          className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2 mx-auto"
                        >
                          <span>←</span> Send another message
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div key="form">
                        <div className="flex items-center gap-3 mb-8">
                          <FloatingIcon icon="✉️" size="lg" />
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Send Us a Message</h2>
                            <p className="text-gray-500 text-sm">We'll respond within 2-3 business days.</p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                              { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true },
                              { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com', required: true },
                            ].map((field, i) => (
                              <motion.div
                                key={field.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                              >
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {field.label} {field.required && '*'}
                                </label>
                                <input
                                  type={field.type}
                                  name={field.name}
                                  required={field.required}
                                  value={formData[field.name as keyof ContactFormData]}
                                  onChange={handleChange}
                                  placeholder={field.placeholder}
                                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50/50"
                                />
                              </motion.div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(250) 555-0123"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50/50"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Area of Interest</label>
                              <select
                                name="interest"
                                value={formData.interest}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50/50"
                              >
                                <option value="">Select an option</option>
                                <option value="camps">🏕️ Cultural Camps</option>
                                <option value="volunteer">🤝 Volunteering</option>
                                <option value="partnership">🤝 Partnership</option>
                                <option value="donation">💚 Donation</option>
                                <option value="media">📰 Media/Press</option>
                                <option value="other">💬 Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                            <input
                              type="text"
                              name="subject"
                              required
                              value={formData.subject}
                              onChange={handleChange}
                              placeholder="What is this regarding?"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                            <textarea
                              name="message"
                              required
                              rows={5}
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Tell us more about your inquiry..."
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50/50 resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <p className="text-xs text-gray-400">* Required fields</p>
                            <GlowButton className="flex items-center gap-2">
                              {isSubmitting ? (
                                <>
                                  <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  >
                                    ⏳
                                  </motion.span>
                                  Sending...
                                </>
                              ) : (
                                <>Send Message ✨</>
                              )}
                            </GlowButton>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
