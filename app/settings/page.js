'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    speechApiKey: '',
    ttsApiKey: '',
    googleCloudApiKey: '',
    openaiApiKey: '',
    mapsApiKey: ''
  })
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState({})

  useEffect(() => {
    const stored = localStorage.getItem('av-learning-api-keys')
    if (stored) {
      setApiKeys(JSON.parse(stored))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('av-learning-api-keys', JSON.stringify(apiKeys))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleChange = (key, value) => {
    setApiKeys(prev => ({ ...prev, [key]: value }))
  }

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const keyFields = [
    { 
      key: 'speechApiKey', 
      label: 'Speech Recognition API Key',
      description: 'Optional. The prototype uses Web Speech API by default.',
      placeholder: 'Enter your speech API key'
    },
    { 
      key: 'ttsApiKey', 
      label: 'Text-to-Speech API Key',
      description: 'Optional. For enhanced pronunciation quality.',
      placeholder: 'Enter your TTS API key'
    },
    { 
      key: 'googleCloudApiKey', 
      label: 'Google Cloud API Key',
      description: 'For real-time translation features.',
      placeholder: 'Enter your Google Cloud API key'
    },
    { 
      key: 'openaiApiKey', 
      label: 'OpenAI API Key',
      description: 'For AI-powered contextual learning suggestions.',
      placeholder: 'sk-...'
    },
    { 
      key: 'mapsApiKey', 
      label: 'Maps API Key',
      description: 'For real GPS integration in production.',
      placeholder: 'Enter your Maps API key'
    }
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      padding: '2rem' 
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>API Configuration</h1>
          <Link 
            href="/learn" 
            style={{ 
              color: '#6366f1', 
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            Back to Learning
          </Link>
        </div>

        <p style={{ 
          color: '#64748b', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          lineHeight: 1.6
        }}>
          Configure API keys for enhanced features. All keys are stored locally in your browser 
          and are never sent to our servers. For development, most features work without API keys 
          using browser-native APIs.
        </p>

        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0 }}>
            <strong>Note for developers:</strong> Copy <code>.env.example</code> to <code>.env</code> 
            for server-side API key configuration. Client-side keys entered here are for demo purposes.
          </p>
        </div>

        {keyFields.map(({ key, label, description, placeholder }) => (
          <div key={key} style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontWeight: 500, 
              marginBottom: '0.5rem',
              color: '#1e293b'
            }}>
              {label}
            </label>
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#64748b', 
              marginBottom: '0.5rem' 
            }}>
              {description}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type={showKeys[key] ? 'text' : 'password'}
                value={apiKeys[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={() => toggleShowKey(key)}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  color: '#64748b'
                }}
              >
                {showKeys[key] ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        ))}

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: saved ? '#059669' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {saved ? 'Saved!' : 'Save Configuration'}
          </button>
          <button
            onClick={() => {
              setApiKeys({
                speechApiKey: '',
                ttsApiKey: '',
                googleCloudApiKey: '',
                openaiApiKey: '',
                mapsApiKey: ''
              })
              localStorage.removeItem('av-learning-api-keys')
            }}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'white',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  )
}
