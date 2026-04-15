'use client'

import Link from 'next/link'

const features = [
  {
    title: 'Voice-First Learning',
    desc: 'Words are spoken aloud automatically. Respond by voice - no screen interaction needed while driving.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    )
  },
  {
    title: 'Dashcam Integration',
    desc: 'Full-screen driving view via webcam or simulated footage. Learning overlays on top like a HUD.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    )
  },
  {
    title: 'Context-Aware Content',
    desc: 'Vocabulary adapts to landmarks along the simulated route - learn "museo" as you pass a museum.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    )
  },
  {
    title: 'Study Session Logging',
    desc: 'Built-in research tools: session timers, interaction logging, and CSV export for analysis.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  }
]

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a12 0%, #111122 50%, #0a0a12 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '3rem 1.5rem', fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Badge */}
      <div style={{
        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
        padding: '0.35rem 1rem', borderRadius: '20px', fontSize: '0.75rem',
        color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '2rem'
      }}>
        CHI 2026 POSTER PROTOTYPE
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, color: '#fff',
        textAlign: 'center', marginBottom: '1rem', lineHeight: 1.1,
        background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.6))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        AV Learning
      </h1>

      <p style={{
        fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center',
        maxWidth: '520px', lineHeight: 1.6, marginBottom: '2.5rem'
      }}>
        Voice-first language learning for automated vehicles.
        Hands-free vocabulary practice through your dashcam and audio.
      </p>

      {/* Feature grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem', maxWidth: '900px', width: '100%', marginBottom: '2.5rem'
      }}>
        {features.map((f) => (
          <div key={f.title} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '1.5rem', transition: 'all 0.2s'
          }}>
            <div style={{ color: '#818cf8', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>{f.title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link href="/learn" style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '1rem 2.5rem', borderRadius: '14px',
        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: '#fff', textDecoration: 'none', fontSize: '1.1rem', fontWeight: 600,
        boxShadow: '0 8px 30px rgba(99,102,241,0.35)',
        transition: 'all 0.2s'
      }}>
        Start Driving Session
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
        </svg>
      </Link>

      {/* Footer */}
      <p style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', maxWidth: '500px', lineHeight: 1.6 }}>
        Learning on the Move: Challenges, Opportunities, and Design Recommendations
        for Education in Automated Vehicles
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.12)' }}>
        Barcelona, Spain — April 26 - May 1, 2026
      </p>
    </div>
  )
}
