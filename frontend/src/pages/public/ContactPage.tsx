/**
 * ContactPage - Contact form and information
 */
import { useState } from 'react';
import { Hero } from '../../components/public/Hero';

// Contact form fields
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  interest: string;
}

export function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    interest: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Integrate with email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div>
      {/* Hero */}
      <Hero
        headline="Get in Touch"
        subheadline="We'd love to hear from you. Reach out with questions, partnership inquiries, or to learn more about our programs."
        size="small"
      />

      <section className="py-20 md:py-28 bg-gradient-to-b from-shs-sand to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-shs-forest-800 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-shs-forest-100 flex items-center justify-center text-shs-forest-600 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-shs-forest-800">Location</h3>
                    <p className="text-shs-text-body mt-1">Chase, BC<br />Secwepemcúl̓ecw Territory</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-shs-forest-100 flex items-center justify-center text-shs-forest-600 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-shs-forest-800">Email</h3>
                    <a href="mailto:info@secwepemchuntingsociety.ca" className="text-shs-forest-600 hover:text-shs-forest-800 transition-colors mt-1 block">
                      info@secwepemchuntingsociety.ca
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-shs-forest-100 flex items-center justify-center text-shs-forest-600 flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-shs-forest-800">Social</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <a href="#" className="w-10 h-10 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600 hover:bg-shs-forest-200 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z"/>
                        </svg>
                      </a>
                      <a href="#" className="w-10 h-10 rounded-full bg-shs-forest-100 flex items-center justify-center text-shs-forest-600 hover:bg-shs-forest-200 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12,2.16c3.2,0,3.58.01,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.17,8.8,2.16,12,2.16Z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="mt-10 p-6 bg-shs-amber-50 rounded-2xl border border-shs-amber-100">
                <h3 className="font-semibold text-shs-amber-800 mb-2">Looking for camp info?</h3>
                <p className="text-shs-amber-700 text-sm mb-3">Check our Cultural Camps page for program details and FAQs.</p>
                <a href="/cultural-camps" className="text-shs-amber-600 font-semibold text-sm hover:text-shs-amber-800 transition-colors">
                  View Cultural Camps →
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 border border-shs-stone">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-shs-forest-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-shs-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-shs-forest-800 mb-4">Message Sent!</h3>
                    <p className="text-shs-text-body mb-6">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '', phone: '', subject: '', message: '', interest: '' });
                      }}
                      className="text-shs-forest-600 font-semibold hover:text-shs-forest-800 transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-shs-forest-800 mb-2">Send Us a Message</h2>
                    <p className="text-shs-text-muted mb-8">Fill out the form below and we'll respond within 2-3 business days.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-shs-forest-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500 transition-colors bg-shs-cream/50"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-shs-forest-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500 transition-colors bg-shs-cream/50"
                            placeholder="you@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-shs-forest-700 mb-2">
                            Phone (optional)
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500 transition-colors bg-shs-cream/50"
                            placeholder="(250) 555-0123"
                          />
                        </div>
                        <div>
                          <label htmlFor="interest" className="block text-sm font-medium text-shs-forest-700 mb-2">
                            Area of Interest
                          </label>
                          <select
                            id="interest"
                            name="interest"
                            value={formData.interest}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500 transition-colors bg-shs-cream/50"
                          >
                            <option value="">Select an option</option>
                            <option value="camps">Cultural Camps</option>
                            <option value="volunteer">Volunteering</option>
                            <option value="partnership">Partnership Inquiry</option>
                            <option value="donation">Donation</option>
                            <option value="media">Media/Press</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-shs-forest-700 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500 transition-colors bg-shs-cream/50"
                          placeholder="What is this regarding?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-shs-forest-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-shs-stone rounded-xl focus:ring-2 focus:ring-shs-forest-500 focus:border-shs-forest-500 transition-colors bg-shs-cream/50 resize-none"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-shs-text-muted">
                          * Required fields
                        </p>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-8 py-3 bg-shs-forest-600 text-white font-semibold rounded-xl hover:bg-shs-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Sending...
                            </>
                          ) : (
                            'Send Message'
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
