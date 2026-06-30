import React from 'react';

const tabs = [
  {
    id: 'about',
    label: '1. About',
    title: 'About / Chronology',
    summary: 'Global Agile Delivery Manager and Tech Product Owner shaping high-impact delivery, operating models, and intelligent product execution.',
    points: ['Global delivery leadership', 'Product strategy and execution', 'Executive communication and alignment'],
  },
  {
    id: 'portfolio',
    label: '2. Portfolio',
    title: 'Portfolio Projects',
    summary: 'A track record of building delivery systems and product experiences that combine speed, governance and measurable impact.',
    points: ['Platform and product initiatives', 'Operational design', 'Growth-oriented experimentation'],
  },
  {
    id: 'skills',
    label: '3. Skills',
    title: 'Skills & Tools',
    summary: 'A modern operating toolkit combining leadership, product thinking, delivery rigor and AI-enabled execution.',
    points: ['Product strategy', 'AI agents and automation', 'Agile delivery', 'Stakeholder orchestration'],
  },
  {
    id: 'contact',
    label: '4. Contact',
    title: 'Case Walkthrough / Loom & Contact',
    summary: 'Open to conversations around product leadership, delivery design, nearshore execution and AI-enabled operations.',
    points: ['Email: wesley.zilva@gmail.com', 'LinkedIn: linkedin.com/in/wesleyzilva'],
  },
];

const projectCards = [
  {
    id: 'security-compliance',
    number: '01',
    category: 'Security & Compliance',
    title: 'Vulnerability Reduction Across 110 Java/Angular Applications',
    location: ['India', 'Costa Rica'],
    duration: '9 months',
    status: 'Measured',
    summary: 'Led a DevSecOps remediation stream that reduced vulnerabilities and built a repeatable compliance baseline for a large application estate.',
    context: 'A third-party delivery squad needed a fixed-deadline security remediation program without losing business continuity.',
    role: 'IT Manager and technical lead for the DevSecOps delivery stream.',
    actions: ['Structured backlog by risk, severity and dependency.', 'Implemented continuous flow with Veracode, Rapid7 and CI/CD.', 'Led agile rituals and executive reporting without a dedicated Scrum Master.'],
    results: ['1200 → 300 total vulnerabilities in 9 months.', '47 → 3 critical/high findings in the main cycle.', 'Established a continuous compliance baseline with zero internal critical findings.'],
    references: ['Veracode', 'Rapid7', 'CI/CD delivery governance'],
    tags: ['Java', 'Angular', 'DevSecOps', 'Veracode'],
  },
  {
    id: 'data-engineering',
    number: '02',
    category: 'Data Engineering',
    title: 'Data Management Implementation in M&A Context',
    location: ['Remote'],
    duration: '9 months',
    status: 'Measured',
    summary: 'Designed the operating model for data management and monitoring after a merger, improving reliability and governance.',
    context: 'The newly integrated environment needed clearer ownership across analytics, engineering and ETL operations.',
    role: 'Led team structure and data-driven operating model design.',
    actions: ['Defined responsibilities by value stream.', 'Implemented monitoring with Datadog and Teams/Power Automate alerts.', 'Created executive indicators for reliability and delivery health.'],
    results: ['Scaled operations to 80M+ transactions per day.', 'Managed R$500M+ monthly reconciliation under structured monitoring.', 'Raised predictability across the full data ecosystem.'],
    references: ['Datadog', 'Power Automate', 'M&A data governance'],
    tags: ['Datadog', 'Power Automate', 'Analytics', 'ETL'],
  },
  {
    id: 'data-modernization',
    number: '03',
    category: 'Data Modernization',
    title: 'Pentaho → Databricks and Tableau → Power BI Migration',
    location: ['Remote'],
    duration: '9 months',
    status: 'Measured',
    summary: 'Delivered a modernization roadmap that reduced operational risk while moving reporting and analytics to a more sustainable stack.',
    context: 'High turnover required knowledge transfer and a platform transition with minimum service disruption.',
    role: 'Managed technology transition and operational continuity.',
    actions: ['Led migration by data domain and business criticality.', 'Standardized monitoring and operational triggers.', 'Automated communications to reduce turnaround times.'],
    results: ['40% reduction in ETL processing time.', 'Higher stability for a predominantly mid-level team.', 'Created a modern analytics baseline for future evolution.'],
    references: ['Databricks', 'Power BI', 'Pentaho'],
    tags: ['Databricks', 'Power BI', 'Pentaho', 'Tableau'],
  },
  {
    id: 'agile-transformation',
    number: '04',
    category: 'Agile Transformation',
    title: 'B2B Digital Transformation with Agile Metrics',
    location: ['London'],
    duration: '3 years',
    status: 'Measured',
    summary: 'Helped scale delivery rigor across multiple squads and improve executive visibility through agile metrics.',
    context: 'The organization needed stronger squad performance and more transparent governance for leadership.',
    role: 'Agile lead across multiple teams and governance facilitator.',
    actions: ['Created a gamified framework for agile maturity evolution.', 'Implemented dashboards connected to Jira and ServiceNow.', 'Introduced Scrum-of-Scrums and SAFe practices.'],
    results: ['35% sprint velocity increase.', '50% reduction in cross-squad blockers.', 'Higher delivery predictability for executive leadership.'],
    references: ['Serasa Experian B2B', 'Jira', 'ServiceNow'],
    tags: ['Scrum', 'SAFe', 'Jira', 'Leadership'],
  },
  {
    id: 'applied-ai',
    number: '05',
    category: 'Applied AI',
    title: 'AI for LegalTech — Smart Search & Triage',
    location: ['Remote'],
    duration: '1 year',
    status: 'Measured',
    summary: 'Designed and coordinated an AI-powered search and triage workflow that accelerated legal operations with better context.',
    context: 'The legal area needed to reduce effort in level 1 and level 2 analyses without sacrificing precision.',
    role: 'Technical product lead and implementation coordinator.',
    actions: ['Designed the AI and smart-search solution over legal data.', 'Integrated the service flow using a low-code stack and Elasticsearch.', 'Aligned backlog priorities to SLA goals.'],
    results: ['12% reduction in legal operation SLA.', 'Faster triage and response for recurring requests.', 'Improved analysis quality with AI-consolidated context.'],
    references: ['Serasa Experian B2B', 'Elasticsearch', 'Low-code workflows'],
    tags: ['AI', 'Elasticsearch', 'Low-code', 'Product thinking'],
  },
  {
    id: 'operations-product',
    number: '06',
    category: 'Operations & Product',
    title: 'Customer Care with Synchronized Backlog',
    location: ['Remote'],
    duration: '2 years',
    status: 'Estimated',
    summary: 'Improved product and support coordination through a synchronized backlog and more visible operating routines.',
    context: 'Customer care teams needed a tighter connection between operations, prioritization and support readiness.',
    role: 'Led backlog governance and cross-functional coordination.',
    actions: ['Aligned priorities around customer impact and team capacity.', 'Connected operational indicators to backlog health.', 'Improved handoffs across product, support and engineering.'],
    results: ['Higher predictability across the care stream.', 'Faster issue prioritization and fewer silent blockers.', 'Better shared understanding between business and product teams.'],
    references: ['ServiceNow', 'Jira', 'Backlog management'],
    tags: ['ServiceNow', 'Jira', 'Backlog management', 'Operations'],
  },
  {
    id: 'customer-experience',
    number: '07',
    category: 'Customer Experience',
    title: 'Digital Journey Evolution Driven by Analytics',
    location: ['USA', 'India'],
    duration: '2 years',
    status: 'Measured',
    summary: 'Orchestrated customer experience improvements using analytics and operational insight to reduce friction in key journeys.',
    context: 'The digital journey needed better resilience and smarter prioritization across incident and adoption signals.',
    role: 'Indirectly led a partner team with data-driven prioritization.',
    actions: ['Prioritized improvements from Adobe Analytics and incidents.', 'Supported architecture and integration reviews.', 'Connected operational indicators to experience goals.'],
    results: ['99% availability in the main journey.', 'Reduced repetitive incidents in critical flows.', 'Improved alignment between technology and business expectations.'],
    references: ['Adobe Analytics', 'Salesforce', '.NET integration'],
    tags: ['Adobe Analytics', 'Salesforce', '.NET', 'Journey design'],
  },
  {
    id: 'application-modernization',
    number: '08',
    category: 'Application Modernization',
    title: '.NET Legacy Migration to Angular/Java Architecture',
    location: ['Remote'],
    duration: '3 years',
    status: 'Measured',
    summary: 'Coordinated modernization waves for a complex legacy portfolio, reducing cost and increasing maintainability.',
    context: 'A portfolio of around 50 applications carried high maintenance debt and limited scalability.',
    role: 'Technical coordination and backlog prioritization without a dedicated product owner.',
    actions: ['Mapped criticality by business unit and dependency chain.', 'Planned migration waves with safe decommission criteria.', 'Oversaw execution focused on business continuity.'],
    results: ['20 critical applications migrated or decommissioned.', 'Lowered technical debt in sales and customer service domains.', 'Created a more modern architectural baseline for continuous evolution.'],
    references: ['.NET', 'Angular', 'Java architecture'],
    tags: ['.NET', 'Angular', 'Java', 'Migration'],
  },
  {
    id: 'operational-excellence',
    number: '09',
    category: 'Operational Excellence',
    title: 'Empower Program with Six Sigma Yellow Belt',
    location: ['Remote'],
    duration: '1 year',
    status: 'Qualitative',
    summary: 'Applied Lean Six Sigma practices to improve support flows, reduce incident churn and strengthen team autonomy.',
    context: 'The social and operational program required more predictable and efficient IT processes.',
    role: 'Technical leader applying Lean Six Sigma methods.',
    actions: ['Analyzed incident, change and problem flows in ServiceNow.', 'Implemented continuous improvement cycles based on data.', 'Created knowledge assets to speed up L1 resolution.'],
    results: ['Reduced daily L1 incident volume.', 'Improved resolution time through knowledge standardization.', 'Increased first-level operational autonomy.'],
    references: ['Lean Six Sigma', 'ServiceNow', 'Continuous improvement'],
    tags: ['Lean Six Sigma', 'DMAIC', 'ServiceNow', 'Ops'],
  },
  {
    id: 'global-leadership',
    number: '10',
    category: 'Global Leadership',
    title: 'International Mentoring for Agile Culture',
    location: ['Africa', 'Colombia'],
    duration: '1 year',
    status: 'Qualitative',
    summary: 'Built cross-cultural leadership maturity by mentoring professionals across distributed teams and geographies.',
    context: 'Leadership growth was needed in internationally distributed environments with high autonomy expectations.',
    role: 'International mentee and later mentor for peers in multiple countries.',
    actions: ['Learned agile practices in the European context.', 'Adapted approaches for LATAM and nearshore teams.', 'Mentored professionals in Brazil, India and South Africa.'],
    results: ['Mentored three professionals across three countries.', 'Raised intercultural leadership maturity.', 'Strengthened the foundation for high-autonomy nearshore management.'],
    references: ['Leadership mentoring', 'Cross-cultural delivery'],
    tags: ['Mentoring', 'Leadership', 'Communication'],
  },
  {
    id: 'critical-support',
    number: '11',
    category: 'Critical Support',
    title: 'Firefighters for Legacy CRM/Billing (Telco)',
    location: ['India', 'Brazil'],
    duration: '3 years',
    status: 'Measured',
    summary: 'Led a 24x7 support squad that stabilized legacy systems and reduced incident volume in a high-pressure telco environment.',
    context: 'The legacy environment carried high incident volume and required strong handover discipline across global shifts.',
    role: 'Led an international support squad for stabilization and operations.',
    actions: ['Organized handovers across India and Brazil.', 'Automated recurring data-fix routines.', 'Defined preventive rituals for recurring incidents.'],
    results: ['300 → 100 daily incidents in the main operation.', '99.9% uptime in critical billing systems.', 'Lower operational impact during peak windows.'],
    references: ['Amdocs', 'Telco operations', 'Legacy CRM'],
    tags: ['Unix/Linux', 'Shell Script', 'CRM', 'Billing'],
  },
  {
    id: 'knowledge-transfer',
    number: '12',
    category: 'Knowledge Transfer',
    title: 'Technical Internalization in São Carlos Operation',
    location: ['São Carlos, Brazil'],
    duration: '2 years',
    status: 'Qualitative',
    summary: 'Structured the transfer of critical technical knowledge into the local operation and reduced dependence on external consultancies.',
    context: 'Critical technical know-how was concentrated in consultancies and had to be internalized for continuity.',
    role: 'Led knowledge transfer between business and engineering.',
    actions: ['Created functional and technical documentation for key applications.', 'Connected business analysts to engineering to reduce execution noise.', 'Designed onboarding for internal support teams.'],
    results: ['Critical know-how internalized into the local operation.', 'Raised technical autonomy for evolution and support.', 'Enabled a safer transition to the organization’s agile model.'],
    references: ['Documentation', 'Knowledge transfer', 'Agile enablement'],
    tags: ['Documentation', 'Onboarding', 'Knowledge transfer', 'Agile'],
  },
];

const skillGroups = [
  {
    title: 'Delivery & Collaboration',
    description: 'Enterprise platforms, cloud, observability and delivery tools used in production across fintech, payments and data.',
    items: ['Jira / Jira Service Mgmt', 'Monday.com', 'Azure DevOps / Boards', 'Slack / MS Teams', 'Confluence / Notion', 'GitHub / GitHub Actions', 'Figma'],
  },
  {
    title: 'Agile & Frameworks',
    description: 'Delivery systems built for speed, clarity and resilience across squads and programs.',
    items: ['Scrum', 'SAFe', 'Kanban', 'OKRs / KPIs', 'DORA Metrics'],
  },
  {
    title: 'ITSM & Incident Management',
    description: 'Operational discipline for enterprise environments and high-velocity support teams.',
    items: ['ServiceNow', 'Zendesk', 'Freshdesk', 'Datadog', 'Dynatrace'],
  },
  {
    title: 'Reporting & Analytics',
    description: 'Decision support and stakeholder visibility through analytics, reporting and product insight.',
    items: ['Power BI', 'Tableau', 'Google Analytics', 'Microsoft Clarity', 'Amplitude', 'Adobe Analytics', 'Databricks'],
  },
  {
    title: 'CRM & Stakeholder Alignment',
    description: 'Cross-functional alignment for customer, partner and revenue-focused delivery motions.',
    items: ['Salesforce', 'HubSpot', 'Dynamics 365'],
  },
  {
    title: 'Cloud & Infrastructure (PM Level)',
    description: 'Platform governance and delivery readiness on enterprise-grade cloud environments.',
    items: ['AWS', 'Azure', 'GCP', 'Docker / Kubernetes'],
  },
  {
    title: 'Security, Compliance & Governance',
    description: 'Security and regulatory delivery practices for regulated and high-risk environments.',
    items: ['Veracode', 'Checkmarx', 'PCI-DSS / BACEN', 'FEBRABAN'],
  },
  {
    title: 'Finance & ERP',
    description: 'Delivery support for financial operations, ERP programs and reconciliation-heavy solutions.',
    items: ['SAP', 'Oracle ERP', 'TOTVS Protheus', 'Billing Systems', 'Pentaho ETL'],
  },
];

const chronologyEntries = [
  {
    year: '2010',
    title: 'International Consultant (France Contractor)',
    company: 'Bernardin Consultants · France',
    text: 'Bridge between French/Swiss high-tech manufacturers and the Brazilian market. Sectors: security and defense, precision industry, aviation and military.',
  },
  {
    year: '2011 – 2013',
    title: 'Product Owner',
    company: 'XBot · Brazil',
    text: 'Led 12 sales and partner teams across Brazil, focusing on technological education, robotics, energy systems, security and simulation solutions.',
  },
  {
    year: '2013 – 2016',
    title: 'Technical Support Specialist',
    company: 'Amdocs Studios · USA / India',
    text: 'Unix/OracleDB DBA. Shell Script and PL/SQL automation, middleware administration and incident management across an India–Brazil–USA shift model.',
  },
  {
    year: '2016 – 2021',
    title: 'Full Stack Developer – Billing, ITIL & Observability',
    company: 'Serasa Experian · USA / India / Costa Rica',
    text: 'Built full-stack solutions on core Billing and CRM systems, led observability efforts with Datadog and Dynatrace and improved reliability at scale.',
  },
  {
    year: '2021 – 2024',
    title: 'Agile Delivery Manager (HR · Legal · CS · Sales · Billing)',
    company: 'Serasa Experian · UK / Global',
    text: 'Led five squads and seven engineers, aligned roadmaps with OKRs and drove stakeholder delivery across London and the USA.',
  },
  {
    year: '2024 – present',
    title: 'IT Coordinator | Fintech M&A | Payments & Data',
    company: 'Serasa Experian · Brazil',
    text: 'Led data squads on modernization and ETL programs with strong governance across Databricks, Pentaho, DevSecOps and compliance requirements.',
  },
  {
    year: 'Present',
    title: 'LATAM Agile Project Delivery | AI Agents',
    company: 'Contractor / Part Time · Global',
    text: 'Running distributed teams with an AI-powered squad framework and supporting global stakeholders from LATAM with async-first delivery.',
  },
];

const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined') return;

  const payload = {
    page_title: document.title,
    page_location: window.location.href,
    ...params,
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  if (typeof window.clarity === 'function') {
    window.clarity('event', eventName);
  }
};

const cvDownloads = [
  { label: 'Português', flag: '🇧🇷', fileName: 'CV_PT_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'English', flag: '🇺🇸', fileName: 'CV_EN_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'Français', flag: '🇫🇷', fileName: 'CV_FR_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'العربية', flag: '🇸🇦', fileName: 'CV_ARABIC_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'हिंदी', flag: '🇮🇳', fileName: 'CV_HINDI_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: '中文', flag: '🇨🇳', fileName: 'CV_CH_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
];

function App() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [expandedPanel, setExpandedPanel] = React.useState(null); // null = all collapsed
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [detailPulseKey, setDetailPulseKey] = React.useState(0);
  const [detailExpanded, setDetailExpanded] = React.useState(false);
  const [portfolioOpen, setPortfolioOpen] = React.useState(false);
  const detailsRef = React.useRef(null);

  const syncHash = React.useCallback((tabId) => {
    if (typeof window === 'undefined') return;
    const nextHash = tabId ? `#${tabId}` : '';
    window.history.replaceState({}, '', `${window.location.pathname}${nextHash}`);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveTab((current) => (current + 1) % tabs.length);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveTab((current) => (current - 1 + tabs.length) % tabs.length);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        setActiveTab(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        setActiveTab(tabs.length - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    const initialHash = window.location.hash.replace('#', '');
    const initialTab = tabs.findIndex((tab) => tab.id === initialHash);
    if (initialTab >= 0) {
      setActiveTab(initialTab);
      setExpandedPanel(initialTab); // Also expand if hash is present
    }

    trackEvent('portfolio_page_view', {
      page_path: `${window.location.pathname}${window.location.hash || '#about'}`,
    });
  }, [syncHash]);

  React.useEffect(() => {
    const onHashChange = () => {
      const hashValue = window.location.hash.replace('#', '');
      const nextTab = tabs.findIndex((tab) => tab.id === hashValue);
      if (nextTab >= 0) {
        setActiveTab(nextTab);
        setExpandedPanel(nextTab); // Expand panel when hash changes
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  React.useEffect(() => {
    const project = projectCards.find((entry) => entry.id === selectedProject);
    if (project) {
      trackEvent('project_detail_view', {
        project_id: project.id,
        project_title: project.title,
      });
    }
  }, [selectedProject]);

  const expanded = (index) => {
    if (expandedPanel === null) return false; // All collapsed by default
    
    if (tabs[index]?.id === 'portfolio') {
      return portfolioOpen && expandedPanel === index;
    }

    return expandedPanel === index;
  };
  const selectedProjectData = projectCards.find((project) => project.id === selectedProject) ?? null;

  const handleTabChange = (index) => {
    const tab = tabs[index];
    setActiveTab(index);
    setExpandedPanel(index); // Expand clicked panel
    if (tab.id === 'portfolio') {
      setPortfolioOpen(true);
    }
    syncHash(tab.id);
    trackEvent('section_selected', {
      section_id: tab.id,
      section_name: tab.label,
    });
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project.id);
    setPortfolioOpen(true);
    setExpandedPanel(1); // Ensure portfolio panel (index 1) is expanded
    setDetailExpanded(true);
    setDetailPulseKey((value) => value + 1);
    window.setTimeout(() => {
      if (!detailsRef.current) return;

      const rect = detailsRef.current.getBoundingClientRect();
      const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

      if (!isVisible) {
        detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);

    trackEvent('project_card_click', {
      project_id: project.id,
      project_title: project.title,
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-photo-shell">
          <img
            src={`${import.meta.env.BASE_URL}assets/profile.png`}
            alt="Wesley Silva"
            className="topbar-photo"
          />
        </div>
        <div className="identity">
          <p className="eyebrow">Global Agile Delivery Manager · Tech Product Owner · Nearshore · AI Agents | Know your next Project Manager in 4 steps below</p>
          <h1>Wesley Silva</h1>
          <p className="subtitle">Let’s connect and deliver your project faster as LATAM.AIgile</p>
        </div>

        <div className="topbar-actions">
          <div className="availability-block" aria-label="Availability status">
            <div className="availability">
              <span className="dot" aria-hidden="true" />
              Available for nearshore / offshore projects
            </div>
            <div className="availability availability-secondary">
              <span className="dot dot-secondary" aria-hidden="true" />
              Timezone overlap compatible with Brazil (±4h)
            </div>
          </div>
        </div>
      </header>

      <main className="panel-stage" aria-label="Portfolio sections">
        {tabs.map((tab, index) => (
          <section
            key={tab.id}
            className={`panel ${expanded(index) ? 'expanded' : 'collapsed'} ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabChange(index)}
            role="button"
            tabIndex={0}
            aria-expanded={expanded(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleTabChange(index);
              }
            }}
          >
            <div className="panel-label">{tab.label}</div>

            <div className="panel-content">
              <div className="panel-topline">
                <span className="panel-index">0{index + 1}</span>
                <span className="panel-kicker">{tab.label}</span>
              </div>

              <h2>{tab.title}</h2>
              <p>{tab.summary}</p>

              {tab.id === 'portfolio' ? (
                <div className="portfolio-layout">
                  <div className="portfolio-header">
                    <p className="portfolio-kicker">12 projects · real results</p>
                    <p>Click any card to see the case study details right above the list, then continue browsing.</p>
                  </div>

                  {selectedProjectData && detailExpanded ? (
                    <article key={detailPulseKey} ref={detailsRef} className={`project-detail ${detailExpanded ? 'expanded' : 'collapsed'}`} aria-live="polite">
                      <div className="detail-header">
                        <p className="detail-kicker">Selected case study</p>
                        <h3>{selectedProjectData.title}</h3>
                        <p className="detail-summary">{selectedProjectData.summary}</p>
                      </div>

                      <div className="detail-body">
                        <div className="detail-grid">
                          <section className="detail-section">
                            <h4>Context</h4>
                            <p>{selectedProjectData.context}</p>
                          </section>
                          <section className="detail-section">
                            <h4>Role</h4>
                            <p>{selectedProjectData.role}</p>
                          </section>
                          <section className="detail-section">
                            <h4>Actions</h4>
                            <ul>
                              {selectedProjectData.actions.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                          <section className="detail-section">
                            <h4>Results</h4>
                            <ul>
                              {selectedProjectData.results.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </section>
                        </div>

                        <div className="detail-footer">
                          <h4>References</h4>
                          <ul>
                            {selectedProjectData.references.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  ) : null}

                  <div className="portfolio-grid" role="list">
                    {projectCards.map((project) => {
                      const isSelected = selectedProject === project.id;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          className={`project-card ${isSelected ? 'selected' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleSelectProject(project);
                          }}
                          aria-pressed={isSelected}
                        >
                          <div className="project-meta">
                            <span className="project-number">{project.number}</span>
                            <span className="project-category">{project.category}</span>
                          </div>
                          <h3>{project.title}</h3>
                          <p className="project-summary">{project.summary}</p>
                          <div className="project-stats">
                            <span className="project-chip project-chip-duration">{project.duration}</span>
                            <span className="project-chip project-chip-status">{project.status}</span>
                            <span className="project-chip project-chip-location">{project.location.join(' · ')}</span>
                          </div>
                          <div className="project-tags">
                            {project.tags.map((tag) => (
                              <span key={tag} className="project-tag">{tag}</span>
                            ))}
                          </div>
                          <span className="project-link">Open details →</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              ) : tab.id === 'contact' ? (
                <div className="contact-block">
                  <div className="contact-card">
                    <p className="contact-kicker">Available for nearshore / offshore projects. I respond within 24h.</p>
                    <div className="contact-links">
                      <a href="tel:+5516997212966">Call Direct</a>
                      <a href="https://wa.me/5516997212966?text=Hi%20Wesley%20%E2%80%94%20I%20found%20your%20portfolio" target="_blank" rel="noreferrer">WhatsApp</a>
                      <a href="mailto:wesley.zilva@gmail.com?subject=Interview%20Request%20%E2%80%94%20Wesley%20Zilva">Email</a>
                      <a href="https://www.linkedin.com/in/wesleyzilva/" target="_blank" rel="noreferrer">LinkedIn</a>
                      <a href="https://github.com/wesleyzilva" target="_blank" rel="noreferrer">GitHub</a>
                    </div>
                  </div>
                  <div className="loom-wrapper">
                    <iframe
                      src="https://www.loom.com/embed/3d9412b9affd42d4b438aa9bb0d58c21"
                      title="Wesley Zilva introduction video"
                      allowFullScreen
                    />
                  </div>
                  <div className="cv-card">
                    <p className="contact-kicker">Download CV</p>
                    <div className="cv-downloads" aria-label="Download CV in multiple languages">
                      {cvDownloads.map((item) => (
                        <a key={item.label} href={`${import.meta.env.BASE_URL}${encodeURIComponent(item.fileName)}`} download>
                          <span className="flag" aria-hidden="true">{item.flag}</span>
                          <span>{item.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : tab.id === 'skills' ? (
                <div className="skills-shell">
                  <div className="skills-hero">
                    <p className="skills-kicker">10 years developing skills</p>
                    <p>A battle-tested toolbox combining delivery, operations, analytics and AI-enabled execution.</p>
                  </div>
                  <div className="skill-groups">
                    {skillGroups.map((group) => (
                      <section key={group.title} className="skill-group">
                        <h3>{group.title}</h3>
                        <p>{group.description}</p>
                        <ul>
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="about-layout">
                  <div className="about-card">
                    <h3>About</h3>
                    <p>Full Stack specialist PM empowering remote teams to ship faster through AI agents and deep technical leadership, leveraging the best professionals from around the world and delivering your project.</p>
                  </div>
                  <div className="timeline-card">
                    <h3>Chronology</h3>
                    <p className="timeline-intro">PM + Tech · Async-First · Distributed Teams · Zero Hand-Holding</p>
                    <div className="timeline-list">
                      {chronologyEntries.map((entry) => (
                        <article key={`${entry.year}-${entry.title}`} className="timeline-entry">
                          <div className={`timeline-year${entry.year === 'Present' ? ' timeline-year-present' : ''}`}>{entry.year}</div>
                          <div className="timeline-content">
                            <h4>{entry.title}</h4>
                            <p className="timeline-company">{entry.company}</p>
                            <p>{entry.text}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer-strip">
        <span>Current section</span>
        <strong>{activeTab + 1} / {tabs.length}</strong>
      </footer>
    </div>
  );
}

export default App;
