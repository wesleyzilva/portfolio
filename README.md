# Wesley Silva | Portfolio

A Vite + React portfolio for Wesley Silva, built as a mobile-first, recruiter-friendly showcase for delivery leadership, product ownership, AI-enabled execution, and nearshore collaboration.

## What this project is

This repository contains the live portfolio site published at:

https://wesleyzilva.github.io/portfolio/

The experience is a single-page presentation built around:

- a compact header with fast-impact highlights
- four step-based panels for About, Portfolio, Skills and Contact
- project case studies with contextual detail
- multilingual CV download options
- GitHub Pages deployment
- the `#askToTPM_agentic` chat popup, which answers recruiter questions about the CV

## Tech stack

- React 18
- Vite 5
- CSS custom theming
- GitHub Pages deployment workflow

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Assets

- Profile photo: public/assets/profile.jpg
- CV Português: public/CV_PT_ WesleySilva_GlobalAgileDeliveryManager.pdf
- CV English: public/CV_EN_ WesleySilva_GlobalAgileDeliveryManager.pdf
- CV Français: public/CV_FR_ WesleySilva_GlobalAgileDeliveryManager.pdf
- CV العربية: public/CV_ARABIC_ WesleySilva_GlobalAgileDeliveryManager.pdf
- CV हिंदी: public/CV_HINDI_ WesleySilva_GlobalAgileDeliveryManager.pdf
- CV 中文: public/CV_CH_ WesleySilva_GlobalAgileDeliveryManager.pdf

## Deployment notes

- The site is configured for GitHub Pages through the Vite base path.
- The production bundle is built from the dist folder and published to the Pages branch.

## #askToTPM_agentic chat

A popup that opens on page load (and stays reachable from a floating launcher) where a recruiter can ask questions in English such as "Does he know AWS projects?".

It runs 100% in the browser, so it works on GitHub Pages with no backend. For now the RAG is simulated:

- `src/data/cvData.js` is the single source of CV content, shared by the page and the chat.
- `src/chat/knowledge.js` turns that content into retrievable chunks (projects, skills, career, availability, contact, impact highlights).
- `src/chat/agent.js` retrieves the best chunks (TF-IDF style scoring with field weights, aliases like `QAWS` = QA + AWS, and synonyms) and composes an answer with source links. When a term is not in the CV (for example QA), the answer says so instead of guessing.
- `src/chat/ChatPopup.jsx` is the UI.

To plug in a real RAG/LLM later, replace the body of `askAgent` in `src/chat/agent.js`. It only has to return `{ text, bullets, sources, confidence }`.

```bash
npm test   # retrieval tests, also run by the Pages workflow before the build
```
