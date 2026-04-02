Build gitcard — a CLI that turns any GitHub repo into a beautiful, shareable PDF or image snapshot in one command.
Here's the real problem this solves:
You're on YouTube. You see developers showing off project structures, code architecture, file trees. On Twitter/X, developers share their GitHub repos but the preview is just a boring link. On LinkedIn, you want to showcase a project but GitHub doesn't render nicely. Right now there is no tool that does npx gitcard and gives you a gorgeous visual card — file tree, tech stack badges, top contributors, recent commits, star count, language breakdown — exported as a ready-to-share PNG or PDF.
This is built for the exact culture you're already in. Developers who share on social, post on YouTube, build in public. Every single one of them is your user.
No API key. No cloud. Pure local — it reads your local repo + calls the free GitHub public API. Ships as npx gitcard. Output is a standalone image file you can post anywhere in 3 seconds.
The viral mechanic is identical to carbon.now.sh — people see the output image, ask "how did you make that?", and the tool spreads itself.
Tech stack: Node.js + Puppeteer (renders HTML to image) + a handcrafted HTML template. Exactly your comfort zone. MVP is 2–3 days of focused work.


gitcard architecture — everything you need 
Now here's everything you need to start — folder structure, tech decisions, and the MVP build order.

Reference SVG : /gitcard_architecture.svg

Folder structure
gitcard/
├── bin/
│   └── gitcard.js          ← CLI entry (#!/usr/bin/env node)
├── src/
│   ├── collector/
│   │   ├── repoScanner.js  ← reads local files, git log
│   │   ├── githubApi.js    ← GitHub REST API (no auth for public repos)
│   │   └── pkgParser.js    ← detects stack from manifest files
│   ├── normalizer.js       ← merges all data into one clean object
│   ├── renderer.js         ← fills Handlebars HTML template
│   ├── screenshot.js       ← Puppeteer → PNG/PDF
│   └── themes/
│       ├── default.hbs     ← the beautiful card template
│       └── minimal.hbs
├── package.json
└── README.md

Tech stack — no API key, all local
LayerToolWhyCLI parsingcommander.jsIndustry standard, tinyRepo scanningsimple-git + fsReads local git historyGitHub dataGitHub REST API (public)No auth needed for public reposStack detectionCustom parserspackage.json, pubspec.yaml, Cargo.toml etc.TemplatingHandlebars.jsSimple, logic-less HTML templatesScreenshotPuppeteerRenders HTML → PNG/PDF perfectlyOutputLocal fileZero cloud, zero signup

MVP build order — 3 days
Day 1 — Data layer. Get repoScanner.js, githubApi.js, and pkgParser.js working and console.log the merged object. Nothing visual yet, just clean data.
Day 2 — Template and render. Build the default.hbs card (file tree, language bars, star count, contributors). Run it in browser first so you can iterate the design fast.
Day 3 — CLI + screenshot. Wire commander.js, call Puppeteer, save the PNG. Test with 5 different repos. Write the README. Push to GitHub.

The viral mechanic to build in from day one — add a small --credit flag (on by default) that puts a tiny made with gitcard watermark on the output image. Every time someone posts their snap on Twitter/X or LinkedIn, it's free advertising. Carbon.now.sh built its entire user base this way.