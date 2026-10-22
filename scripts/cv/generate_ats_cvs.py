"""Generate ATS-friendly English CVs (PDF) for Wesley Silva.

ATS rules followed on purpose:
- single column, no tables, text boxes, images, icons or graphics
- standard section names and a standard font (Helvetica, WinAnsi characters only)
- real text layer in reading order, real "•" bullets, plain "Mon YYYY - Mon YYYY" dates
- plain URLs written out as visible text
- 2 pages maximum, with document metadata filled in

Usage:
    pip install -r scripts/cv/requirements.txt
    python scripts/cv/generate_ats_cvs.py            # writes PDFs into public/
    python scripts/cv/generate_ats_cvs.py --check    # also validates the text layer
"""

import argparse
import re
import sys
from pathlib import Path

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import black, HexColor
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer

OUTPUT_DIR = Path(__file__).resolve().parents[2] / "public"

CONTACT = {
    "name": "Wesley Gomes da Silva",
    "location": "São Carlos, SP or Pato Branco, PR, Brazil | Remote",
    "phone": "+55 16 99721-2966",
    "email": "wesley.zilva@gmail.com",
    "linkedin": "https://www.linkedin.com/in/wesleyzilva/",
    "github": "https://github.com/wesleyzilva",
    "portfolio": "https://wesleyzilva.github.io/portfolio",
}

EDUCATION = [
    {
        "school": "Federal University of São Carlos (UFSCar)",
        "detail": "Postgraduate (Specialization) in Software Engineering, Web Development, Java and Databases",
        "dates": "2018 - 2019",
    },
    {
        "school": "Centro Universitário Central Paulista (UNICEP)",
        "detail": "Bachelor's Degree in Electrical Engineering",
        "dates": "2005 - 2011",
    },
]

LANGUAGES = "English (Fluent), Spanish (Elementary), Chinese (Elementary), Portuguese (Native)"

CVS = [
    {
        "file": "CV_ATS_AgenticTPM_WesleySilva.pdf",
        "title": "Wesley Gomes da Silva - Agentic Technical Program Manager - CV",
        "keywords": "Agentic TPM, Technical Program Manager, AI agents, MCP, GitHub Copilot, DevSecOps, Agile, Databricks",
        "headline": "Agentic Technical Program Manager | AI-Enabled Global Delivery",
        "summary": (
            "Technical Program Manager with 10+ years delivering mission-critical systems in Fintech, Big Data and Cloud. "
            "Leads globally distributed squads (Brazil, India, USA, London, South Africa) and builds AI-enabled delivery models: "
            "GitHub Copilot and AI workspaces that accelerated the SDLC by 45%, an AI-powered squad framework with AI agents and MCP "
            "connections that bring business context into delivery work, and an AI smart-search and triage workflow that cut legal "
            "operation SLA by 12%. Combines a hands-on Java, Angular and .NET background with DevSecOps governance, OKR-driven roadmaps "
            "and executive communication. Open to nearshore, offshore and international roles."
        ),
        "highlights": [
            "45% faster SDLC through GitHub Copilot and AI workspaces.",
            "93% reduction in critical vulnerabilities with DevSecOps (PCI-DSS and LGPD context).",
            "80M+ transactions per day and R$500M+ monthly reconciliation under structured monitoring and governance.",
            "35% sprint velocity increase and 50% fewer cross-squad blockers across multiple international squads.",
        ],
        "competencies": [
            ("Program Management", "Technical Program Management, Roadmap and OKR Alignment, Cross-Functional Delivery, Risk and Dependency Management, Stakeholder and Executive Communication, Vendor and Third-Party Squad Management, Distributed and Async-First Teams"),
            ("AI and Agentic Delivery", "AI Agents, Agentic Workflows, MCP (Model Context Protocol) Connections, Generative AI, GitHub Copilot, AI-Assisted SDLC, Smart Search and Triage, Elasticsearch, Low-Code Workflows"),
            ("Agile and Delivery Tools", "Scrum, SAFe, Kanban, Scrum-of-Scrums, OKRs, KPIs, DORA Metrics, Jira, Azure DevOps, Monday.com, Confluence, Notion, Figma"),
            ("Engineering and Data", "Java, Spring Boot, Angular, .NET, Databricks, Spark, Pentaho ETL, Power BI, Tableau, Datadog, Dynatrace, Shell Script, PL/SQL, Oracle"),
            ("Cloud, Security and Compliance", "AWS, Azure, GCP, Docker, Kubernetes (PM level), CI/CD, GitHub Actions, DevSecOps, Veracode, Checkmarx, Rapid7, PCI-DSS, BACEN, LGPD, FEBRABAN"),
        ],
        "experience": [
            {
                "title": "LATAM Agile Project Delivery | AI Agents",
                "company": "Independent Contractor (Part-Time)",
                "place": "Global, Remote",
                "dates": "Present",
                "bullets": [
                    "Run distributed teams with an AI-powered squad framework, supporting global stakeholders from LATAM with async-first delivery.",
                    "Use AI agents and MCP connections to bring business context into delivery work and speed up decisions.",
                ],
            },
            {
                "title": "IT Coordinator (Fintech M&A, Payments and Data)",
                "company": "Serasa Experian",
                "place": "Brazil",
                "dates": "Nov 2024 - Present",
                "bullets": [
                    "Lead data squads in the modernization of the legacy analytics architecture to Databricks/Spark (via Pentaho and APIs), cutting ETL processing time by 40% and reducing time-to-market for data products.",
                    "Redesigned ownership after the acquisition into three accountable streams (data engineering, processing and analysis) with clear SLAs and an MLOps-ready foundation, sustaining 80M+ transactions per day.",
                    "Run dual-track cybersecurity execution (SRE infrastructure migration and developer framework hardening) with automated security gates, risk dashboards and EPSS-scored prioritization.",
                    "Led DevSecOps remediation across 110 Java/Angular applications with Veracode, Rapid7 and CI/CD, reducing total vulnerabilities from 1,200 to 300 in 9 months and critical/high findings from 47 to 3.",
                    "Support the integration into a payments gateway platform for utilities, covering regulated Pix, Nubank and other Bacen-compliant payment flows.",
                ],
            },
            {
                "title": "Agile Delivery Manager (HR, Legal, CS, Sales, Billing)",
                "company": "Serasa Experian",
                "place": "London, UK",
                "dates": "Apr 2021 - Nov 2024",
                "bullets": [
                    "Led five cross-functional squads and seven engineers across London and the USA, aligning roadmaps with corporate OKRs and controlling Agile KPIs (velocity and throughput).",
                    "Increased sprint velocity by 35% and reduced cross-squad blockers by 50% with Scrum-of-Scrums, SAFe practices, a gamified agile-maturity framework and Jira/ServiceNow dashboards.",
                    "Designed and coordinated an AI smart-search and triage workflow for LegalTech (Elasticsearch and low-code), reducing legal operation SLA by 12%.",
                    "Optimized the design-to-development handoff with Figma, removing communication bottlenecks and improving predictability.",
                ],
            },
            {
                "title": "Full Stack Developer (Billing, ITIL, Observability)",
                "company": "Serasa Experian",
                "place": "Brazil",
                "dates": "Mar 2016 - Apr 2021",
                "bullets": [
                    "Built critical transactional billing platforms with Java, Spring Boot and Angular, adding proactive monitoring with Dynatrace and Datadog to reduce incident resolution time (MTTR).",
                    "Integrated modern cloud architectures with legacy ecosystems based on .NET, Salesforce and OutSystems, ensuring transactional integrity and high availability.",
                    "Coordinated modernization waves from a legacy .NET portfolio to Angular/Java, migrating or decommissioning 20 critical applications.",
                ],
            },
            {
                "title": "Support Specialist",
                "company": "Amdocs",
                "place": "Brazil",
                "dates": "Jul 2013 - Mar 2016",
                "bullets": [
                    "Built automation and batch routines in Unix Shell Script and Oracle PL/SQL for telecom, optimizing large-scale database performance.",
                    "Resolved critical L3 production incidents in global environments under strict SLAs, reducing daily incidents from 300 to 100 with 99.9% uptime in critical billing systems.",
                ],
            },
            {
                "title": "Product Owner",
                "company": "XBot",
                "place": "Brazil",
                "dates": "Nov 2010 - Jul 2013",
                "bullets": [
                    "Led the lifecycle and requirements of robotics and EdTech products, generating R$4 million in revenue across 12 distributed sales and partner teams.",
                ],
            },
            {
                "title": "International Consultant",
                "company": "Bernardin Consultants",
                "place": "France / Brazil",
                "dates": "Jan 2010 - Dec 2010",
                "bullets": [
                    "Coordinated market prospecting and financial feasibility for high-tech industries (defense and military aviation), enabling deals between European investors and the Brazilian market.",
                ],
            },
        ],
        "projects": [
            "Portfolio with AI chat assistant (#askToTPM_agentic): prototype that answers recruiter questions about this CV using CV-grounded retrieval, built with React and Vite and deployed on GitHub Pages (wesleyzilva.github.io/portfolio).",
        ],
    },
    {
        "file": "CV_ATS_ITCoordinator_WesleySilva.pdf",
        "title": "Wesley Gomes da Silva - IT Coordinator - CV",
        "keywords": "IT Coordinator, IT Manager, ITSM, ITIL, ServiceNow, DevSecOps, Databricks, Agile, Incident Management",
        "headline": "IT Coordinator | Delivery, Data and DevSecOps | Fintech, Payments and Telecom",
        "summary": (
            "IT Coordinator at Serasa Experian with 10+ years in mission-critical systems across Fintech, Big Data, Cloud and Telecom. "
            "Coordinates data, payments and security squads end to end: planning, squad and vendor management, incident, change and "
            "problem governance, compliance and executive reporting. Combines a hands-on Java, Angular, .NET and Oracle background with "
            "ITSM discipline (ServiceNow, ITIL), DevSecOps and Agile delivery. Results include vulnerabilities reduced from 1,200 to 300, "
            "40% faster ETL processing and 99.9% uptime in critical billing systems. Based in Brazil and ready for remote work."
        ),
        "highlights": [
            "1,200 to 300 total vulnerabilities in 9 months across 110 Java/Angular applications; 47 to 3 critical/high findings.",
            "80M+ transactions per day and R$500M+ monthly reconciliation under structured monitoring.",
            "40% reduction in ETL processing time after the Pentaho to Databricks and Tableau to Power BI migration.",
            "99.9% uptime in critical billing systems; daily incidents reduced from 300 to 100.",
        ],
        "competencies": [
            ("IT Coordination and Operations", "IT Team Coordination, Squad and Vendor Management, Incident, Change and Problem Management, ITSM, ITIL, ServiceNow, Zendesk, Freshdesk, SLA and KPI Management, Knowledge Management, Lean Six Sigma (Yellow Belt), Continuous Improvement, Executive Reporting"),
            ("Data and Platforms", "Databricks, Spark, Pentaho ETL, Power BI, Tableau, Datadog, Dynatrace, Billing Systems, SAP, Oracle ERP, TOTVS Protheus (delivery support)"),
            ("Security and Compliance", "DevSecOps, Veracode, Checkmarx, Rapid7, PCI-DSS, BACEN, LGPD, FEBRABAN"),
            ("Engineering and Cloud", "Java, Spring Boot, Angular, .NET, Salesforce, OutSystems, Unix/Linux, Shell Script, PL/SQL, Oracle, CI/CD, GitHub Actions, Docker, Kubernetes, AWS, Azure, GCP (PM level)"),
            ("Agile and Tools", "Scrum, SAFe, Kanban, OKRs, DORA Metrics, Jira, Azure DevOps, Confluence, Slack, MS Teams, Power Automate, GitHub Copilot, Generative AI"),
        ],
        "experience": [
            {
                "title": "IT Coordinator (Fintech M&A, Payments and Data)",
                "company": "Serasa Experian",
                "place": "Brazil",
                "dates": "Nov 2024 - Present",
                "bullets": [
                    "Coordinate data, payments and cybersecurity squads, owning planning, delivery governance, SLAs and executive reporting after the acquisition by Serasa.",
                    "Led DevSecOps remediation across 110 Java/Angular applications with Veracode, Rapid7 and CI/CD, reducing total vulnerabilities from 1,200 to 300 in 9 months and critical/high findings from 47 to 3 (about 93%).",
                    "Defined ownership by value stream (data engineering, processing and analysis) and implemented monitoring with Datadog and Teams/Power Automate alerts, sustaining 80M+ transactions per day and R$500M+ monthly reconciliation.",
                    "Lead the migration of legacy analytics from Pentaho to Databricks/Spark and from Tableau to Power BI, cutting ETL processing time by 40% while keeping operations stable through high team turnover.",
                    "Support the integration into a payments gateway platform for utilities with regulated Pix, Nubank and other Bacen-compliant payment flows and PCI-DSS compliance.",
                ],
            },
            {
                "title": "Agile Delivery Manager (HR, Legal, CS, Sales, Billing)",
                "company": "Serasa Experian",
                "place": "London, UK",
                "dates": "Apr 2021 - Nov 2024",
                "bullets": [
                    "Led five cross-functional squads and seven engineers across London and the USA, aligning roadmaps with corporate OKRs and controlling Agile KPIs (velocity and throughput).",
                    "Increased sprint velocity by 35% and reduced cross-squad blockers by 50% with Scrum-of-Scrums, SAFe practices and Jira/ServiceNow dashboards for executive visibility.",
                    "Coordinated an AI smart-search and triage workflow for LegalTech that reduced legal operation SLA by 12%.",
                    "Synchronized the customer care backlog with operations and support, improving prioritization and handoffs across product, support and engineering.",
                ],
            },
            {
                "title": "Full Stack Developer (Billing, ITIL, Observability)",
                "company": "Serasa Experian",
                "place": "Brazil",
                "dates": "Mar 2016 - Apr 2021",
                "bullets": [
                    "Built critical transactional billing platforms with Java, Spring Boot and Angular, adding proactive monitoring with Dynatrace and Datadog to reduce incident resolution time (MTTR).",
                    "Coordinated modernization waves from a legacy .NET portfolio to Angular/Java, migrating or decommissioning 20 critical applications and lowering technical debt.",
                    "Applied Lean Six Sigma Yellow Belt practices to ServiceNow incident, change and problem flows, reducing daily L1 incident volume and speeding resolution through knowledge standardization.",
                    "Led knowledge transfer into the São Carlos operation with documentation and onboarding for internal support teams, reducing dependence on external consultancies.",
                ],
            },
            {
                "title": "Support Specialist",
                "company": "Amdocs",
                "place": "Brazil",
                "dates": "Jul 2013 - Mar 2016",
                "bullets": [
                    "Led a 24x7 support squad for a legacy CRM and billing environment in telecom, organizing handovers across India and Brazil, and reduced daily incidents from 300 to 100 with 99.9% uptime.",
                    "Built automation and batch routines in Unix Shell Script and Oracle PL/SQL, and resolved critical L3 production incidents under strict SLAs.",
                ],
            },
            {
                "title": "Product Owner",
                "company": "XBot",
                "place": "Brazil",
                "dates": "Nov 2010 - Jul 2013",
                "bullets": [
                    "Led the lifecycle and requirements of robotics and EdTech products, generating R$4 million in revenue across 12 distributed sales and partner teams.",
                ],
            },
            {
                "title": "International Consultant",
                "company": "Bernardin Consultants",
                "place": "France / Brazil",
                "dates": "Jan 2010 - Dec 2010",
                "bullets": [
                    "Coordinated market prospecting and financial feasibility for high-tech industries (defense and military aviation), enabling deals between European investors and the Brazilian market.",
                ],
            },
        ],
        "projects": [],
    },
]


def build_styles():
    return {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=19, leading=22, textColor=black),
        "headline": ParagraphStyle("headline", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=HexColor("#1f3a5f")),
        "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9, leading=12),
        "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=10.5, leading=13, spaceBefore=9, spaceAfter=1, textColor=HexColor("#1f3a5f")),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.6, leading=12.4),
        "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.8, leading=12.6, spaceBefore=5),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.4, leading=12, leftIndent=12, bulletIndent=2, spaceBefore=1.2),
    }


def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def link(url):
    return f'<link href="{url}">{esc(url)}</link>'


def section(title, styles):
    return [
        Paragraph(title, styles["section"]),
        HRFlowable(width="100%", thickness=0.6, color=HexColor("#1f3a5f"), spaceBefore=0, spaceAfter=3),
    ]


def bullet(text, styles):
    return Paragraph(esc(text), styles["bullet"], bulletText="•")


def build_story(cv, styles):
    story = [
        Paragraph(esc(CONTACT["name"]), styles["name"]),
        Paragraph(esc(cv["headline"]), styles["headline"]),
        Spacer(1, 3),
        Paragraph(f"{esc(CONTACT['location'])} | {esc(CONTACT['phone'])} | {esc(CONTACT['email'])}", styles["contact"]),
        Paragraph(
            f"LinkedIn: {link(CONTACT['linkedin'])} | GitHub: {link(CONTACT['github'])} | Portfolio: {link(CONTACT['portfolio'])}",
            styles["contact"],
        ),
    ]

    story += section("PROFESSIONAL SUMMARY", styles)
    story.append(Paragraph(esc(cv["summary"]), styles["body"]))

    story += section("KEY ACHIEVEMENTS", styles)
    story += [bullet(item, styles) for item in cv["highlights"]]

    story += section("CORE COMPETENCIES", styles)
    for label, items in cv["competencies"]:
        story.append(Paragraph(f"<b>{esc(label)}:</b> {esc(items)}", ParagraphStyle("comp", parent=styles["body"], spaceBefore=1.5)))

    story += section("PROFESSIONAL EXPERIENCE", styles)
    for job in cv["experience"]:
        header = f"{esc(job['title'])} | {esc(job['company'])} | {esc(job['place'])} | {esc(job['dates'])}"
        block = [Paragraph(header, styles["role"])]
        block += [bullet(item, styles) for item in job["bullets"]]
        story.append(KeepTogether(block))

    if cv["projects"]:
        story += section("SELECTED PROJECTS", styles)
        story += [bullet(item, styles) for item in cv["projects"]]

    story += section("EDUCATION", styles)
    for entry in EDUCATION:
        story.append(Paragraph(f"<b>{esc(entry['school'])}</b> | {esc(entry['dates'])}", ParagraphStyle("edu", parent=styles["body"], spaceBefore=2)))
        story.append(Paragraph(esc(entry["detail"]), styles["body"]))

    story += section("LANGUAGES", styles)
    story.append(Paragraph(esc(LANGUAGES), styles["body"]))
    return story


def render(cv, output_dir):
    path = output_dir / cv["file"]
    doc = SimpleDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.7 * inch,
        rightMargin=0.7 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title=cv["title"],
        author=CONTACT["name"],
        subject="Curriculum Vitae",
        keywords=cv["keywords"],
    )
    doc.build(build_story(cv, build_styles()))
    return path


def check(path):
    """Validate the text layer the way an ATS parser would see it."""
    from pypdf import PdfReader

    reader = PdfReader(str(path))
    text = "\n".join(page.extract_text() for page in reader.pages)
    problems = []

    if len(reader.pages) > 2:
        problems.append(f"{len(reader.pages)} pages (max 2)")

    for heading in ("PROFESSIONAL SUMMARY", "CORE COMPETENCIES", "PROFESSIONAL EXPERIENCE", "EDUCATION", "LANGUAGES"):
        if heading not in text:
            problems.append(f"missing heading {heading}")

    for needle in (CONTACT["email"], CONTACT["phone"], CONTACT["linkedin"], "Serasa Experian"):
        if needle not in text:
            problems.append(f"contact/field not intact in text layer: {needle}")

    lines = [line for line in text.splitlines() if line.strip()]
    average_words = sum(len(line.split()) for line in lines) / max(len(lines), 1)
    if average_words < 5:
        problems.append(f"fragmented text layer ({average_words:.1f} words/line)")

    if re.search(r"[^\x00-\x7F\u00C0-\u00FF•]", text):
        problems.append("characters outside Latin-1 found")

    fonts = set()
    for page in reader.pages:
        for font in (page["/Resources"].get("/Font") or {}).values():
            fonts.add(font.get_object()["/BaseFont"])

    status = "OK" if not problems else "PROBLEMS"
    print(f"[{status}] {path.name}: {len(reader.pages)} pages, {len(lines)} lines, {average_words:.1f} words/line, fonts={sorted(fonts)}")
    for problem in problems:
        print(f"    - {problem}")
    return not problems


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, default=OUTPUT_DIR, help="output directory (default: public/)")
    parser.add_argument("--check", action="store_true", help="validate the generated text layer")
    args = parser.parse_args()

    args.out.mkdir(parents=True, exist_ok=True)
    ok = True
    for cv in CVS:
        path = render(cv, args.out)
        print(f"wrote {path}")
        if args.check:
            ok = check(path) and ok
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
