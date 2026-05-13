import React, { useState, useEffect, useCallback, useMemo } from 'react';
import emailjs from '@emailjs/browser';

// ---- EMAILJS CONFIG — fill these in after setting up at https://emailjs.com ----
const EMAILJS_SERVICE_ID = 'service_xkzn2bb';
const EMAILJS_TEMPLATE_ID = 'template_pfnsl0p';
const EMAILJS_PUBLIC_KEY = '1Gbsp5nEthZWrGFRs';

// ---- GLOBAL ANALYTICS EVENT TRACKER ----
const trackEvent = (action, category, label) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};

// ---- DATA ----
const NAV_LINKS = ['About', 'Projects', 'Services', 'Insights', 'Process', 'Contact'];

const SUMMARY_CARDS = [
  'Full Stack Software Engineer',
  'MERN Stack Developer',
  'React Developer',
  'Node.js Developer',
  'SaaS Developer',
  'Inventory & ERP Systems',
  'Custom CRM Software'
];

const CURRENTLY_BUILDING = [
  'IMAT Enterprise Operations',
  'GST Billing Software',
  'Automobile Software Systems',
  'AI Integration Pipelines',
  'SME Dashboard Solutions'
];

const IMAT_DIFFERENTIATORS = [
  { icon: '🧾', title: 'GST-Aware Workflows', desc: 'Separate standard vs grey inventory tracking with full Indian GST compliance coverage built directly into the transaction layer.' },
  { icon: '📄', title: 'OCR Invoice AI Integration', desc: 'Supplier PDF invoices automatically extracted via AI/OCR models and mapped directly to the GRN workflow — zero manual input.' },
  { icon: '🤝', title: 'Supplier Credit Tracking', desc: 'Credit normalization, outstanding dues, aging analysis, and supplier payment cycles consolidated in a single audit-ready dashboard.' },
  { icon: '📦', title: 'Inventory-First Architecture', desc: 'Every business transaction — purchases, sales, invoicing, ledger — ties back to stock levels as the single source of operational truth.' },
  { icon: '🚗', title: 'Indian Automotive Logic', desc: 'Purpose-built around real operational workflows of India\'s highly fragmented automotive aftermarket, not generic templates.' },
  { icon: '📒', title: 'Audit-Safe Double-Entry', desc: 'Automated ledger posting with a complete, tamper-evident audit trail mapping every part movement to its financial offset.' },
];

const INSIGHTS = [
  {
    title: 'Why Operational Systems Fail in SMEs',
    category: 'System Architecture',
    desc: 'Most custom business systems fail not because of database code, but because they ignore ground-level operational realities like grey inventory and loose credit terms.',
    body: `Most operational software built for SMEs fails not because of technical limitations, but because it was designed without understanding how the business actually works on the ground.

The three most common failure patterns are:

1. The system solves the demo problem, not the real problem. A purchase order module that works beautifully in a demo fails on day one because it doesn't account for partial deliveries, supplier substitutions, or informal credit extensions.

2. Data integrity is an afterthought. When stock updates happen in one place, payments in another, and ledgers in a third, no single source of truth exists. Teams stop trusting the system and revert to registers.

3. Operational edge cases are ignored. Grey inventory, cash-before-delivery suppliers, split invoices, and return workflows are the norm in Indian SME operations. Systems that don't model these realities are abandoned within months.

The solution is to build software from operational truth — spending time on the factory floor, in the warehouse, and with the accountant before writing a single line of code.`
  },
  {
    title: 'Designing GST-Aware Workflows',
    category: 'Business Automation',
    desc: 'How to decouple tax-compliant billing from internal operational tracking to maintain both complete visibility and strict legal compliance.',
    body: `For most Indian trading businesses, GST compliance and internal operational tracking pull in opposite directions. GST demands clean, complete, invoice-level records. Operations demand speed, flexibility, and accommodation of grey-market realities.

The solution is a dual-layer transaction model:

Layer 1 — Operational Layer: Records every stock movement, supplier transaction, and customer sale in real time. This layer is flexible and mirrors ground-level operations, including grey inventory, informal adjustments, and partial deliveries.

Layer 2 — Compliance Layer: A separate GST ledger that records only tax-compliant transactions with full invoice details. These entries are generated from the operational layer but only when a proper GST invoice exists.

This separation means your operations team works at speed while your accounts team has clean, GSTR-ready data. The key design principle: never let compliance requirements slow down operations, but never let operational flexibility compromise compliance.

In IMAT, this is implemented through tagged transaction types — every entry is marked as GST or non-GST at the point of entry, and the system automatically routes them to the appropriate ledger.`
  },
  {
    title: 'The OCR Invoice Pipeline',
    category: 'Data Ingestion',
    desc: 'Extracting structured JSON from complex PDF invoices using AI-driven OCR models and mapping them directly to the GRN ledger.',
    body: `Supplier invoices in the Indian automotive aftermarket are notoriously inconsistent. Different suppliers use different formats, different field names, different structures. Manually entering invoice data into a system is slow, error-prone, and a common source of stock discrepancies.

The OCR pipeline solves this in three stages:

Stage 1 — Extraction: The supplier PDF is uploaded and passed through an OCR model (we use a combination of document parsing and AI extraction). The output is a raw structured object with fields like invoice_number, supplier_name, line_items[], total_amount, and gst_breakup.

Stage 2 — Normalization: Supplier names are fuzzy-matched against the supplier master. Part numbers are matched against the product catalog using SKU normalization rules. Quantities and prices are validated against the linked Purchase Order.

Stage 3 — GRN Matching: The normalized invoice is automatically mapped to the open PO, generating a draft GRN. The warehouse team reviews and confirms. Any discrepancies (wrong quantity, wrong part, price mismatch) are flagged for resolution before the stock is accepted into inventory.

The result: what used to take 15-20 minutes of manual entry per invoice now takes under 2 minutes of review and confirmation.`
  },
  {
    title: 'Supplier-to-Stock Data Flow',
    category: 'Supplier Management',
    desc: 'Mapping the exact state machine of a part moving from an active Purchase Order, to transit, to warehouse bin locations.',
    body: `Every part that enters a warehouse goes through a predictable series of states. Modeling this state machine correctly is the difference between a system that gives real inventory visibility and one that is always out of sync with reality.

The IMAT Supplier-to-Stock flow has six states:

State 1 — PO Raised: The Purchase Order is created and sent to the supplier. Stock is not yet affected, but the committed quantity is tracked against the supplier.

State 2 — In Transit: The supplier dispatches. The PO is marked as dispatched with an expected delivery date. Teams can see what is on the way and plan accordingly.

State 3 — GRN in Progress: Goods arrive. The warehouse team opens a GRN against the PO. They record actual received quantities, which may differ from ordered quantities (partial delivery).

State 4 — GRN Confirmed: The received quantities are confirmed. Stock is updated in real time. The system automatically creates a payable against the supplier ledger.

State 5 — Invoice Matched: The supplier invoice is matched against the GRN. Quantity and price discrepancies are flagged. Once matched, the payable is finalized.

State 6 — Payment Processed: Payment is recorded, the supplier ledger is updated, and the transaction is closed.

This full state machine means at any point, you know exactly where every order stands — and every stock entry has a complete audit trail back to its source.`
  }
];

const WHY_FAILS = [
  { icon: '🔗', title: 'Disconnected Workflows', desc: 'Purchase orders live in spreadsheets, stock books inside a cabinet, and financial ledgers in accounting software. No single system sees the true flow.' },
  { icon: '📋', title: 'Manual Stock Dependency', desc: 'SMEs run on physical bin audits and manual ledger updates, generating constant data lag and frequent stockouts.' },
  { icon: '📊', title: 'Poor Audit Trails', desc: 'No verifiable link from a supplier invoice to a stock entry to the final customer invoice, rendering audits highly tedious and vulnerable to error.' },
  { icon: '🤝', title: 'Weak Supplier Portals', desc: 'Credit lines, interest charges, outstanding dues, and delivery parameters are kept loosely, causing cash flow leakage.' },
  { icon: '🧾', title: 'No Built-in GST Logic', desc: 'GST parameters and tax-exempt transactions are handled indiscriminately, increasing audit liabilities and misrepresenting margins.' },
  { icon: '🏢', title: 'Operational Silos', desc: 'Finance, warehouse storage, and B2B sales teams operate in isolation, basing critical scale decisions on stale metrics.' }
];

const IMAT_MODULES = [
  { icon: '🤝', title: 'Supplier Onboarding', desc: 'Evaluation modules, active credit lines, contact management, and comprehensive interaction archives.' },
  { icon: '🛒', title: 'Purchase Ledger', desc: 'Automated PO generation, multi-stage GRN, partial deliveries, PO-to-invoice reconciliation, and returns.' },
  { icon: '📋', title: 'Structured Product Catalog', desc: 'Multi-brand SKU management, dynamic pricing matrix, alternate part relationships, and category structures.' },
  { icon: '📦', title: 'Multi-Location Inventory', desc: 'Real-time stock status across warehouse locations with automatic replenishment alerts and bin mapping.' },
  { icon: '👥', title: 'B2B Client Management', desc: 'Credit limits, custom pricing levels, aging account reports, and detailed order history.' },
  { icon: '💰', title: 'Sales & Invoicing', desc: 'High-speed billing engines, tax-compliant invoice structures, returns, and outstanding balance tracking.' },
  { icon: '💳', title: 'Payment Operations', desc: 'Advance payment matching, partial payment allocations, direct ledger postings, and reconciliation.' },
  { icon: '📒', title: 'Automated Accounting', desc: 'True double-entry ledger automation, automatic GSTR preparation, and clear profit-and-loss reports.' },
  { icon: '📈', title: 'Operational Analytics', desc: 'Custom KPIs, low-stock notifications, revenue trends, and customizable CSV data export portals.' },
];

const SERVICES = [
  {
    icon: '📦', title: 'Inventory Management Systems',
    problem: 'Spreadsheet tracking and manual ledger entry cause massive stock errors, tying up working capital in redundant products.',
    solution: 'Engineered web applications with active SKU cataloging, batch-level tracking, audit logs, and automatic low-stock alerts.'
  },
  {
    icon: '⚙️', title: 'Custom ERP Systems',
    problem: 'Siloed tools result in operational bottlenecks, data misalignment, and days of manual ledger consolidation.',
    solution: 'Fully integrated ERP workflows combining procurement pipelines, sales funnels, stock sheets, and accounting ledgers into one database.'
  },
  {
    icon: '🧾', title: 'GST Billing Software',
    problem: 'Indian tax regulations require complex invoicing criteria that are slow, error-prone, and difficult to manage manually.',
    solution: 'High-speed invoice generators with built-in GST rules, dynamic CGST/SGST/IGST calculations, and GSTR reporting modules.'
  },
  {
    icon: '🔄', title: 'Workflow Automation & AI',
    problem: 'Operational teams spend dozens of hours manually entering data, matching invoices, and managing documents.',
    solution: 'AI-driven pipelines utilizing OCR invoice parsing, smart part normalization, and trigger-based approval flows.'
  },
  {
    icon: '📊', title: 'Internal SaaS Dashboards',
    problem: 'Business leaders lack instant, unified visibility into key performance indicators, delaying crucial decisions.',
    solution: 'High-performance interactive dashboards visualizing real-time metrics, payment trends, and sales trends.'
  },
  {
    icon: '🗂️', title: 'Custom CRM Software',
    problem: 'Unorganized sales pipelines, forgotten leads, and a lack of data-driven insights into sales performance.',
    solution: 'Feature-rich CRM platforms with role-based dashboard views, visual deal pipelines, contact history, and analytics.'
  },
];

const AUDIENCE = [
  { icon: '🏭', title: 'Small & Medium Enterprises (SMEs)', desc: 'Scaling enterprises that have outgrown Excel sheets and need robust internal applications to run daily business.' },
  { icon: '🚗', title: 'Automobile Distributors & Dealers', desc: 'Businesses with thousands of fast-moving SKUs, complex supplier credit terms, and high invoice frequencies.' },
  { icon: '📦', title: 'Inventory-Heavy Operations', desc: 'Entities seeking immediate stock auditing, bin level management, and precise transaction traceability across storage yards.' },
  { icon: '🚚', title: 'B2B Distribution Networks', desc: 'Wholesalers needing smooth purchase management, partial shipment tracking, and automated client credit parameters.' },
  { icon: '⚙️', title: 'SaaS & Enterprise Founders', desc: 'Visionary founders looking to develop robust, secure, and production-ready operational MVP tools built on scalable architecture.' },
  { icon: '🚀', title: 'Technical Recruiters', desc: 'Hiring teams seeking a results-focused engineer who translates business realities directly into high-integrity systems.' },
];

const PROCESS = [
  { num: '01', title: 'Discovery & Context', desc: 'We examine your existing processes, system bottlenecks, and spreadsheet habits to see where custom code can generate direct value.' },
  { num: '02', title: 'System Modeling', desc: 'We document your exact operational states, tax requirements, and user roles — defining features on truth, not theory.' },
  { num: '03', title: 'Database & Architecture', desc: 'Drafting strict schemas, normalization flows, and secure API boundaries to create a bulletproof system foundation.' },
  { num: '04', title: 'Agile Development', desc: 'Deploying functional, fully styled components on a staging server. You see progress every single week.' },
  { num: '05', title: 'Rigorous Testing', desc: 'Feeding real historical datasets into the system to audit calculations, transaction speeds, and mobile usability.' },
  { num: '06', title: 'Launch & Handoff', desc: 'Deploying to cloud infrastructure with complete documentation, team training, and continuous scaling updates.' },
];

const ENGAGEMENTS = [
  { title: 'MVP Product Development', desc: 'High-velocity development of scalable, secure SaaS applications to test business models with real market users.' },
  { title: 'Enterprise ERP Systems', desc: 'End-to-end operational software connecting databases, transactional flows, and accounting ledgers.' },
  { title: 'Custom CRM Software', desc: 'Automating customer interactions, lead pipelines, role guards, and performance tracking.' },
  { title: 'AI Integration Services', desc: 'Developing smart workflows, AI-driven OCR document extraction, and contextual assistants.' },
  { title: 'Dedicated Retainer Support', desc: 'On-demand engineering bandwidth to continuously optimize database queries, expand features, and scale systems.' },
  { title: 'System Architecture Audit', desc: 'Providing expert reviews on scaling databases, API performance, cloud migration, and security parameters.' },
];

const WHY_ME = [
  { title: 'Real Operational Context', desc: 'I speak the language of inventory aging, double-entry bookkeeping, GSTR, and supplier credit cycles — not just raw code syntax.' },
  { title: 'SME-First Engineering', desc: 'I design software that fits the raw, fast-paced reality of traditional business teams, maximizing day-one user adoption.' },
  { title: 'Database & Security Integrity', desc: 'Strict relational constraint validation, atomic ledger updates, and JWT/RBAC security policies are default standards.' },
  { title: 'Business Value Driven', desc: 'I do not over-engineer. Every component exists solely to automate a workflow, eliminate errors, or increase cash flow.' },
  { title: 'Automotive Software Expertise', desc: 'Deep understanding of automobile parts distribution, multi-brand catalog structures, and warehouse logistics.' },
  { title: 'Clean, Scalable Code', desc: 'Building on modern React, Node.js, PostgreSQL, and MongoDB architectures optimized for high lighthouse performance scores.' },
];

const TECH_STACK = [
  'React.js', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB',
  'REST API Design', 'Docker', 'AWS EC2', 'Cloudflare R2', 'JWT Auth',
  'AI/OCR Extraction', 'Python', 'SQL', 'Git', 'GitHub Actions'
];

const TESTIMONIALS = [
  {
    name: 'Umang Mathur',
    role: 'CTO @ Team1 Consulting',
    text: 'Akarsh builds software that actually reflects how business operations work. The supplier credit ledgers, automatic invoice generation, and audit trails are flawless. Recruiter teams looking for business systems engineers should snap him up immediately.',
  },
  {
    name: 'Harneet Seth',
    role: 'Director @ Team1 Consulting',
    text: 'He understood our operational bottlenecks better than most traditional ERP consultants. The custom CRM platform he delivered was adopted by our sales team instantly without friction.',
  },
  {
    name: 'Amit Seth',
    role: 'Founder & CEO @ Team1 Consulting',
    text: 'He does not just take specifications blindly. He questions the workflow, targets the root cause of inefficiency, and builds secure systems that scale.',
  },
];

// ---- APP COMPONENT ----
export default function App() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [openArticle, setOpenArticle] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  // Dynamic path-aware client router state: 'home' | 'privacy' | 'terms'
  const [view, setView] = useState('home');

  // Listen to path changes and handle deep links (useful for AdSense bots & user navigation)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#privacy' || path === '/privacy-policy') {
        setView('privacy');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (hash === '#terms' || path === '/terms-of-service') {
        setView('terms');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setView('home');
        if (hash) {
          setTimeout(() => {
            document.getElementById(hash.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    };

    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    let active = true;
    let obs;

    const initObserver = () => {
      if (!active) return;
      obs = new IntersectionObserver(
        (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
        { threshold: 0.08 }
      );
      const els = document.querySelectorAll('.reveal');
      els.forEach(el => obs.observe(el));
    };

    // Defer DOM reads to the next frame to prevent layout thrashing & forced reflows
    if (window.requestAnimationFrame) {
      requestAnimationFrame(initObserver);
    } else {
      setTimeout(initObserver, 50);
    }

    return () => {
      active = false;
      if (obs) obs.disconnect();
    };
  }, [view]);

  const scrollTo = useCallback((id) => {
    if (view !== 'home') {
      setView('home');
      window.history.pushState(null, '', '/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  }, [view]);

  const navigateToLegal = useCallback((targetView) => {
    setView(targetView);
    const hash = targetView === 'privacy' ? '#privacy' : '#terms';
    window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent('view_legal', 'Navigation', targetView);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    trackEvent('submit_contact_form', 'Form Interactions', form.name);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          name: form.name,
          from_email: form.email,
          email: form.email,
          reply_to: form.email,
          message: form.message,
          time: new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
          })
        },
        EMAILJS_PUBLIC_KEY
      );
      setSent(true);
      setForm({ name: '', email: '', message: '' });
      trackEvent('submit_contact_success', 'Form Interactions', 'Success');
    } catch (err) {
      console.error('EmailJS error:', err);
      setSendError(true);
      trackEvent('submit_contact_failure', 'Form Interactions', err.toString());
    } finally {
      setSending(false);
    }
  }, [form]);

  return (
    <>
      {/* ---- ACCESSIBLE JUMP TO MAIN LINK ---- */}
      <a href="#main-content" className="sr-only sr-only-focusable">Skip to main content</a>

      {/* ---- FLOATING WHATSAPP CHAT LINK ---- */}
      <a
        href="https://wa.me/919263964505"
        className="floating-whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={() => trackEvent('click_whatsapp_floating', 'Micro Interactions', 'WhatsApp Click')}
      >
        💬
      </a>

      {/* ---- NAV BAR (HEADER LANDMARK) ---- */}
      <header className="nav">
        <div className="nav-inner">
          <button
            className="nav-logo"
            onClick={() => {
              if (view !== 'home') {
                setView('home');
                window.history.pushState(null, '', '/');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Akarsh Jinesh Jain Home"
          >
            AJJ<span className="logo-dot">.</span>
          </button>

          <nav aria-label="Main Navigation">
            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
              {NAV_LINKS.map(l => (
                <li key={l}>
                  <button className="nav-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</button>
                </li>
              ))}
              <li>
                <button className="btn-nav" onClick={() => scrollTo('contact')}>Contact Me</button>
              </li>
            </ul>
          </nav>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {dark ? '☀' : '☾'}
            </button>
            <button
              className="menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* ---- MAIN CONTENT LANDMARK ---- */}
      <main id="main-content">
        {view === 'home' ? (
          <>
            {/* ---- HERO SECTION ---- */}
            <section className="hero" id="hero" aria-label="Hero Introduction">
              <div className="container hero-inner">
                <div className="hero-content">
                  <div className="hero-badge reveal">
                    <span className="badge-dot" />
                    Available for Consulting, Freelance &amp; Engineering Roles
                  </div>
                  <h1 className="hero-h1 reveal">
                    Building High-Performance<br />
                    <span className="accent-text">Business Systems</span><br />
                    &amp; Scalable SaaS Solutions
                  </h1>
                  <p className="hero-sub reveal">
                    I am a professional <strong>Full Stack Software Engineer</strong>, <strong>MERN Stack Developer</strong>, and <strong>SaaS Developer</strong>. I engineer secure, custom <strong>Inventory Management Systems</strong>, automated <strong>GST Billing Software</strong>, high-integrity <strong>ERP Systems</strong>, and custom <strong>CRM Software</strong> tailored to match your actual warehouse and physical workflows.
                  </p>

                  <div className="recruiter-grid reveal" style={{ marginBottom: '2.5rem' }}>
                    {SUMMARY_CARDS.map(c => (
                      <span key={c} className="r-card">{c}</span>
                    ))}
                  </div>

                  <div className="hero-cta reveal">
                    <button
                      className="btn-primary"
                      onClick={() => scrollTo('contact')}
                      onClickCapture={() => trackEvent('click_hero_contact', 'Hero Section', 'Contact Button')}
                    >
                      Let's Discuss Your Project
                    </button>
                    <a
                      className="btn-secondary"
                      href="/Akarsh Jain_Resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('download_cv_hero', 'Hero Section', 'Resume Download')}
                    >
                      Download Resume ↓
                    </a>
                    <a
                      className="btn-ghost"
                      href="https://github.com/akarshjjain"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('click_github_hero', 'Hero Section', 'GitHub Link')}
                    >
                      GitHub Profile ↗
                    </a>
                  </div>
                </div>
                <div className="reveal">
                  <div className="crm-project-img">
                    <img
                      src="/images/imat_dashboard.webp"
                      srcSet="/images/imat_dashboard-600.webp 600w, /images/imat_dashboard-1200.webp 1200w, /images/imat_dashboard.webp 1400w"
                      sizes="(max-width: 768px) 100vw, 600px"
                      alt="IMAT - Intelligent Inventory Management and ERP Platform Dashboard View"
                      loading="eager"
                      decoding="async"
                      width="600"
                      height="350"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ---- ABOUT SECTION ---- */}
            <section className="section" id="about" aria-labelledby="about-heading">
              <div className="container">
                <div className="section-label reveal">About Me</div>
                <div className="about-grid">
                  <div className="about-text reveal">
                    <h2 className="section-h2" id="about-heading">Not just a programmer.<br /><span className="accent-text">A systems engineer.</span></h2>
                    <p>
                      Engineering graduate from <strong>Jaypee Institute of Information Technology, Noida</strong> — B.Tech in Electronics &amp; Communication Engineering with a specialized Minor in Data Science &amp; Analytics.
                    </p>
                    <p>
                      My core expertise is not merely writing code syntax — it is in modeling complex operational flows. I understand credit normalization, inventory depreciation curves, GSTR calculations, transactional integrity constraints, and the fast-paced realities of Indian supply chain operations.
                    </p>
                    <p>
                      I developed <strong>IMAT</strong> based on direct, floor-level observations inside the Indian automotive aftermarket — where standard spreadsheet systems break down and expensive ERP products fail due to bad operational assumptions.
                    </p>
                    <p>
                      As an active <strong>React Developer</strong> and <strong>Node.js Developer</strong>, my long-term focus is engineering scalable, high-integrity <strong>Automobile Software Systems</strong> and SaaS platforms that help businesses move beyond loose worksheets and digitize their ground logistics with double-entry precision.
                    </p>

                    <div className="founder-note" role="note" aria-label="Founder Note">
                      <strong>Operational Insight:</strong>
                      <p>Traditional SME systems fail because they ignore loose credit terms, split invoicing, grey inventory, and cash-flow realities. My architectures model these real-world edge cases explicitly to ensure 100% adoption and data integrity.</p>
                    </div>
                  </div>

                  <div className="about-stats reveal" aria-label="Key Statistics">
                    {[
                      { num: '9', label: 'IMAT Modules Built' },
                      { num: '10K+', label: 'Active SKUs Managed' },
                      { num: '2', label: 'Deployed ERP Systems' },
                      { num: '5+', label: 'Operational Verticals' },
                    ].map(s => (
                      <div key={s.label} className="stat-card">
                        <div className="stat-num">{s.num}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="currently-building reveal">
                  <span className="cb-item" style={{ color: 'var(--accent)', fontWeight: 700 }}>Currently Building:</span>
                  {CURRENTLY_BUILDING.map(cb => (
                    <span key={cb} className="cb-item">{cb}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- AUDIENCE SECTION ---- */}
            <section className="section" id="audience" aria-labelledby="audience-heading">
              <div className="container">
                <div className="section-label reveal">Target Market</div>
                <h2 className="section-h2 reveal" id="audience-heading">Who I Work Best With</h2>
                <p className="section-sub reveal">I partner with SME business owners, traditional supply chain distributors, and tech startup founders who need clean, custom, high-integrity internal tools.</p>
                <div className="audience-grid reveal">
                  {AUDIENCE.map((a, i) => (
                    <article key={a.title} className="audience-card" style={{ transitionDelay: `${i * 0.05}s` }}>
                      <div className="audience-icon" aria-hidden="true">{a.icon}</div>
                      <h3 className="audience-title" style={{ fontSize: '1.15rem' }}>{a.title}</h3>
                      <p className="audience-desc">{a.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- IMAT (FEATURED PROJECT) ---- */}
            <section className="section imat-section" id="projects" aria-labelledby="imat-heading">
              <div className="container">
                <div className="section-label reveal">Featured Project</div>
                <div className="imat-header reveal">
                  <div>
                    <h2 className="section-h2" id="imat-heading">IMAT — Intelligent Management<br />&amp; Automation Tool</h2>
                    <p className="imat-sub">
                      A full-scale custom ERP system built for automobile parts distributors. Solving real supply-chain constraints with transactional integrity and audit-ready accounting.
                    </p>
                  </div>
                  <a
                    href="https://imat.jineshautomotive.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    onClick={() => trackEvent('click_imat_live_header', 'Projects Section', 'IMAT Header Link')}
                  >
                    View Live ERP Demo ↗
                  </a>
                </div>

                <div className="problem-solution reveal">
                  <div className="problem-card">
                    <div className="ps-label ps-problem">The Operational Problem</div>
                    <h3>Automotive aftermarket operations run on paper ledger chaos.</h3>
                    <ul className="ps-list">
                      <li>Stock tracked across fragmented, manual notebooks and loose files.</li>
                      <li>Zero clear visibility into outstanding supplier credit loops.</li>
                      <li>GST invoicing and operational cash stock sheets mixed with no audit trail.</li>
                      <li>Lack of multi-location tracking causing warehouse delays and item loss.</li>
                      <li>No central ledgers, forcing tedious weekend accounts reconciliations.</li>
                    </ul>
                  </div>

                  <div className="ps-arrow" aria-hidden="true">→</div>

                  <div className="solution-card">
                    <div className="ps-label ps-solution">The System Solution</div>
                    <h3>IMAT: A Single Integrated MERN Source of Truth.</h3>
                    <ul className="ps-list">
                      <li>Real-time multi-location tracking with bin-mapping and audit records.</li>
                      <li>Automated workflow linking Purchase Orders to GRNs and verified bills.</li>
                      <li>Separated compliance/compliance-free records with individual ledgers.</li>
                      <li>Fully automated double-entry ledger posting on every item invoice.</li>
                      <li>Executive KPI dashboards surfaced instantly upon administrative login.</li>
                    </ul>
                  </div>
                </div>

                <div className="workflow reveal" aria-label="System Operational Flow">
                  <div className="workflow-label">System Transaction Lifecycle</div>
                  <div className="workflow-steps">
                    {['Suppliers', 'Purchase Orders', 'GRN', 'Inventory', 'Sales', 'Invoicing', 'Ledger', 'Reports'].map((s, i, arr) => (
                      <React.Fragment key={s}>
                        <div className="workflow-step">{s}</div>
                        {i < arr.length - 1 && <div className="workflow-arrow" aria-hidden="true">→</div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="modules-grid">
                  {IMAT_MODULES.map((m, i) => (
                    <article key={m.title} className="module-card reveal" style={{ transitionDelay: `${i * 0.04}s` }}>
                      <div className="module-icon" aria-hidden="true">{m.icon}</div>
                      <h3 className="module-title" style={{ fontSize: '1.1rem' }}>{m.title}</h3>
                      <p className="module-desc">{m.desc}</p>
                    </article>
                  ))}
                </div>

                <ArchitectureMockup />

                <div className="imat-tech reveal">
                  <div className="imat-tech-label">Automotive Business &amp; Engineering Differentiators</div>
                  <div className="imat-diff-grid">
                    {IMAT_DIFFERENTIATORS.map(d => (
                      <div key={d.title} className="imat-diff-item">
                        <span className="imat-diff-icon" aria-hidden="true">{d.icon}</span>
                        <div className="imat-diff-content">
                          <h3 className="imat-diff-title" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{d.title}</h3>
                          <div className="imat-diff-desc">{d.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="imat-tech reveal">
                  <div className="imat-tech-label">Technology Stack &amp; Protocols</div>
                  <div className="imat-tech-tags">
                    {['React.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'REST APIs', 'Docker', 'Cloudflare R2', 'JWT Auth', 'AI OCR Integration'].map(t => (
                      <span key={t} className="tech-pill">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="reveal" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://imat.jineshautomotive.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    onClick={() => trackEvent('click_imat_demo_bottom', 'Projects Section', 'IMAT Demo Click')}
                  >
                    Launch Live ERP Platform Demo ↗
                  </a>
                </div>
              </div>
            </section>

            {/* ---- SECONDARY PROJECT (CRM PORTAL) ---- */}
            <section className="section" aria-labelledby="crm-heading">
              <div className="container">
                <div className="section-label reveal">Secondary Feature</div>
                <div className="crm-project reveal">
                  <div className="crm-project-text">
                    <div className="crm-badge">
                      <span className="blink-dot"></span>
                      MERN Enterprise CRM
                    </div>
                    <h2 className="section-h2" id="crm-heading" style={{ marginBottom: '0.5rem' }}>Custom CRM Software</h2>
                    <p className="crm-project-desc">
                      An enterprise-grade, high-integrity <strong>CRM Software</strong> featuring a secure, role-based access control (RBAC) architecture. Engineered for high data isolation, featuring detailed Admin vs. Seller analytics interfaces, a drag-and-drop 3-stage deal pipeline, and an interactive <strong>AI Integration</strong> assistant for context-based user onboarding.
                    </p>
                    <div className="crm-features">
                      {[
                        '5 Core Business Pipeline Modules',
                        'Dual-Role Admin vs Seller Live Dashboards',
                        'Secure JWT Sessions with Auto-Expiration',
                        'Role-Based Access Control Guards',
                        'Visual 3-Stage Sales Funnel Tracking',
                        'Built-in AI Assistant Integration',
                        'Strict Schema Data Separation',
                        'Dynamic Conversions & Sales Analytics'
                      ].map(f => (
                        <div key={f} className="crm-feature"><span className="check" aria-hidden="true">✓</span> {f}</div>
                      ))}
                    </div>
                    <div className="crm-tech">
                      {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'JWT RBAC'].map(t => (
                        <span key={t} className="tech-pill">{t}</span>
                      ))}
                    </div>
                    <a
                      href="https://github.com/akarshjjain/crm-portal-mern"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ width: 'fit-content' }}
                      onClick={() => trackEvent('click_crm_github', 'Projects Section', 'CRM GitHub Link')}
                    >
                      View CRM Code Repository ↗
                    </a>
                  </div>
                  <div className="crm-project-img">
                    <img
                      src="/images/CRM_home_admin.webp"
                      srcSet="/images/CRM_home_admin-600.webp 600w, /images/CRM_home_admin-1200.webp 1200w, /images/CRM_home_admin.webp 1400w"
                      sizes="(max-width: 768px) 100vw, 600px"
                      alt="Custom CRM Software Dashboard illustrating analytical charts and sales tracking columns"
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="375"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ---- SERVICES SECTION ---- */}
            <section className="section services-section" id="services" aria-labelledby="services-heading">
              <div className="container">
                <div className="section-label reveal">Expertise Channels</div>
                <h2 className="section-h2 reveal" id="services-heading">Services &amp; Custom Solutions</h2>

                <div className="india-banner reveal">
                  <div className="india-banner-icon" aria-hidden="true">🇮🇳</div>
                  <div className="india-banner-text">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Optimized for Indian SME &amp; Automotive Logistics</h3>
                    <p>My applications are custom-built to handle real compliance structures, partial bills, credit loops, double-entry financial posting, and complex multi-brand automotive parts categorization.</p>
                  </div>
                </div>

                <p className="section-sub reveal">Direct business value, zero engineering bloat. I convert offline operations sheets into secure, lightning-fast web applications.</p>
                <div className="services-grid">
                  {SERVICES.map((s, i) => (
                    <article key={s.title} className="service-card reveal" style={{ transitionDelay: `${i * 0.04}s` }}>
                      <div className="service-icon" aria-hidden="true">{s.icon}</div>
                      <h3 className="service-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{s.title}</h3>
                      <div className="service-ps">
                        <div className="s-problem"><strong>The Hurdle:</strong> {s.problem}</div>
                        <div className="s-solution" style={{ marginTop: '0.5rem' }}><strong>The System:</strong> {s.solution}</div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- WHY SYSTEMS FAIL SECTION ---- */}
            <section className="section" aria-labelledby="fail-heading">
              <div className="container">
                <div className="section-label reveal">Operational Root Causes</div>
                <h2 className="section-h2 reveal" id="fail-heading">Why Most SME Operations Software Fails</h2>
                <p className="section-sub reveal">Understanding on-the-ground operational friction is why I engineer systems that retain 100% daily staff usage.</p>
                <div className="fail-grid">
                  {WHY_FAILS.map((f, i) => (
                    <article key={f.title} className="fail-card reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                      <span className="fail-icon" aria-hidden="true">{f.icon}</span>
                      <h3 className="fail-title" style={{ fontSize: '1.15rem' }}>{f.title}</h3>
                      <p className="fail-desc">{f.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- INSIGHTS (WRITING) SECTION ---- */}
            <section className="section" id="insights" aria-labelledby="insights-heading">
              <div className="container">
                <div className="section-label reveal">Technical Writing</div>
                <h2 className="section-h2 reveal" id="insights-heading">Architecture Insights &amp; Essays</h2>
                <p className="section-sub reveal">In-depth guides on database consistency, Indian compliance engineering, and modern web application patterns.</p>
                <div className="insights-grid">
                  {INSIGHTS.map((ins, i) => (
                    <article
                      key={ins.title}
                      className="insight-card reveal"
                      style={{ transitionDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                      onClick={() => {
                        setOpenArticle(ins);
                        trackEvent('read_article', 'Technical Writing', ins.title);
                      }}
                    >
                      <div className="insight-cat">{ins.category}</div>
                      <h3 className="insight-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{ins.title}</h3>
                      <p className="insight-desc">{ins.desc}</p>
                      <div className="insight-read" aria-label={`Read article: ${ins.title}`}>Read Article &#8594;</div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- ARTICLE MODAL ---- */}
            {openArticle && (
              <div className="modal-backdrop" onClick={() => setOpenArticle(null)}>
                <div className="modal-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-art-title">
                  <div className="modal-header">
                    <div>
                      <div className="insight-cat" style={{ marginBottom: '0.5rem' }}>{openArticle.category}</div>
                      <h2 className="modal-title" id="modal-art-title">{openArticle.title}</h2>
                    </div>
                    <button className="modal-close" onClick={() => setOpenArticle(null)} aria-label="Close modal">×</button>
                  </div>
                  <div className="modal-body">
                    {openArticle.body.split('\n\n').map((para, i) => (
                      <p key={i} className="modal-para">{para}</p>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <button className="btn-primary" onClick={() => setOpenArticle(null)}>Close Document</button>
                  </div>
                </div>
              </div>
            )}

            {/* ---- PROCESS SECTION ---- */}
            <section className="section" id="process" aria-labelledby="process-heading">
              <div className="container">
                <div className="section-label reveal">Collaboration Steps</div>
                <h2 className="section-h2 reveal" id="process-heading">System Engineering Lifecycle</h2>
                <p className="section-sub reveal">My structured, transparent engineering process delivers functional, bug-free internal systems with absolute accountability.</p>
                <div className="process-grid">
                  {PROCESS.map((p, i) => (
                    <article key={p.num} className="process-card reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                      <div className="process-num" aria-hidden="true">{p.num}</div>
                      <div className="process-info">
                        <h3 className="process-title" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{p.title}</h3>
                        <p className="process-desc">{p.desc}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- ENGAGEMENT MODELS SECTION ---- */}
            <section className="section" id="engagements" aria-labelledby="engagements-heading">
              <div className="container">
                <div className="section-label reveal">Engagement Framework</div>
                <h2 className="section-h2 reveal" id="engagements-heading">Project Collaboration Formats</h2>
                <p className="section-sub reveal">Flexible engineering formats tailored to your system stage, product scope, and developmental capacity.</p>
                <div className="engagement-grid">
                  {ENGAGEMENTS.map((e, i) => (
                    <article key={e.title} className="engagement-card reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                      <h3 className="engagement-title" style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{e.title}</h3>
                      <p className="engagement-desc">{e.desc}</p>
                    </article>
                  ))}
                </div>
                <div className="pricing-note reveal" role="note" aria-label="Pricing Note">
                  <span style={{ color: 'var(--accent)', fontSize: '1.2rem' }} aria-hidden="true">ℹ</span>
                  <div>System pricing scales logically based on relational complexity, multi-warehouse scopes, custom integrations, and real-time ledger compliance audit levels. Let's design a precise roadmap together.</div>
                </div>
              </div>
            </section>

            {/* ---- WHY WORK WITH ME SECTION ---- */}
            <section className="section" aria-labelledby="whyme-heading">
              <div className="container">
                <div className="section-label reveal">My Differentiators</div>
                <h2 className="section-h2 reveal" id="whyme-heading">Why Hire Me for Business Software</h2>
                <div className="why-grid">
                  {WHY_ME.map((w, i) => (
                    <article key={w.title} className="why-card reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                      <div className="why-num" aria-hidden="true">0{i + 1}</div>
                      <h3 className="why-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{w.title}</h3>
                      <p className="why-desc">{w.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- TECH STACK BADGES SECTION ---- */}
            <section className="section" aria-labelledby="tech-heading">
              <div className="container">
                <div className="section-label reveal">Toolbox</div>
                <h2 className="section-h2 reveal" id="tech-heading">Engineering Technologies</h2>
                <div className="tech-grid reveal">
                  {TECH_STACK.map(t => (
                    <div key={t} className="tech-badge">{t}</div>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- TIMELINE (EXPERIENCE/EDUCATION) SECTION ---- */}
            <section className="section" id="experience" aria-labelledby="experience-heading">
              <div className="container">
                <div className="section-label reveal">History</div>
                <h2 className="section-h2 reveal" id="experience-heading">Engineering Experience &amp; Education</h2>
                <div className="timeline">
                  <article className="timeline-item reveal">
                    <div className="timeline-dot" aria-hidden="true" />
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-company">Team1 Consulting Pvt. Ltd. — Noida</span>
                        <span className="timeline-date">Jun – Jul 2025</span>
                      </div>
                      <h3 className="timeline-role" style={{ fontSize: '1.25rem' }}>MERN Stack Developer Intern</h3>
                      <ul className="exp-list">
                        <li>Designed and deployed a production-ready, full-stack <strong>CRM Software</strong> comprising 5 integrated pipeline modules — Leads, Contacts, Accounts, Deals, and Tasks — supporting distinct Admin and Seller workspace layouts.</li>
                        <li>Built and integrated secure REST APIs leveraging JSON Web Tokens (JWT) and role-based access control (RBAC) to ensure strict customer and database record isolation.</li>
                        <li>Implemented responsive React interfaces connecting to custom Express analytical engines, calculating corporate KPIs and seller rankings in real time.</li>
                        <li>Configured smart AI integrations into the CRM onboarding module to contextually guide sales representatives on data inputs.</li>
                        <li>Collaborated closely on system parameters, resolving performance bottlenecks inside MongoDB queries to support fast data views.</li>
                      </ul>
                    </div>
                  </article>

                  <article className="timeline-item reveal">
                    <div className="timeline-dot edu" aria-hidden="true" />
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span className="timeline-company">Jaypee Institute of Information Technology — Noida</span>
                        <span className="timeline-date">2022 – 2026</span>
                      </div>
                      <h3 className="timeline-role" style={{ fontSize: '1.25rem' }}>B.Tech — Electronics &amp; Communication Engineering</h3>
                      <p className="timeline-sub">Minor Specialization: Data Science &amp; Data Analytics &nbsp; </p>
                    </div>
                  </article>
                </div>
              </div>
            </section>

            {/* ---- TESTIMONIALS SECTION ---- */}
            <section className="section" aria-labelledby="testimonials-heading">
              <div className="container">
                <div className="section-label reveal">Referrals</div>
                <h2 className="section-h2 reveal" id="testimonials-heading">What Collaborators Say</h2>
                <div className="testimonials-grid">
                  {TESTIMONIALS.map(t => (
                    <blockquote key={t.name} className="testimonial-card reveal">
                      <div className="testimonial-quote" aria-hidden="true">"</div>
                      <p className="testimonial-text">{t.text}</p>
                      <footer className="testimonial-author">
                        <div className="testimonial-avatar" aria-hidden="true">{t.name[0]}</div>
                        <div>
                          <cite className="testimonial-name" style={{ fontStyle: 'normal', fontWeight: 'bold', display: 'block' }}>{t.name}</cite>
                          <span className="testimonial-role">{t.role}</span>
                        </div>
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>
            </section>

            {/* ---- CONTACT (FORM) SECTION ---- */}
            <section className="section contact-section" id="contact" aria-labelledby="contact-heading">
              <div className="container">
                <div className="section-label reveal">Get In Touch</div>
                <h2 className="section-h2 reveal" id="contact-heading">
                  Let's Build Systems That Solve<br />
                  <span className="accent-text">Actual Operational Obstacles.</span>
                </h2>
                <div className="contact-grid">
                  <div className="contact-info reveal">
                    <div className="contact-links">
                      {[
                        { label: 'Email Address', value: 'akarsh.j.jain@gmail.com', href: 'mailto:akarsh.j.jain@gmail.com' },
                        { label: 'LinkedIn Profile', value: 'linkedin.com/in/akarsh-jinesh-jain', href: 'https://linkedin.com/in/akarsh-jinesh-jain-9b4450380' },
                        { label: 'GitHub Repos', value: 'github.com/akarshjjain', href: 'https://github.com/akarshjjain' },
                        { label: 'WhatsApp Chat', value: '+91 92639 64505', href: 'https://wa.me/919263964505' },
                      ].map(l => (
                        <a
                          key={l.label}
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                          onClick={() => trackEvent(`click_contact_${l.label.toLowerCase().replace(' ', '_')}`, 'Contact Section', l.label)}
                        >
                          <span className="contact-link-label">{l.label}</span>
                          <span className="contact-link-value">{l.value} ↗</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="contact-form-wrap reveal">
                    {sent ? (
                      <div className="form-success" role="status" aria-live="polite">
                        <div className="success-icon" aria-hidden="true">✓</div>
                        <h3>Message sent successfully.</h3>
                        <p>I will review your operational requirements and get back to you within 24 hours.</p>
                      </div>
                    ) : (
                      <form className="contact-form" onSubmit={handleSubmit} aria-labelledby="contact-heading">
                        <div className="form-group">
                          <label htmlFor="form-name">Your Full Name</label>
                          <input
                            id="form-name"
                            type="text"
                            required
                            placeholder="Your Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="form-email">Your Email Address</label>
                          <input
                            id="form-email"
                            type="email"
                            required
                            placeholder="Your Email Address"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="form-msg">Tell Me About Your Operational Obstacles</label>
                          <textarea
                            id="form-msg"
                            required
                            rows={5}
                            placeholder="Tell me about your spreadsheet habits, SKUs, databases, or project goals..."
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                          />
                        </div>
                        {sendError && (
                          <div style={{ color: '#F87171', fontSize: '0.82rem', marginBottom: '0.5rem' }} role="alert">
                            Something went wrong sending through the system. Please email directly at: akarsh.j.jain@gmail.com
                          </div>
                        )}
                        <button type="submit" className="btn-primary btn-full" disabled={sending}>
                          {sending ? 'Processing Dispatch…' : 'Send Secure Message'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : view === 'privacy' ? (
          <PrivacyPolicyView setView={setView} navigateToLegal={navigateToLegal} />
        ) : (
          <TermsOfServiceView setView={setView} navigateToLegal={navigateToLegal} />
        )}
      </main>

      {/* ---- FOOTER LANDMARK ---- */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="nav-logo">AJJ<span className="logo-dot">.</span></span>
            <p className="footer-sub">Operational Systems Builder · Noida, UP, India</p>
          </div>
          <div className="footer-links" aria-label="Footer Nav Links">
            {NAV_LINKS.map(l => (
              <button key={l} className="footer-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</button>
            ))}
          </div>
          <div className="footer-social" aria-label="Social Profiles">
            <a href="https://github.com/akarshjjain" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/akarsh-jinesh-jain-9b4450380" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:akarsh.j.jain@gmail.com">Email</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <p>© 2026 Akarsh Jinesh Jain. All rights reserved. Indian Business Systems Architect.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <button className="footer-link-sub" style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'none', border: 'none' }} onClick={() => navigateToLegal('privacy')}>Privacy Policy</button>
              <button className="footer-link-sub" style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'none', border: 'none' }} onClick={() => navigateToLegal('terms')}>Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// ---- PRIVACY POLICY SECTION VIEW (AdSense Compliant) ----
const PrivacyPolicyView = React.memo(function PrivacyPolicyView({ setView, navigateToLegal }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="container section" style={{ padding: '8rem 2rem 4rem' }} aria-labelledby="privacy-title">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button
          className="btn-secondary"
          style={{ marginBottom: '2rem' }}
          onClick={() => {
            setView('home');
            window.history.pushState(null, '', '/');
          }}
        >
          ← Back to Portfolio
        </button>
        <h1 className="section-h2" id="privacy-title">Privacy Policy</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Last Updated: May 12, 2026</p>

        <div className="policy-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.8', color: 'var(--text2)' }}>
          <p>
            At <strong>akarshjjain.com</strong>, the privacy of our visitors is of extreme importance to us. This Privacy Policy document outlines the types of personal information received and collected by our server and how it is utilized.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>1. Collection of Personal Information</h2>
          <p>
            When utilizing our integrated contact form, we collect the personal details you voluntarily provide: your name, email address, and specific details concerning your operational software or business requirements. This data is exclusively processed to respond directly to your business inquiries.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>2. Log Files &amp; Standard Hosting Data</h2>
          <p>
            Like many other websites, <strong>akarshjjain.com</strong> makes use of log files. The information inside the log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information. IP addresses and other such information are not linked to any information that is personally identifiable.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>3. Cookies &amp; Web Beacons</h2>
          <p>
            We use cookies to store information about visitors' preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based on visitors' browser type or other information that the visitor sends via their browser.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>4. Google AdSense &amp; Third-Party Advertising</h2>
          <p>
            Google, as a third-party vendor, may use cookies to serve ads on this site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to this site and other sites on the Internet.
          </p>
          <p>
            Users may opt-out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Google Ad Settings</a>. Alternatively, you can opt-out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>www.aboutads.info</a>.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>5. Third-Party Services (Analytics &amp; Contact)</h2>
          <p>
            Our portfolio integrates trusted analytics tools including <strong>Google Analytics (GA4)</strong> and <strong>Microsoft Clarity</strong> to analyze site speeds, core vitals, and user engagement. These services may log browser details, device parameters, and visual scroll paths. Additionally, we use <strong>EmailJS</strong> as a form transport agent which securely transmits messages from our server without saving transactional copies of your email to external lists.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>6. GDPR and CCPA Compliance</h2>
          <p>
            Under the GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act), users have the absolute right to view, download, update, or completely purge any personal communications we hold. If you wish to execute any of these data rights, please contact us at <a href="mailto:akarsh.j.jain@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>akarsh.j.jain@gmail.com</a> and your request will be processed within 48 hours.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>7. Security</h2>
          <p>
            We prioritize secure communications. All database systems, REST APIs, and client interactions utilize secure HTTPS parameters, maintaining top industry integrity standards.
          </p>
        </div>
      </div>
    </section>
  );
});

// ---- TERMS OF SERVICE SECTION VIEW (AdSense Compliant) ----
const TermsOfServiceView = React.memo(function TermsOfServiceView({ setView, navigateToLegal }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="container section" style={{ padding: '8rem 2rem 4rem' }} aria-labelledby="terms-title">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button
          className="btn-secondary"
          style={{ marginBottom: '2rem' }}
          onClick={() => {
            setView('home');
            window.history.pushState(null, '', '/');
          }}
        >
          ← Back to Portfolio
        </button>
        <h1 className="section-h2" id="terms-title">Terms of Service</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Last Updated: May 12, 2026</p>

        <div className="policy-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.8', color: 'var(--text2)' }}>
          <p>
            Welcome to the professional portfolio of <strong>Akarsh Jinesh Jain</strong>. By accessing this website (<strong>akarshjjain.com</strong>), you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>1. Intellectual Property Rights</h2>
          <p>
            All intellectual assets showcased on this web application, including source code structures, design elements, visual diagrams, written essays, and structural layouts are the exclusive property of Akarsh Jinesh Jain, unless otherwise stated. You may review the portfolios and download code files or resumes solely for professional hiring and evaluation purposes. Redistribution, reproduction, or unauthorized commercial exploitation of this material without written consent is strictly prohibited.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>2. Use of Live Demonstrations</h2>
          <p>
            Our featured live ERP demos (including IMAT) are provided strictly as interactive professional demonstrations. You may input dummy transactional parameters to audit system capabilities and database speeds. However, you must not use these platforms for illegal activities, send malicious payloads, or attempt SQL/XSS injections. We reserve the right to ban offending IP addresses from our cloud servers immediately.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>3. Accuracy of Information</h2>
          <p>
            While we strive to ensure that all information, career statistics, project features, and technical summaries on this portfolio are complete, professional, and up-to-date, we do not guarantee their absolute, permanent accuracy under rapidly evolving framework specifications.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>4. Disclaimer of Liability</h2>
          <p>
            The software, insights, and demonstrations provided on <strong>akarshjjain.com</strong> are provided "as-is" without warranties of any kind. Akarsh Jinesh Jain is not liable for any data loss, server downtime, or transactional complications resulting from the use of code snippets, repositories, or linked demonstrations.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>5. Third-Party Links</h2>
          <p>
            This website contains links to third-party domains (such as LinkedIn, GitHub, or live domain sub-sections). We do not control, endorse, or assume responsibility for the content, cookies, or privacy standards of these third-party platforms.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>6. Governing Law</h2>
          <p>
            Any disputes, legal claims, or arbitration arising from the use of <strong>akarshjjain.com</strong> will be governed and resolved under the laws of Uttar Pradesh, India, without regard to its conflict of law provisions.
          </p>

          <h2 style={{ color: 'var(--text)', fontSize: '1.4rem', marginTop: '1rem' }}>7. Contact Information</h2>
          <p>
            If you have any questions or clarifications regarding these Terms of Service, please write directly to us at: <a href="mailto:akarsh.j.jain@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>akarsh.j.jain@gmail.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
});

// ---- ARCHITECTURE MOCKUP COMPONENT ----
const ArchitectureMockup = React.memo(function ArchitectureMockup() {
  return (
    <div className="arch-wrap reveal">
      <div className="arch-header">IMAT — Multi-Engine System Architecture</div>
      <div className="arch-body">
        <div className="arch-layer">
          <div className="arch-box">React Client Dashboard</div>
          <div className="arch-box">Admin Operations Workspace</div>
          <div className="arch-box">Mobile-Ready Interface</div>
        </div>
        <div className="arch-connector">
          <div className="arch-connector-line" />
          <div className="arch-connector-label">REST API · JWT Session Guards · Role RBAC Middleware</div>
          <div className="arch-connector-line" />
        </div>
        <div className="arch-layer">
          <div className="arch-box primary">Node.js / Express Core Server</div>
          <div className="arch-box primary">AI / OCR Invoice Parsing Engine</div>
          <div className="arch-box primary">GST Billing Calculation Ledger</div>
        </div>
        <div className="arch-connector">
          <div className="arch-connector-line" />
          <div className="arch-connector-label">Atomic Transaction isolation · Schema Sanitization &amp; Validation</div>
          <div className="arch-connector-line" />
        </div>
        <div className="arch-layer">
          <div className="arch-box db">PostgreSQL — Financial Ledger Database</div>
          <div className="arch-box db">MongoDB — Operational SKU Catalog</div>
          <div className="arch-box db">Cloudflare R2 — Document &amp; Invoice Storage</div>
        </div>
      </div>
    </div>
  );
});

// ---- DASHBOARD MOCKUP COMPONENT ----
const DashboardMockup = React.memo(function DashboardMockup() {
  return (
    <div className="mockup-wrap">
      <div className="mockup-bar">
        <span className="mockup-dot r" /><span className="mockup-dot y" /><span className="mockup-dot g" />
        <span className="mockup-title">IMAT — Live System Console</span>
      </div>
      <div className="mockup-body">
        <div className="mockup-sidebar">
          {['Dashboard', 'Inventory', 'Purchases', 'Suppliers', 'Sales', 'Ledger'].map(item => (
            <div key={item} className={`mockup-nav-item ${item === 'Dashboard' ? 'active' : ''}`}>{item}</div>
          ))}
        </div>
        <div className="mockup-main">
          <div className="mockup-metrics">
            {[
              { label: 'Stock Valuation', val: '₹24.8L', up: true },
              { label: 'Active Pipeline POs', val: '12', up: false },
              { label: "Today's GST Sales", val: '₹1.2L', up: true },
            ].map(m => (
              <div key={m.label} className="mockup-metric">
                <div className="mm-val">{m.val} <span className={m.up ? 'up' : 'down'}>{m.up ? '↑' : '↓'}</span></div>
                <div className="mm-label">{m.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
            <div className="mockup-chart">
              <div className="mockup-chart-label">Invoicing (7 Days)</div>
              <div className="mockup-bars">
                {[40, 70, 50, 90, 60, 85, 100].map((h, i) => (
                  <div key={i} className="mockup-bar-wrap"><div className="mockup-bar" style={{ height: `${h}%` }} /></div>
                ))}
              </div>
            </div>
            <div className="mockup-chart" style={{ flex: 1.5, background: 'var(--bg2)' }}>
              <div className="mockup-chart-label">Low Stock Notifications</div>
              <div className="mockup-table">
                {[
                  { sku: 'BRK-PAD-01', stock: 4, status: 'Critical' },
                  { sku: 'OIL-FLT-22', stock: 12, status: 'Warning' },
                  { sku: 'CLT-ASM-09', stock: 2, status: 'Critical' },
                ].map(r => (
                  <div key={r.sku} className="mockup-row">
                    <span>{r.sku}</span>
                    <span>{r.stock} units</span>
                    <span className="mockup-status" style={{ color: r.status === 'Critical' ? '#F87171' : '#FEBC2E' }}>{r.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ---- CRM MOCKUP COMPONENT ----
const CRMMockup = React.memo(function CRMMockup() {
  return (
    <div className="crm-mockup">
      <div className="mockup-wrap">
        <div className="mockup-bar">
          <span className="mockup-dot r" /><span className="mockup-dot y" /><span className="mockup-dot g" />
          <span className="mockup-title">Sales Pipeline Console</span>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--bg3)' }}>
          <div className="crm-pipeline">
            {[
              { title: 'LEADS (12)', count: 3 },
              { title: 'IN PROGRESS (8)', count: 2 },
              { title: 'CLOSING (4)', count: 2 },
            ].map((col, cIdx) => (
              <div key={col.title} className="pipeline-col">
                <div className="pipeline-header">
                  <span>{col.title.split(' ')[0]}</span>
                  <span className="pipeline-count">{col.title.split('(')[1].replace(')', '')}</span>
                </div>
                {Array.from({ length: col.count }).map((_, i) => (
                  <div key={i} className="pipeline-card">
                    <div className="pipeline-card-line" style={{ background: cIdx === 0 ? 'var(--accent)' : cIdx === 1 ? '#FEBC2E' : 'var(--green)' }} />
                    <div className="pipeline-card-content">
                      <div className="pipeline-card-title">Deal #{col.count - i + (cIdx * 5)}</div>
                      <div className="pipeline-card-val">₹{(col.count - i + 2) * 25}K</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});