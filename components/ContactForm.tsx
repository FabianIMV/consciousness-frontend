'use client';

import { useId, useState, type FormEvent } from 'react';
import { getDictionary } from '@/lib/dictionaries';
import { CONTACT_EMAIL, type Locale } from '@/lib/site';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).contact.form;
  const fieldId = useId();

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>('idle');

  const topics = [
    t.topics.collaboration,
    t.topics.quantum,
    t.topics.ai,
    t.topics.paper,
    t.topics.general,
  ];

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      });

      if (!response.ok) throw new Error(`Request failed with ${response.status}`);

      setValues(EMPTY);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div>
      {status === 'success' && (
        <p className="notice notice--success" role="status" style={{ marginBottom: 'var(--spacing-6)' }}>
          {t.success}
        </p>
      )}

      {status === 'error' && (
        <p className="notice notice--error" role="alert" style={{ marginBottom: 'var(--spacing-6)' }}>
          {t.error} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}

      <form className="form" onSubmit={handleSubmit} noValidate={false}>
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
          <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
            {status === 'sending' ? `${t.sending}…` : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
