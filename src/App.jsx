import React from 'react';

import ChatPopup from './chat/ChatPopup';
import {
  tabs,
  projectCards,
  skillGroups,
  chronologyEntries,
  lastTwoYearsFocus,
  recruiterQuickRead,
  workModel,
  atsCvDownloads,
} from './data/cvData';

const contactLoomUrl = 'https://www.loom.com/embed/3d9412b9affd42d4b438aa9bb0d58c21';
const skillsLoomUrl = 'https://www.loom.com/embed/REPLACE-SKILLS-VIDEO-ID';
const portfolioLoomUrl = 'https://www.loom.com/embed/REPLACE-PORTFOLIO-TOP5-VIDEO-ID';

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
  ...atsCvDownloads.map((item) => ({ label: item.label, flag: '📄', fileName: item.fileName })),
  { label: 'Português', flag: '🇧🇷', fileName: 'CV_PT_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'English', flag: '🇺🇸', fileName: 'CV_EN_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'Français', flag: '🇫🇷', fileName: 'CV_FR_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'العربية', flag: '🇸🇦', fileName: 'CV_ARABIC_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: 'हिंदी', flag: '🇮🇳', fileName: 'CV_HINDI_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
  { label: '中文', flag: '🇨🇳', fileName: 'CV_CH_ WesleySilva_GlobalAgileDeliveryManager.pdf' },
];

const mobileHighlights = [
  { value: '6+', label: 'Global markets', insight: 'LATAM, Europe and North America delivery.' },
  { value: '30+', label: 'Tools in production', insight: 'Jira, ServiceNow, Power BI, Databricks and AI stacks.' },
  { value: '15+', label: 'Projects delivered', insight: 'Security, data, modernization and AI programs.' },
  { value: '24/7', label: 'Coverage', insight: 'Follow-the-sun coordination for critical delivery.' },
  { value: '5+', label: 'Squads delivered', insight: 'Scaled squads with clear ownership and outcomes.' },
  { value: '98%', label: 'Availability', insight: 'Reliable execution with strong timezone overlap.' },
  { value: '9x', label: 'Delivery focus', insight: 'Built operating models for speed and governance.' },
  { value: 'AI', label: 'Product edge', insight: 'Applied AI to accelerate product and delivery work.' },
];

function App() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [expandedPanel, setExpandedPanel] = React.useState(null); // null = all collapsed
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [detailPulseKey, setDetailPulseKey] = React.useState(0);
  const [detailExpanded, setDetailExpanded] = React.useState(false);
  const [portfolioOpen, setPortfolioOpen] = React.useState(false);
  const [highlightCycle, setHighlightCycle] = React.useState(0);
  const detailsRef = React.useRef(null);

  const syncHash = React.useCallback((tabId) => {
    if (typeof window === 'undefined') return;
    const nextHash = tabId ? `#${tabId}` : '';
    window.history.replaceState({}, '', `${window.location.pathname}${nextHash}`);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
        return;
      }
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
    const navigationEntry = window.performance?.getEntriesByType('navigation')[0];
    const isReload = navigationEntry?.type === 'reload';

    if (isReload && window.location.hash) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    const initialHash = isReload ? '' : window.location.hash.replace('#', '');
    const initialTab = tabs.findIndex((tab) => tab.id === initialHash);
    if (initialTab >= 0) {
      setActiveTab(initialTab);
      setExpandedPanel(initialTab);
      setPortfolioOpen(tabs[initialTab].id === 'portfolio');
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
        setExpandedPanel(nextTab);
        setPortfolioOpen(tabs[nextTab].id === 'portfolio');
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

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setHighlightCycle((value) => (value + 1) % mobileHighlights.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

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
    const portfolioIndex = tabs.findIndex((tab) => tab.id === 'portfolio');
    setSelectedProject(project.id);
    setPortfolioOpen(true);
    setExpandedPanel(portfolioIndex); // Ensure portfolio panel is expanded
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

  const handleExternalLinkClick = (linkLabel, url, section) => {
    trackEvent('external_link_click', {
      link_label: linkLabel,
      link_url: url,
      section,
    });
  };

  const handleCvDownloadClick = (item) => {
    trackEvent('cv_download_click', {
      cv_language: item.label,
      cv_file: item.fileName,
      section: 'contact',
    });
  };

  const handleLoomIntent = (videoName, section, url) => {
    trackEvent('loom_video_intent', {
      video_name: videoName,
      section,
      video_url: url,
    });
  };

  return (
    <>
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-photo-shell">
          <img
            src={`${import.meta.env.BASE_URL}assets/profile.png?v=3`}
            alt="Wesley Silva"
            className="topbar-photo"
          />
        </div>
        <div className="identity">
          <p className="eyebrow eyebrow-top">Global Agile Delivery Manager · Tech Product Owner · Nearshore from Brazil</p>
          <p className="eyebrow eyebrow-bottom">AI Agents & MCP connections for business context</p>
          <h1>Wesley Silva</h1>
          <p className="subtitle-line">
            Let's connect and deliver with <span className="latam-highlight">LatAm</span>.<span className="aigile-highlight">AIgile</span>
          </p>
        </div>

        <div className="topbar-actions">
          <div className="mobile-metrics" aria-label="Mobile highlights">
            {mobileHighlights.map((item, index) => {
              const rotatedItem = mobileHighlights[(index + highlightCycle) % mobileHighlights.length];

              return (
                <div key={`${item.label}-${index}`} className={`mobile-metric ${index === highlightCycle ? 'active' : ''}`}>
                  <strong>{rotatedItem.value}</strong>
                  <span>{rotatedItem.label}</span>
                  <small>{rotatedItem.insight}</small>
                </div>
              );
            })}
          </div>

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

      <main className={`panel-stage ${expandedPanel === null ? 'initial' : 'has-expanded'}`} aria-label="Portfolio sections">
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
                    <p className="portfolio-kicker">12 programs · security · data · AI · modernization</p>
                    <p><span className="pulse-text">Click any card — context, role, actions and results open above the list.</span></p>
                    <div className="loom-wrapper portfolio-loom-wrapper">
                      <iframe
                        src={portfolioLoomUrl}
                        title="Top 5 projects from last 3-5 years"
                        allowFullScreen
                      />
                    </div>
                    <a
                      className="loom-open-link"
                      href={portfolioLoomUrl.replace('/embed/', '/share/')}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleLoomIntent('Portfolio top 5 projects video', 'portfolio', portfolioLoomUrl)}
                    >
                      Open portfolio top 5 video on Loom
                    </a>
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
              ) : tab.id === 'last-two-years' ? (
                <div className="about-layout">
                  <div className="about-card">
                    <p className="timeline-intro">Cybersecurity and Data Management, where I put the most reps in. See the execution below.</p>
                    <div className="focus-list">
                      {lastTwoYearsFocus.map((focus) => (
                        <article key={focus.title} className="focus-card">
                          <div className="focus-content">
                            <h4>{focus.title}</h4>
                            <p>{focus.summary}</p>
                            <ul className="focus-highlights">
                              {focus.highlights.map((item) => (
                                <li key={`${focus.title}-${item}`}>{item}</li>
                              ))}
                            </ul>
                            <div className="loom-wrapper focus-loom-wrapper">
                              <iframe
                                src={focus.loomUrl}
                                title={`${focus.title} case video`}
                                allowFullScreen
                              />
                            </div>
                            <a
                              className="loom-open-link"
                              href={focus.loomUrl.replace('/embed/', '/share/')}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleLoomIntent(`${focus.title} case video`, 'last-two-years', focus.loomUrl);
                              }}
                            >
                              Open video on Loom
                            </a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : tab.id === 'contact' ? (
                <div className="contact-block">
                  <div className="contact-card">
                    <p className="contact-kicker">Skip the formalities and pick your preferred channel below. I respond within 24h.</p>
                    <div className="contact-links">
                      <a href="tel:+5516997212966" onClick={() => handleExternalLinkClick('Call Direct', 'tel:+5516997212966', 'contact')}>Call Direct</a>
                      <a href="https://wa.me/5516997212966?text=Hi%20Wesley%20%E2%80%94%20I%20found%20your%20portfolio" target="_blank" rel="noreferrer" onClick={() => handleExternalLinkClick('WhatsApp', 'https://wa.me/5516997212966', 'contact')}>WhatsApp</a>
                      <a href="mailto:wesley.zilva@gmail.com?subject=Interview%20Request%20%E2%80%94%20Wesley%20Zilva" onClick={() => handleExternalLinkClick('Email', 'mailto:wesley.zilva@gmail.com', 'contact')}>Email</a>
                      <a href="https://www.linkedin.com/in/wesleyzilva/" target="_blank" rel="noreferrer" onClick={() => handleExternalLinkClick('LinkedIn', 'https://www.linkedin.com/in/wesleyzilva/', 'contact')}>LinkedIn</a>
                      <a href="https://github.com/wesleyzilva" target="_blank" rel="noreferrer" onClick={() => handleExternalLinkClick('GitHub', 'https://github.com/wesleyzilva', 'contact')}>GitHub</a>
                    </div>
                  </div>
                  <div className="loom-wrapper">
                    <iframe
                      src={contactLoomUrl}
                      title="Wesley Silva introduction video"
                      allowFullScreen
                    />
                  </div>
                  <a
                    className="loom-open-link"
                    href={contactLoomUrl.replace('/embed/', '/share/')}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleLoomIntent('Contact intro video', 'contact', contactLoomUrl)}
                  >
                    Open contact video on Loom
                  </a>
                  <div className="cv-card">
                    <p className="contact-kicker">Download CV</p>
                    <div className="cv-downloads" aria-label="Download CV in multiple languages">
                      {cvDownloads.map((item) => (
                        <a key={item.label} href={`${import.meta.env.BASE_URL}${encodeURIComponent(item.fileName)}`} download onClick={() => handleCvDownloadClick(item)}>
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
                    <p className="skills-kicker">10+ years · 8 domains covered</p>
                    <p>Not built on tutorials. Each group reflects tools used in real programs — fintech, data, security, AI and enterprise delivery.</p>
                    <div className="loom-wrapper skills-loom-wrapper">
                      <iframe
                        src={skillsLoomUrl}
                        title="Skills walkthrough video"
                        allowFullScreen
                      />
                    </div>
                    <a
                      className="loom-open-link"
                      href={skillsLoomUrl.replace('/embed/', '/share/')}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleLoomIntent('Skills walkthrough video', 'skills', skillsLoomUrl)}
                    >
                      Open skills video on Loom
                    </a>
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
                    <p>I bridge the gap between technical complexity and stakeholder clarity. Ran distributed squads across 6 countries, shipped security programs with audit-ready compliance, modernized data stacks from Pentaho to Databricks and built AI workflows that cut SLA by double digits.</p>
                    <div className="quick-read-block">
                      <h4>Recruiter quick read</h4>
                      <ul className="quick-read-list">
                        {recruiterQuickRead.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="work-model-block">
                      <h4>Work model</h4>
                      <div className="work-model-chips">
                        {workModel.map((item) => (
                          <span key={item} className="work-chip">{item}</span>
                        ))}
                      </div>
                    </div>
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
    <ChatPopup onTrack={trackEvent} />
    </>
  );
}

export default App;
