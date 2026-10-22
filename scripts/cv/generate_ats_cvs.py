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
from reportlab.platypus import CondPageBreak, HRFlowable, Paragraph, SimpleDocTemplate, Spacer

OUTPUT_DIR = Path(__file__).resolve().parents[2] / "public"

CONTACT = {
    "name": "Wesley Gomes da Silva",
    "location": "Pato Branco, PR or São Carlos, SP, Brazil | Remote",
    "phone": "+55 16 99721-2966",
    "email": "wesley.zilva@gmail.com",
    "linkedin": "https://www.linkedin.com/in/wesleyzilva/",
    "github": "https://github.com/wesleyzilva",
    "portfolio": "https://wesleyzilva.github.io/portfolio",
}

EDUCATION = [
    {
        "school": "Federal University of São Carlos",
        "detail": "Postgraduate in Software Engineering, Web, Java and Databases",
        "dates": "2018 - 2019",
    },
    {
        "school": "Centro Universitário Central Paulista (UNICEP)",
        "detail": "Bachelor's Degree in Electrical Engineering",
        "dates": "2005 - 2011",
    },
]

CERTIFICATIONS = [
    "Professional Scrum Master III (PSM III)",
    "Lean Six Sigma Yellow Belt",
    "Certified Angular Developer",
    "Certified JavaScript Developer",
    "Datadog - Tagging Best Practices",
    "Datadog - Dashboards",
]

HONORS = [
    "Knowledge transfer and modernization",
    "Recognition for agile work to support IT systems",
    "Agile Coach",
]

PUBLICATIONS = [
    "A block programming interface for educational mobile robots",
    "Retrofit of reclosers in electric power grids",
]

LANGUAGES = "English (Full Professional), Spanish (Elementary), Chinese (Elementary)"

XBOT = {
    "title": "Product Owner | EdTech Startup",
    "company": "XBot",
    "place": "São Carlos, SP",
    "dates": "Nov 2010 - Jul 2013",
    "bullets": [
        "Defined requirements and roadmaps for educational robotics and industrial safety simulators, and aligned go-to-market across 12 distributed sales teams in Brazil, generating R$4 million in sales over 3 years.",
    ],
}

BERNARDIN = {
    "title": "International Consultant (French Contractor)",
    "company": "Bernardin Consultants",
    "place": "Cotia, SP",
    "dates": "Jan 2010 - Dec 2010",
    "bullets": [
        "Conducted B2B market prospecting, financial feasibility and competitive analysis for European corporations entering Latin America, as liaison to Brazilian entities in defense, precision industry and military aviation.",
    ],
}

AMDOCS = {
    "title": "Technical Support Specialist",
    "company": "Amdocs",
    "place": "São Carlos, SP",
    "dates": "Jul 2013 - Mar 2016",
    "bullets": [
        "Delivered global Tier 2/3 production support and database tuning for telecom BSS/OSS platforms, managing L2/L3 incidents with engineering hubs in India and the US (Remedy, Clarify CRM) and keeping strict SLA compliance through root cause analysis.",
        "Automated Unix Shell Script and PL/SQL routines to optimize Oracle DB batch processing, and tuned Tuxedo and WebLogic middleware for high availability.",
    ],
}

CVS = [
    {
        "file": "CV_ATS_AgenticTPM_WesleySilva.pdf",
        "title": "Wesley Gomes da Silva - Agentic Project Manager - CV",
        "keywords": "Agentic Project Manager, Technical Program Manager, Agentic Product Owner, AI agents, MCP, GitHub Copilot, DevSecOps, Databricks, SAFe, PSM III",
        "headline": "Agentic Project Manager | Technical Program Manager | PSM III",
        "summary": (
            "Senior Project Manager and Product Delivery Lead with 14+ years managing global engineering squads and delivering 20+ "
            "mission-critical initiatives across LATAM, US, UK, South Africa and India. Leads Agile delivery, PI Planning and "
            "cross-functional technical alignment across enterprise cloud migrations, Databricks/Spark data lakehouses, DevSecOps "
            "governance and AI-driven SDLC acceleration. Builds agentic delivery workflows with MCP, Databricks, Amplitude, Datadog and "
            "GenAI tools (Claude, ChatGPT, Cursor, GitHub Copilot). Industries: Payments, HR Tech, Legal Tech, Billing, Low-Code, "
            "Cybersecurity, 24/7 Support, Customer Success and data, cloud, legacy and mainframe migrations. Open to nearshore, offshore "
            "and international roles."
        ),
        "highlights": [
            "Boosted SDLC delivery speed by up to 45% by scaling GitHub Copilot and GenAI workspaces across engineering teams.",
            "Eliminated 1,200+ vulnerabilities and cut active security risk by 90% in 6 months across 100+ applications (Veracode, Rapid7, Wiz) while maintaining PCI-DSS and LGPD compliance.",
            "Delivered 100% transactional accuracy for R$500M+ per month in payment flows through a Databricks/Spark lakehouse migration with MLOps under BACEN and FEBRABAN rules.",
            "Managed 5 distributed international squads (35+ members), synchronizing PI Planning and aligning C-level OKRs.",
        ],
        "competencies": [
            ("Program and Project Management", "Technical Program Management, Agile Delivery, PI Planning, SAFe, OKRs, Roadmaps, Fixed-Scope Delivery Governance, Vendor Management, Insourcing, Remote Team Management, Executive Alignment, Digital Transformation, SDLC"),
            ("AI and Agentic Delivery", "Agentic Workflows, MCP (Model Context Protocol), Generative AI, Claude, ChatGPT, Cursor, GitHub Copilot, AI-Accelerated SDLC, Amplitude"),
            ("Agile, Delivery and Operations", "Scrum (PSM III), SAFe, Kanban, DORA Metrics, Jira, Azure DevOps, Monday.com, Confluence, Notion, Figma, Lean Six Sigma Yellow Belt, ITIL, 24/7 L3 Incident Management, MTTR, ServiceNow"),
            ("Data and Engineering", "Databricks, Apache Spark, MLOps, Data Lakehouse, Java, Spring Boot, Angular, JavaScript, .NET, OutSystems (Low-Code), Salesforce, Shell Script, PL/SQL, Oracle"),
            ("Cloud, Security and Observability", "AWS (migration), Azure, GCP, Docker, Kubernetes, CI/CD, DevSecOps, Veracode, Rapid7, Wiz, Checkmarx, PCI-DSS, LGPD, BACEN, FEBRABAN, Datadog, Dynatrace"),
        ],
        "experience": [
            {
                "title": "Agentic Product Owner | Data Centric",
                "company": "Serasa Experian",
                "place": "Pato Branco, PR",
                "dates": "Aug 2026 - Present",
                "bullets": [
                    "Orchestrate technical product discovery and execution for B2B payment flows, using agentic workflows with MCP, Databricks, Amplitude and Datadog to map real user friction points.",
                    "Accelerate engineering and product definition cycles with GenAI tools (Claude, ChatGPT, Cursor, GitHub Copilot).",
                    "Optimize usability and payment recurrence with an essentialist approach, focusing strictly on data-backed features that resolve real usability problems.",
                ],
            },
            {
                "title": "IT Coordinator | Agentic Tech Project Manager",
                "company": "Serasa Experian (Flexpag)",
                "place": "Recife, PE",
                "dates": "Nov 2024 - Aug 2026",
                "bullets": [
                    "Led key engineering projects for a digital payments and billing fintech, managing technical backlogs in lean environments without a formal Product Owner, including a Hub integration with a White Label frontend and API integrations with clients.",
                    "Built and ran a DevSecOps guardrail framework across 100+ applications with Veracode, Rapid7 and Wiz as part of a cybersecurity remediation and AWS cloud migration program, eliminating 1,200+ vulnerabilities and reducing security risk by 90% in 6 months.",
                    "Orchestrated end-to-end migration of legacy analytics to Databricks and Apache Spark with MLOps (data lakehouse), delivering 100% transactional accuracy for R$500M+ per month under BACEN and FEBRABAN regulation.",
                ],
            },
            {
                "title": "Agile Delivery Manager",
                "company": "Serasa Experian (Shared Services)",
                "place": "São Carlos, SP",
                "dates": "Apr 2021 - Nov 2024",
                "bullets": [
                    "Coordinated PI Planning and SAFe governance across 5 international squads (35+ members) in LATAM, US, UK and South Africa, synchronizing C-level OKRs and optimizing flow metrics (velocity, throughput, lead time, dependencies).",
                    "Led rollout, training and enablement of GitHub Copilot and GenAI workspaces across engineering units, accelerating SDLC delivery speed by up to 45%.",
                    "Managed backlog, scope baseline and execution of AI-driven Legal Tech applications under fixed-scope contracts, automating legal document reviews and cutting processing time.",
                    "Led squads and vendor hiring under fixed-scope contracts for enterprise HR platforms (HCM, total compensation, OutSystems low-code), eliminating third-party dependencies.",
                    "Oversaw high-volume billing platforms and 24/7 Level 3 ITIL incident management with 100% transactional accuracy and reduced MTTR; directed Customer Success portals and a design system with Figma.",
                ],
            },
            {
                "title": "Full Stack Engineer",
                "company": "Serasa Experian",
                "place": "São Carlos, SP",
                "dates": "Mar 2016 - Apr 2021",
                "bullets": [
                    "Delivered full-stack Java, Spring and cloud engineering and mainframe migration for enterprise billing and CRM platforms in the Core Financial Operations unit.",
                    "Led modernization of legacy mainframe components into cloud-native microservices (Java, Spring Boot, .NET) with CI/CD pipelines and automated security checks in release flows.",
                    "Provided 24/7 L3 support with Dynatrace and Datadog observability, keeping 100% transactional billing accuracy and reducing MTTR.",
                    "Built self-service portals integrated with Salesforce and OutSystems, and executed a vendor-to-internal insourcing transition for core operations, eliminating vendor lock-in.",
                ],
            },
            AMDOCS,
            XBOT,
            BERNARDIN,
        ],
        "projects": [
            "AI portfolio chat (#askToTPM_agentic): CV-grounded Q&A prototype that offers this CV for download (React, Vite, GitHub Pages).",
        ],
    },
    {
        "file": "CV_ATS_ITCoordinator_WesleySilva.pdf",
        "title": "Wesley Gomes da Silva - IT Coordinator - CV",
        "keywords": "IT Coordinator, Agentic Tech Project Manager, ITIL, ITSM, DevSecOps, Databricks, Incident Management, Vendor Management, SAFe, PSM III",
        "headline": "IT Coordinator | Delivery, Data and DevSecOps | PSM III",
        "summary": (
            "IT Coordinator and Senior Project Manager with 14+ years in mission-critical systems for payments, billing, HR Tech, Legal "
            "Tech and telecom. Coordinates engineering squads and vendors end to end across LATAM, US, UK, South Africa and India: "
            "planning, fixed-scope delivery governance, 24/7 ITIL incident management, DevSecOps compliance and executive reporting. "
            "Combines a hands-on Java, Spring Boot, Angular and .NET background with ITSM discipline, Databricks/Spark data platforms and "
            "Agile delivery (SAFe, PI Planning). Based in Brazil and ready for remote work."
        ),
        "highlights": [
            "Eliminated 1,200+ vulnerabilities and reduced active security risk by 90% in 6 months across 100+ applications while maintaining PCI-DSS and LGPD compliance.",
            "100% transactional accuracy for R$500M+ per month in payment flows through a Databricks/Spark migration under BACEN and FEBRABAN regulation.",
            "100% transactional billing accuracy and drastically reduced MTTR with 24/7 Level 3 ITIL operations and Dynatrace/Datadog observability.",
            "Eliminated vendor lock-in with vendor-to-internal insourcing programs across HR Tech, Legal Tech AI, EdTech and core billing operations.",
        ],
        "competencies": [
            ("IT Coordination and Operations", "IT Team Coordination, Squad and Vendor Management, Fixed-Scope Delivery Governance, Insourcing, 24/7 L2/L3 Incident Management, ITIL, ITSM, ServiceNow, Remedy, Clarify CRM, SLA Governance, MTTR, Root Cause Analysis, Knowledge Transfer, Lean Six Sigma Yellow Belt, Executive Reporting"),
            ("Data and Platforms", "Databricks, Apache Spark, MLOps, Data Lakehouse, Datadog, Dynatrace, Billing Systems, Oracle, PL/SQL, Pentaho ETL, Power BI, Tableau"),
            ("Security and Compliance", "DevSecOps, Veracode, Rapid7, Wiz, Checkmarx, PCI-DSS, LGPD, BACEN, FEBRABAN"),
            ("Engineering and Cloud", "Java, Spring Boot, Angular, JavaScript, .NET, OutSystems (Low-Code), Salesforce, Unix/Linux, Shell Script, CI/CD, GitHub Actions, AWS (migration), Azure, GCP, Docker, Kubernetes, Tuxedo, WebLogic"),
            ("Agile and Tools", "Scrum (PSM III), SAFe, PI Planning, Kanban, OKRs, DORA Metrics, Jira, Azure DevOps, Confluence, Figma, GitHub Copilot, Generative AI"),
        ],
        "experience": [
            {
                "title": "Agentic Product Owner | Data Centric",
                "company": "Serasa Experian",
                "place": "Pato Branco, PR",
                "dates": "Aug 2026 - Present",
                "bullets": [
                    "Own technical product discovery and execution for B2B payment flows, using Databricks, Amplitude and Datadog data to map real user friction points and prioritize data-backed features.",
                    "Speed up engineering and product definition cycles with GenAI tools (Claude, ChatGPT, Cursor, GitHub Copilot).",
                ],
            },
            {
                "title": "IT Coordinator | Agentic Tech Project Manager",
                "company": "Serasa Experian (Flexpag)",
                "place": "Recife, PE",
                "dates": "Nov 2024 - Aug 2026",
                "bullets": [
                    "Led key engineering projects for a digital payments and billing fintech, managing technical backlogs in lean environments without a formal Product Owner, including a Hub integration with a White Label frontend and API integrations with clients.",
                    "Built and ran a DevSecOps guardrail framework across 100+ applications with Veracode, Rapid7 and Wiz within a cybersecurity remediation and AWS cloud migration program, eliminating 1,200+ vulnerabilities and reducing security risk by 90% in 6 months while maintaining PCI-DSS and LGPD compliance.",
                    "Orchestrated end-to-end migration of legacy analytics to Databricks and Apache Spark with MLOps, delivering 100% transactional accuracy for R$500M+ per month under strict BACEN and FEBRABAN constraints.",
                ],
            },
            {
                "title": "Agile Delivery Manager",
                "company": "Serasa Experian (Shared Services)",
                "place": "São Carlos, SP",
                "dates": "Apr 2021 - Nov 2024",
                "bullets": [
                    "Managed global delivery across UK, US and LATAM, coordinating PI Planning and Agile governance for 5 international squads (35+ members) and optimizing flow metrics (velocity, throughput, lead time, dependencies).",
                    "Oversaw high-volume transactional billing platforms and 24/7 Level 3 ITIL incident management, guaranteeing 100% transactional accuracy and drastically reducing MTTR.",
                    "Led squads and vendor hiring under fixed-scope contracts for enterprise HR platforms (HCM, total compensation, OutSystems low-code), eliminating third-party dependencies and improving executive visibility.",
                    "Managed backlog, scope baseline and execution of AI-driven Legal Tech applications under fixed-scope contracts, cutting legal document review time.",
                    "Led rollout and training of GitHub Copilot and GenAI workspaces across engineering units, accelerating SDLC delivery speed by up to 45%.",
                ],
            },
            {
                "title": "Full Stack Engineer",
                "company": "Serasa Experian",
                "place": "São Carlos, SP",
                "dates": "Mar 2016 - Apr 2021",
                "bullets": [
                    "Executed a vendor-to-internal insourcing transition for core system operations, eliminating vendor lock-in, reducing third-party operational costs and retaining critical domain knowledge in-house.",
                    "Delivered billing engineering and 24/7 L3 support with Dynatrace and Datadog observability, maintaining 100% transactional billing accuracy and reducing MTTR.",
                    "Led modernization of legacy mainframe components into cloud-native microservices (Java, Spring Boot, .NET) with CI/CD pipelines and automated security checks in release flows.",
                    "Built self-service administrative portals and integrated Salesforce and OutSystems, reducing manual support requests and ensuring interoperability.",
                ],
            },
            AMDOCS,
            XBOT,
            BERNARDIN,
        ],
        "projects": [],
    },
]


def build_styles():
    return {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=19, leading=22, textColor=black),
        "headline": ParagraphStyle("headline", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=HexColor("#1f3a5f")),
        "contact": ParagraphStyle("contact", fontName="Helvetica", fontSize=9, leading=12),
        "section": ParagraphStyle("section", fontName="Helvetica-Bold", fontSize=10.5, leading=13, spaceBefore=6, spaceAfter=1, textColor=HexColor("#1f3a5f")),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9.4, leading=11.8),
        "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.6, leading=12, spaceBefore=4),
        "bullet": ParagraphStyle("bullet", fontName="Helvetica", fontSize=9.3, leading=11.5, leftIndent=12, bulletIndent=2, spaceBefore=1),
    }


def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def link(url):
    shown = url.replace("https://", "").rstrip("/")
    return f'<link href="{url}">{esc(shown)}</link>'


def section(title, styles):
    return [
        Paragraph(title, styles["section"]),
        HRFlowable(width="100%", thickness=0.6, color=HexColor("#1f3a5f"), spaceBefore=0, spaceAfter=3),
    ]


def titled(title, first, styles, room=0.9):
    return [CondPageBreak(room * inch)] + section(title, styles) + [first]


def bullet(text, styles):
    return Paragraph(esc(text), styles["bullet"], bulletText="•")


def build_story(cv, styles):
    comp_style = ParagraphStyle("comp", parent=styles["body"], spaceBefore=1.5)
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
    story += titled("PROFESSIONAL SUMMARY", Paragraph(esc(cv["summary"]), styles["body"]), styles)

    story += titled("KEY ACHIEVEMENTS", bullet(cv["highlights"][0], styles), styles)
    story += [bullet(item, styles) for item in cv["highlights"][1:]]

    first_label, first_items = cv["competencies"][0]
    story += titled("CORE COMPETENCIES", Paragraph(f"<b>{esc(first_label)}:</b> {esc(first_items)}", comp_style), styles)
    for label, items in cv["competencies"][1:]:
        story.append(Paragraph(f"<b>{esc(label)}:</b> {esc(items)}", comp_style))

    story += [CondPageBreak(1.1 * inch)] + section("PROFESSIONAL EXPERIENCE", styles)
    for job in cv["experience"]:
        header = f"{esc(job['title'])} | {esc(job['company'])} | {esc(job['place'])} | {esc(job['dates'])}"
        story.append(CondPageBreak(0.7 * inch))
        story.append(Paragraph(header, styles["role"]))
        story += [bullet(item, styles) for item in job["bullets"]]

    if cv["projects"]:
        story += titled("SELECTED PROJECTS", bullet(cv["projects"][0], styles), styles)
        story += [bullet(item, styles) for item in cv["projects"][1:]]

    story += titled("CERTIFICATIONS", Paragraph(esc(" | ".join(CERTIFICATIONS)), styles["body"]), styles)

    story += titled(
        "HONORS AND PUBLICATIONS",
        Paragraph(f"<b>Honors and Awards:</b> {esc(' | '.join(HONORS))}", styles["body"]),
        styles,
    )
    story.append(Paragraph(f"<b>Publications:</b> {esc(' | '.join(PUBLICATIONS))}", comp_style))

    education = [
        Paragraph(
            f"<b>{esc(entry['school'])}</b> | {esc(entry['detail'])} | {esc(entry['dates'])}",
            ParagraphStyle("edu", parent=styles["body"], spaceBefore=2),
        )
        for entry in EDUCATION
    ]
    story += [CondPageBreak(1.0 * inch)] + section("EDUCATION", styles) + education

    story += titled("LANGUAGES", Paragraph(esc(LANGUAGES), styles["body"]), styles, room=0.6)
    return story


def render(cv, output_dir):
    path = output_dir / cv["file"]
    doc = SimpleDocTemplate(
        str(path),
        pagesize=LETTER,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
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

    for heading in ("PROFESSIONAL SUMMARY", "CORE COMPETENCIES", "PROFESSIONAL EXPERIENCE", "CERTIFICATIONS", "EDUCATION", "LANGUAGES"):
        if heading not in text:
            problems.append(f"missing heading {heading}")

    for needle in (CONTACT["email"], CONTACT["phone"], "linkedin.com/in/wesleyzilva", "Serasa Experian"):
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
