'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from './LocaleProvider';
import { subscribeNewsletter } from '@/lib/api';

/**
 * SCULPT'AURA — newsletter enrolment.
 *
 * The charter forbids boxed inputs, so the email field is a single animated
 * bottom hairline with an inline submit label. Submission here is a local
 * optimistic acknowledgement; the wired version posts to the rate-limited
 * backend route (Resend) in a later increment.
 */
export default function Newsletter() {
  const { locale, t } = useLocale();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    // Fire the rate-limited backend subscription (Resend double opt-in). The UI
    // stays optimistic: even if the API is unreachable we acknowledge, since a
    // newsletter sign-up is low-stakes and the request can be retried.
    try {
      await subscribeNewsletter(email.trim(), locale);
    } catch {
      // Swallow — optimistic acknowledgement below.
    }
    setSubmitted(true);
  };

  return (
    <section id="newsletter" className="bg-neutral-900 py-28 text-white sm:py-36">
      <div className="container-editorial flex flex-col items-center text-center">
        <p className="label-editorial-muted mb-6 text-white/50">
          {t.newsletter.eyebrow}
        </p>
        <h2 className="max-w-2xl font-serif text-4xl italic leading-tight sm:text-5xl">
          {t.newsletter.title}
        </h2>
        <p className="mt-6 max-w-md font-sans text-sm font-light leading-relaxed text-white/70">
          {t.newsletter.body}
        </p>

        {submitted ? (
          <p className="mt-12 font-serif text-2xl italic text-white/90">
            {/* Discreet confirmation, still on-charter. */}
            &mdash; {t.newsletter.cta} &mdash;
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-12 flex w-full max-w-md flex-col items-center"
          >
            <div className="flex w-full items-end gap-4 border-b border-white/25 pb-2 transition-colors duration-500 focus-within:border-white">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.placeholder}
                aria-label={t.newsletter.placeholder}
                className="w-full bg-transparent font-sans text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 font-sans text-[0.65rem] uppercase tracking-editorial text-white transition-opacity hover:opacity-60"
              >
                {t.newsletter.cta}
              </button>
            </div>
            <p className="mt-5 font-sans text-[0.65rem] leading-relaxed text-white/40">
              {t.newsletter.consent}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
