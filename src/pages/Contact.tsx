import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import HeaderNavigation from '@/components/HeaderNavigation';
import InternalPageHeader from '@/components/InternalPageHeader';
import Footer from '@/components/Footer';
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from '@/components/ui/themed-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create mailto link as fallback (works without backend)
      const mailtoSubject = encodeURIComponent(result.data.subject);
      const mailtoBody = encodeURIComponent(
        `Name: ${result.data.name}\nEmail: ${result.data.email}\n\nMessage:\n${result.data.message}`
      );
      
      // Open mailto link
      window.location.href = `mailto:contact@spithierarchy.com?subject=${mailtoSubject}&body=${mailtoBody}`;
      
      setIsSubmitted(true);
      toast.success('Opening your email client...', {
        description: 'Please send the email to complete your message.',
      });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitted(false);
    setErrors({});
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Spit Hierarchy - Hip-Hop Rankings</title>
        <meta 
          name="description" 
          content="Get in touch with Spit Hierarchy. Contact us for questions, feedback, or partnership inquiries about our hip-hop ranking platform." 
        />
        <link rel="canonical" href="https://spithierarchy.com/contact" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen bg-rap-dark">
        <HeaderNavigation isScrolled={false} />
        
        <div className="pt-24">
          <InternalPageHeader
            title="Contact Us"
            subtitle="Get in touch with the Spit Hierarchy team"
          />

          <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <ThemedCard>
                <ThemedCardHeader>
                  <ThemedCardTitle>Get In Touch</ThemedCardTitle>
                </ThemedCardHeader>
                <ThemedCardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[hsl(var(--theme-primary))]/10 rounded-lg">
                      <Mail className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Email</h3>
                      <a 
                        href="mailto:contact@spithierarchy.com"
                        className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors"
                      >
                        contact@spithierarchy.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[hsl(var(--theme-primary))]/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Company</h3>
                      <p className="text-muted-foreground">Fresh Dope Biz LLC</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-[hsl(var(--theme-primary))]/10 rounded-lg">
                      <Clock className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Response Time</h3>
                      <p className="text-muted-foreground">We typically respond within 24-48 hours</p>
                    </div>
                  </div>
                </ThemedCardContent>
              </ThemedCard>

              <ThemedCard>
                <ThemedCardHeader>
                  <ThemedCardTitle>Common Topics</ThemedCardTitle>
                </ThemedCardHeader>
                <ThemedCardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Rapper suggestions and additions</li>
                    <li>• Partnership and collaboration inquiries</li>
                    <li>• Technical support and bug reports</li>
                    <li>• Press and media inquiries</li>
                    <li>• Advertising opportunities</li>
                    <li>• General feedback</li>
                  </ul>
                </ThemedCardContent>
              </ThemedCard>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ThemedCard>
                <ThemedCardHeader>
                  <ThemedCardTitle>Send Us a Message</ThemedCardTitle>
                </ThemedCardHeader>
                <ThemedCardContent>
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Check Your Email Client</h3>
                      <p className="text-muted-foreground mb-6">
                        Your default email app should have opened with your message pre-filled. 
                        Send the email to complete your inquiry.
                      </p>
                      <Button onClick={resetForm} variant="outline">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What is this about?"
                          className={errors.subject ? 'border-red-500' : ''}
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-500">{errors.subject}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message *</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us what's on your mind..."
                          rows={6}
                          className={errors.message ? 'border-red-500' : ''}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-500">{errors.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground text-right">
                          {formData.message.length}/2000 characters
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          'Opening Email...'
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our{' '}
                        <a href="/privacy" className="text-[hsl(var(--theme-primary))] hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </form>
                  )}
                </ThemedCardContent>
              </ThemedCard>
            </div>
          </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Contact;
