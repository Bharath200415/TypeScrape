# TypeScrape
 
> Reverse engineer any website's design system in seconds.
 
Paste a URL. TypeScrape uses **Anakin AI** to scrape the fully-rendered page, extracts every design token: fonts, colors, spacing, shadows, border radius, and runs it through **Gemini** to generate a production-ready Tailwind config, design token JSON, CSS variables, and a full AI analysis of the brand's personality and UX strategy.
 
<img width="1917" height="912" alt="image" src="https://github.com/user-attachments/assets/8476af8e-aa05-41ee-8a42-7ab8efa43ba4" />
 
---
 
## Features
 
- **Scrape** — Anakin AI fetches the fully JS-rendered HTML of any public URL
- **Extract** — Parses fonts (via `@font-face` + linked CSS), colors, spacing, border radius, shadows, and button styles
- **Analyze** — Gemini identifies brand personality, UI style label, and UX strategy
- **Generate** — Outputs a ready-to-use `tailwind.config.ts`, and AI `skill.md` file, along with design tokens JSON, and CSS variables
- **Font Downloads** — Direct `.woff2` download for instant fonts extraction
---
 
## Tech Stack
 
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Scraping | [Anakin AI](https://anakin.io) — URL Scraper + Browser API |
| AI Analysis | Google Gemini 3 |
| Font Extraction | `@font-face` CSS parsing + Anakin Browser CDP |
| Deployment | Vercel |
 
---
 
## How It Works
 
```
User inputs URL
      ↓
Anakin URL Scraper  →  fully rendered HTML + markdown
      ↓                         ↓
Font API (CSS parsing     extractCSS.ts
+ Anakin Browser CDP)     (colors, spacing,
      ↓                    radius, shadows)
      └──────────┬──────────────┘
                 ↓
         DesignTokens object
                 ↓
        Gemini 3 Preview API
                 ↓
     AnalysisResult (brand, UX,
     Tailwind theme, token JSON)
                 ↓
        4-tab results UI
```
 
---
 
## Project Structure
 
```
Typescrape/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── scrape/route.ts       # Anakin scrape + CSS extraction
│       ├── analyze/route.ts      # Gemini analysis
│       └── fonts/route.ts        # Font extraction via CSS + CDP
├── components/
│   ├── URLInput.tsx
│   ├── ResultsPanel.tsx
│   ├── tabs/
│   │   ├── ScrapedTab.tsx
│   │   ├── SkillPromptTab.tsx
│   │   ├── AnalysisTab.tsx
│   │   ├── TailwindTab.tsx
│   │   └── StarterTab.tsx
│   └── ui/
│       ├── ColorSwatch.tsx
│       ├── FontPreview.tsx
│       ├── CodeBlock.tsx
│       └── LoadingSteps.tsx
├── lib/
│   ├── anakin.ts                 # Anakin API client
│   ├── extractCSS.ts             # HTML → design tokens parser
│   └── prompts.ts                # Gemini prompt templates
├── types/
│   └── index.ts
└── vercel.json
```
 
---
 
## Getting Started
 
### Prerequisites
 
- Node.js 18+
- [Anakin AI API key](https://anakin.io/dashboard)
- [Google Gemini API key](https://aistudio.google.com/app/apikey)
### Installation
 
```bash
git clone https://github.com/bharath200415/TypeScrape.git
cd TypeScrape
npm install
```
 
### Environment Variables
 
Create a `.env.local` file at the root:
 
```env
ANAKIN_API_KEY=your_anakin_key_here
GEMINI_API_KEY=your_gemini_key_here
```
 
### Run Locally
 
```bash
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000), paste any public URL, and hit **Analyze**.
 
---
 
## Deployment (Vercel)
 
1. Push the repo to GitHub
2. Import it on [vercel.com/new](https://vercel.com/new)
3. Add the three environment variables in the Vercel dashboard:
   - `ANAKIN_API_KEY`
   - `GEMINI_API_KEY`
4. Deploy
Function timeouts are pre-configured in `vercel.json` — no extra setup needed.
 
---
 
## API Routes
 
| Route | Method | Description |
|---|---|---|
| `/api/scrape` | POST | Submits URL to Anakin, polls for result, runs CSS extraction |
| `/api/analyze` | POST | Sends tokens + markdown to Gemini, returns structured JSON |
| `/api/fonts` | POST | Extracts fonts via `@font-face` parsing + Anakin Browser CDP |
 
---
 
## Output Tabs
 
| Tab | What You Get |
|---|---|
| **Scraped Tokens** | Colors, fonts, font sizes, spacing, border radius, shadows, buttons |
| **AI Analysis** | Brand personality, UI style label, UX strategy |
| **Tailwind Theme** | Drop-in `tailwind.config.ts` with all extracted values |
| **Starter Pack** | Design tokens JSON + CSS custom properties |
| **AI Skill File** | Copyable skill file to instantly replicate any website's design style |
 
---

 
## Built At
 
Built at the **Anakin AI Hackathon** — showcasing the Anakin URL Scraper and Browser API for real-world design tooling.
 
---
 
## License
 
MIT
