'use client';

import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Could not send your message. Please try again or write to contact@consciousnessnetworks.com');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--spacing-3) var(--spacing-4)',
    border: '1px solid var(--border-medium)',
    borderRadius: 'var(--border-radius)',
    fontSize: 'var(--text-base)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-base)',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'var(--text-secondary)',
    fontWeight: 'var(--font-medium)',
    marginBottom: 'var(--spacing-2)',
    fontSize: 'var(--text-sm)',
  };

  return (
    <div>
      {status === 'success' && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          borderRadius: 'var(--border-radius)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          color: '#15803d',
          fontSize: 'var(--text-sm)',
        }}>
          Message received — we&apos;ll be in touch soon.
        </div>
      )}

      {status === 'error' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--border-radius)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          color: '#991b1b',
          fontSize: 'var(--text-sm)',
        }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="subject" style={labelStyle}>Topic</label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="">Select a topic</option>
            <option value="Research Collaboration">Research collaboration</option>
            <option value="Quantum Physics & Consciousness">Quantum physics &amp; consciousness</option>
            <option value="AI Consciousness">AI and consciousness</option>
            <option value="Paper Recommendation">Paper recommendation</option>
            <option value="General Inquiry">General inquiry</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" style={labelStyle}>Message</label>
          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message..."
            rows={6}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            background: status === 'sending' ? 'var(--text-tertiary)' : 'linear-gradient(135deg, var(--primary-purple), #764ba2)',
            color: 'white',
            padding: 'var(--spacing-3) var(--spacing-6)',
            border: 'none',
            borderRadius: 'var(--border-radius)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
            alignSelf: 'flex-start',
          }}
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
