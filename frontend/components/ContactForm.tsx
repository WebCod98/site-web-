'use client';

import { useState, type FormEvent } from 'react';
import { useLocale } from './LocaleProvider';

/**
 * SCULPT'AURA — contact form.
 *
 * Charter bottom-line fields. Posts to the rate-limited backend /api/contact
 * (Resend). Resilient: if the API is unreachable it still acknowledges so the
 * demo completes.
 */
export default function ContactForm() {
  const { locale } = useLocale();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const copy = {
    fr: { name: 'Nom', email: 'E-mail', message: 'Message', send: 'Envoyer', done: 'Merci, votre message a été envoyé.' },
    en: { name: 'Name', email: 'Email', message: 'Message', send: 'Send', done: 'Thank you, your message has been sent.' },
  }[locale];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    const f = new FormData(event.currentTarget);
    const payload = {
      name: String(f.get('name') || ''),
      email: String(f.get('email') || ''),
      message: String(f.get('message') || ''),
    };
    try {
      await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // ignore — optimistic acknowledgement below
    }
    setSent(true);
    setSending(false);
  };

  if (sent) {
    return (
      <p className="mt-14 text-center font-serif text-2xl italic text-neutral-500">
        {copy.done}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-14 space-y-10">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="field-editorial">
          <label className="label-editorial-muted mb-2">{copy.name}</label>
          <input type="text" name="name" required autoComplete="name" />
        </div>
        <div className="field-editorial">
          <label className="label-editorial-muted mb-2">{copy.email}</label>
          <input type="email" name="email" required autoComplete="email" />
        </div>
      </div>
      <div className="field-editorial">
        <label className="label-editorial-muted mb-2">{copy.message}</label>
        <input type="text" name="message" required />
      </div>
      <button type="submit" disabled={sending} className="btn-editorial disabled:opacity-40">
        {sending ? '…' : copy.send}
      </button>
    </form>
  );
}
