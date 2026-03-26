import Button from './components/ui/Button';
import TextInput from './components/ui/TextInput';
import Textarea from './components/ui/Textarea';
import Select from './components/ui/Select';
import Toggle from './components/ui/Toggle';
import Spinner from './components/ui/Spinner';
import StarIcon from './components/shared/StarIcon';
import { useState } from 'react';

const COLORS = [
  { name: '--red', value: '#EF002B', label: 'Red — primary action, CTA' },
  { name: '--blue', value: '#41B6E6', label: 'Blue — secondary accent, tags' },
  { name: '--white', value: '#FFFFFF', label: 'White — backgrounds', border: true },
  { name: '--black', value: '#161616', label: 'Black — primary text, headers' },
  { name: '--gray-100', value: '#F5F5F5', label: 'Gray 100 — page background', border: true },
  { name: '--gray-200', value: '#E0E0E0', label: 'Gray 200 — borders, dividers', border: true },
  { name: '--gray-500', value: '#757575', label: 'Gray 500 — secondary text, meta' },
  { name: '--gray-900', value: '#212121', label: 'Gray 900 — dark card bg, footer' },
];

export default function App() {
  const [toggleVal, setToggleVal] = useState('public');
  const [textVal, setTextVal] = useState('');

  return (
    <div style={{ backgroundColor: 'var(--gray-100)', minHeight: '100vh', padding: '48px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ borderBottom: '3px solid var(--red)', paddingBottom: 16, marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            chicago.com — Design System Specimen · Phase 1 review
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', textTransform: 'uppercase', color: 'var(--black)', lineHeight: 1 }}>
            <StarIcon size={28} color="var(--red)" style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} />
            chicago.com
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: 8 }}>
            Made in Chicago, for Chicago.
          </p>
        </div>

        {/* Typography */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Typography</SectionLabel>

          <Row label="Big Shoulders Display 900 · Display headings, page titles, neighborhood names">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '3rem', textTransform: 'uppercase', lineHeight: 1.1, color: 'var(--black)' }}>
              Logan Square
            </p>
          </Row>

          <Row label="Big Shoulders Display 900 · Smaller display use">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.875rem', textTransform: 'uppercase', lineHeight: 1.1, color: 'var(--black)' }}>
              Lincoln Square · Hyde Park · Pilsen
            </p>
          </Row>

          <Row label="Big Shoulders Text 700 · Card titles, section headings (title case, NOT all-caps)">
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.2, color: 'var(--black)' }}>
              The Best Tacos in Pilsen: A Local's Guide
            </p>
          </Row>

          <Row label="Big Shoulders Text 700 · Smaller heading use">
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2, color: 'var(--black)' }}>
              From the Newsroom
            </p>
          </Row>

          <Row label="Inter 400 · Body text, summaries, descriptions">
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '1rem', lineHeight: 1.6, color: 'var(--black)', maxWidth: 560 }}>
              Chicago is a city of neighborhoods — each one distinct, each one worth knowing. chicago.com is built by locals, for locals. Discover what's around you, share what you love, and remix the guides that inspire you.
            </p>
          </Row>

          <Row label="Inter 500 · UI labels, form labels">
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--black)' }}>
              Neighborhood · Category · Guide title
            </p>
          </Row>

          <Row label="Inter 400 0.8rem --gray-500 · Metadata (timestamps, handles, counts)">
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              @maria.chicago.com · 5 places · Logan Square · 2 hours ago
            </p>
          </Row>

          <Row label="Source Serif 4 400 · Article body text">
            <p style={{ fontFamily: 'var(--font-article)', fontWeight: 400, fontSize: '1rem', lineHeight: 1.7, color: 'var(--black)', maxWidth: 560 }}>
              The South Side neighborhood of Bronzeville has long been a center of Black cultural life in Chicago — home to Ida B. Wells, Louis Armstrong, and the Chicago Defender. Today, a new generation of residents is building on that legacy.
            </p>
          </Row>
        </section>

        {/* Colors */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Color Palette</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {COLORS.map(c => (
              <div key={c.name}>
                <div style={{
                  height: 72,
                  backgroundColor: c.value,
                  borderRadius: 2,
                  border: c.border ? '1px solid var(--gray-200)' : 'none',
                  marginBottom: 8,
                }} />
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--black)' }}>{c.name}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)' }}>{c.value}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>{c.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Star Icon */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Star Icon — Chicago six-pointed star (hexagram)</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[12, 16, 20, 24, 32, 48].map(size => (
              <div key={size} style={{ textAlign: 'center' }}>
                <StarIcon size={size} color="var(--red)" />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 6 }}>{size}px</p>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <StarIcon size={32} color="var(--blue)" />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 6 }}>blue</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <StarIcon size={32} color="var(--black)" />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 6 }}>black</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Buttons</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <Button variant="primary">Remix →</Button>
            <Button variant="primary">+ Create Guide</Button>
            <Button variant="secondary">Save guide</Button>
            <Button variant="ghost">♥ Like</Button>
            <Button variant="ghost">↗ Share</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">← Back</Button>
          </div>
        </section>

        {/* Form Controls */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Form Controls</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            <TextInput
              id="demo-input"
              label="Guide title"
              placeholder="e.g. My Favorite Coffee Spots in Wicker Park"
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
            />
            <TextInput
              id="demo-input-error"
              label="Guide title (error state)"
              placeholder="Required"
              error="Title is required"
            />
            <Textarea
              id="demo-textarea"
              label="Description (optional)"
              placeholder="What makes this guide special? (max 280 characters)"
              maxLength={280}
              value=""
              onChange={() => {}}
            />
            <Select
              id="demo-select"
              label="Neighborhood"
              placeholder="Select a neighborhood"
              options={[
                { value: 'logan-square', label: 'Logan Square' },
                { value: 'lincoln-square', label: 'Lincoln Square' },
                { value: 'hyde-park', label: 'Hyde Park' },
                { value: 'pilsen', label: 'Pilsen' },
              ]}
            />
            <div>
              <Toggle
                label="Visibility"
                value={toggleVal}
                onChange={setToggleVal}
                options={[
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Private' },
                ]}
              />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
                Current: {toggleVal}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Spinner size={20} />
              <Spinner size={24} />
              <Spinner size={32} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--gray-500)' }}>Spinner (Places search loading)</p>
            </div>
          </div>
        </section>

        {/* Card anatomy preview */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Card Anatomy Preview</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Guide Card mock */}
            <div style={{ background: 'var(--white)', borderRadius: 2, borderTop: '4px solid var(--red)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', paddingTop: '56.25%', background: 'var(--gray-200)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)' }}>16:9 cover photo</p>
                </div>
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--red)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.6875rem', padding: '3px 8px', borderRadius: 2 }}>
                  ★ GUIDE
                </div>
              </div>
              <div style={{ padding: '16px 16px 12px' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, color: 'var(--black)', marginBottom: 8 }}>
                  Hidden Jazz Bars of the South Loop
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.875rem', color: 'var(--black)', marginBottom: 2 }}>Maria Vasquez</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 12 }}>@maria.chicago.com</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 16 }}>📍 5 places · South Loop</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: 12 }}>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', padding: '4px 0' }}>♥ Like</button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)', fontFamily: 'var(--font-body)', fontSize: '0.8rem', padding: '4px 0' }}>↗ Share</button>
                  <div style={{ marginLeft: 'auto' }}>
                    <Button variant="primary" style={{ padding: '6px 14px', fontSize: '0.8rem', minHeight: 0 }}>Remix →</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Card mock */}
            <div style={{ background: 'var(--white)', borderRadius: 2, borderTop: '4px solid var(--blue)', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ padding: '16px 16px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 16, background: 'var(--gray-200)', borderRadius: 1 }} />
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NEWS</p>
                </div>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2, color: 'var(--black)', marginBottom: 8 }}>
                  Logan Square Neighbors Fight Rezoning Proposal Near the 606
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--black)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  Residents are pushing back against a developer's request to rezone a warehouse on Bloomingdale Avenue, arguing it would increase traffic and displace longtime tenants.
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Chicago Sun-Times · 4 min read · 3h ago</p>
                  <a href="#" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--blue)' }}>Read →</a>
                </div>
              </div>
            </div>

          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 12 }}>
            Note: guide card is taller (cover photo drives height), article card is compact (text-only). Height difference is the primary scan signal in a mixed feed.
          </p>
        </section>

        {/* Identity block preview */}
        <section style={{ marginBottom: 56 }}>
          <SectionLabel>Identity Patterns</SectionLabel>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--black)' }}>Alex Rivera</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>@alexrivera.chicago.com</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {['Food & Drink', 'Live Music', 'Parks'].map(b => (
                  <span key={b} style={{ background: 'var(--blue)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{b}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', color: 'var(--black)' }}>Ellery Jones</p>
                <span style={{ background: 'var(--red)', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.65rem', fontWeight: 600, padding: '2px 7px', borderRadius: 2 }}>★ Newsroom</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>@ellery.suntimes.com</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>Chicago Sun-Times</p>
            </div>
          </div>
        </section>

        <div style={{ borderTop: '2px solid var(--blue)', paddingTop: 8, marginBottom: 8 }} />
        <div style={{ borderTop: '2px solid var(--blue)', paddingTop: 16 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'center' }}>
            Made in Chicago, for Chicago.
          </p>
        </div>

      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: 'var(--gray-500)',
      borderBottom: '1px solid var(--gray-200)',
      paddingBottom: 8,
      marginBottom: 24,
    }}>
      {children}
    </p>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--gray-500)', marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  );
}
