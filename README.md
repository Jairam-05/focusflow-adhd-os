# FocusFlow — ADHD OS

A calm, attention-aware productivity system. It combines the original Kaizen-inspired workflow with an intentionally low-stimulation interface informed by ADHD usability research.

## Design approach

The UI is not designed to maximize stimulation. It is designed to reduce initiation friction and decision load:

- One obvious next action on the Today screen.
- Progressive disclosure: Simple Mode first, Advanced Mode when wanted.
- Chunked information instead of dense dashboards.
- Color is semantic and restrained rather than decorative everywhere.
- Small completion feedback rewards action without turning the app into a noisy game.
- Time and energy are treated as contextual, not moral scores.
- Motion is subtle and can be disabled with Reduce Motion.
- Missed days do not erase progress.

Research note: evidence for ADHD digital interventions is promising but still heterogeneous/limited, so these are UX-informed design choices rather than medical claims. See the research links in the project discussion.

## Included
- Simple Mode + Advanced Mode
- Brain Dump, Daily Highlight, Micro-commitment
- Must / Should / Could tasks
- Estimated vs actual task time
- Projects → Goals → Values
- Weekly insights, streaks, XP
- Flexible Sprint Sessions
- Pomodoro timer
- Calendar with events
- Habit tracking with weekly history
- Browser notification permission + configurable reminders
- Energy-aware focus suggestions
- Local persistence via localStorage
- Responsive desktop/mobile UI
- Reduced-motion setting

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy to Vercel
1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Framework preset: Vite (usually detected automatically).
4. Build command: `npm run build`
5. Output directory: `dist`

No environment variables are required for the current local-first version.

## Notifications
Browser notifications are permission-based and work best while the app is open. True background push reminders require a service worker plus a push provider/database.
