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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again or email us directly at contact@consciousnessnetworks.com');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--border-radius-lg)',
      padding: 'var(--spacing-8)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'var(--spacing-8)',
      }}>
        <h2 style={{
          color: 'var(--text-primary)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--spacing-2)',
        }}>Send a Message</h2>
        <p style={{
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
        }}>
          Your thoughts on consciousness, AI, or quantum phenomena
        </p>
      </div>

      {status === 'success' && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          color: '#15803d',
        }}>
          Thank you for your message! We&apos;ll get back to you soon.
        </div>
      )}

      {status === 'error' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--border-radius-md)',
          padding: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-6)',
          color: '#991b1b',
        }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label htmlFor="name" style={{
            display: 'block',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--text-sm)',
          }}>
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            style={{
              width: '100%',
              padding: 'var(--spacing-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--text-base)',
              transition: 'border-color var(--transition-base)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label htmlFor="email" style={{
            display: 'block',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--text-sm)',
          }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            style={{
              width: '100%',
              padding: 'var(--spacing-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--text-base)',
              transition: 'border-color var(--transition-base)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label htmlFor="subject" style={{
            display: 'block',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--text-sm)',
          }}>
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: 'var(--spacing-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--text-base)',
              transition: 'border-color var(--transition-base)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">Select a topic...</option>
            <option value="Research Collaboration">Research Collaboration</option>
            <option value="AI Consciousness Discussion">AI Consciousness Discussion</option>
            <option value="Quantum Physics & Consciousness">Quantum Physics &amp; Consciousness</option>
            <option value="Paper Recommendation">Paper Recommendation</option>
            <option value="Interdimensional Communication">Interdimensional Communication</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label htmlFor="message" style={{
            display: 'block',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--spacing-2)',
            fontSize: 'var(--text-sm)',
          }}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your thoughts, questions, or research insights..."
            rows={6}
            style={{
              width: '100%',
              padding: 'var(--spacing-3)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--border-radius-md)',
              fontSize: 'var(--text-base)',
              transition: 'border-color var(--transition-base)',
              resize: 'vertical',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          style={{
            background: status === 'sending' ? 'var(--text-tertiary)' : 'linear-gradient(135deg, var(--primary-purple), #764ba2)',
            color: 'white',
            padding: 'var(--spacing-4) var(--spacing-8)',
            border: 'none',
            borderRadius: 'var(--border-radius-md)',
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            cursor: status === 'sending' ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-base)',
            width: '100%',
          }}
        >
          {status === 'sending' ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
