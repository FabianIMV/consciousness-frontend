'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { getDictionary } from '@/lib/dictionaries';
import { CONTACT_EMAIL, type Locale } from '@/lib/site';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).contact.form;
  const fieldId = useId();

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const noticeRef = useRef<HTMLParagraphElement>(null);

  const topics = [
    t.topics.collaboration,
    t.topics.quantum,
    t.topics.ai,
    t.topics.paper,
    t.topics.general,
  ];

  // Submitting blurs the button, so focus has to be placed deliberately or a
  // keyboard user is dropped at the top of the document with no feedback.
  useEffect(() => {
    if (status === 'success' || status === 'error') noticeRef.current?.focus();
  }, [status]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    // A result banner describes the previous submission, not what is being
    // typed now.
    setStatus((previous) => (previous === 'success' || previous === 'error' ? 'idle' : previous));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;

    // Snapshot what is actually being sent: clearing `values` wholesale would
    // discard anything typed while the request was in flight.
    const submitted = values;
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submitted, locale }),
      });

      if (!response.ok) throw new Error(`Request failed with ${response.status}`);

      setValues((current) =>
        Object.fromEntries(
          Object.entries(current).map(([key, value]) => [
            key,
            value === submitted[key as keyof typeof submitted] ? '' : value,
          ])
        ) as typeof EMPTY
      );
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const sending = status === 'sending';

  return (
    <div>
      {/* Always mounted so assistive tech is watching before a message lands. */}
      <div aria-live="polite" aria-atomic="true">
        {status === 'success' && (
          <p
            ref={noticeRef}
            tabIndex={-1}
            className="notice notice--success"
            style={{ marginBottom: 'var(--spacing-6)' }}
          >
            {t.success}
          </p>
        )}

        {status === 'error' && (
          <p
            ref={noticeRef}
            tabIndex={-1}
            className="notice notice--error"
            style={{ marginBottom: 'var(--spacing-6)' }}
          >
            {t.error} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        )}
      </div>

      <form className="form" onSubmit={handleSubmit} aria-busy={sending}>
        <div className="field">
          <label className="field__label" htmlFor={`${fieldId}-name`}>
            {t.name}
          </label>
          <input
            className="field__control"
            id={`${fieldId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            placeholder={t.namePlaceholder}
            value={values.name}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${fieldId}-email`}>
            {t.email}
          </label>
          <input
            className="field__control"
            id={`${fieldId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            placeholder={t.emailPlaceholder}
            value={values.email}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${fieldId}-subject`}>
            {t.topic}
          </label>
          <select
            className="field__control"
            id={`${fieldId}-subject`}
            name="subject"
            required
            value={values.subject}
            onChange={handleChange}
          >
            <option value="">{t.topicPlaceholder}</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${fieldId}-message`}>
            {t.message}
          </label>
          <textarea
            className="field__control"
            id={`${fieldId}-message`}
            name="message"
            required
            rows={8}
            maxLength={5000}
            placeholder={t.messagePlaceholder}
            value={values.message}
            onChange={handleChange}
          />
        </div>

        <div>
          {/* aria-disabled rather than disabled: a disabled button loses focus
              and drops out of the tab order mid-interaction. */}
          <button type="submit" className="btn btn--primary" aria-disabled={sending}>
            {sending ? `${t.sending}…` : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
