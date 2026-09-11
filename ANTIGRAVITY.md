# ⚡ E-Lab — Interactive Engineering Laboratory

> **Learn. Build. Simulate. Understand.**
>
> A modern, interactive browser-based engineering laboratory designed for ECE students to experiment with circuits, signals, systems, digital logic, control systems, and engineering mathematics.

---

# 1. PROJECT VISION

Build a polished, production-quality web application called **E-Lab**.

E-Lab is not supposed to feel like a collection of calculators.

It should feel like a **real engineering simulation platform**.

The user should be able to:

* Learn engineering concepts
* Configure experiments
* Manipulate parameters
* Visualize mathematical behavior
* Build digital circuits
* Analyze signals
* Explore system responses
* Save experiments locally
* Understand results
* Experiment without fear of breaking anything

The application should prioritize:

> **Interaction > Visualization > Explanation > Calculation**

The project should be impressive enough to be presented as a flagship frontend portfolio project.

---

# 2. CRITICAL DEPLOYMENT REQUIREMENT

## GitHub Pages compatibility is mandatory.

The application MUST be deployable as a completely static website through GitHub Pages.

Use:

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Zustand
* Recharts / D3 where appropriate
* React Flow where appropriate
* KaTeX for mathematical equations

Do NOT use:

* Next.js server features
* Express
* Node.js backend
* Server-side API routes
* Server Actions
* Required database servers
* Required backend services
* Server-side authentication
* Anything that prevents a static `dist/` build

Vite's production build should produce the deployable static output.

The project must work after:

```bash
npm run build
```

and the generated:

```text
dist/
```

must contain everything necessary to run the application.

GitHub Pages deployment must use GitHub Actions.

Official deployment model:

```text
Source Code
    ↓
GitHub Repository
    ↓
GitHub Actions
    ↓
npm ci
    ↓
npm run build
    ↓
dist/
    ↓
GitHub Pages
```

Configure Vite's `base` correctly for repository deployment.

If the repository is:

```text
https://github.com/USERNAME/REPOSITORY
```

the application must support:

```text
https://USERNAME.github.io/REPOSITORY/
```

Do not hard-code root-relative asset URLs such as:

```text
/assets/logo.svg
```

Use Vite-compatible paths so assets work correctly under a GitHub Pages subpath.

---

# 3. DEVELOPMENT PHILOSOPHY

Do not generate a huge monolithic application in one file.

Use:

* reusable components
* modular architecture
* feature-based organization
* strongly typed data
* reusable UI primitives
* clean state management
* clear separation between UI and simulation logic

The application should be easy to extend later.

Every major laboratory module should be independently maintainable.

---

# 4. DESIGN DIRECTION

## Overall aesthetic

The design should feel like:

**Modern engineering software + premium SaaS dashboard + scientific visualization platform.**

Avoid making it look like:

* a school website
* a generic admin dashboard
* a Bootstrap template
* a calculator website
* a gaming dashboard
* an over-designed cyberpunk website

The design should be sophisticated and restrained.

---

# 5. VISUAL LANGUAGE

## Primary characteristics

* Dark-first interface
* High readability
* Technical typography
* Subtle borders
* Layered surfaces
* Controlled use of color
* Fine grid details
* Data-dense but uncluttered layouts
* Smooth micro-interactions
* Professional scientific aesthetic

Use a neutral dark base with carefully selected accent colors.

Do not use excessive gradients.

Do not use giant glowing text.

Do not make everything neon.

Do not use excessive glassmorphism.

---

# 6. COLOR SYSTEM

Create a centralized design token system.

Suggested foundation:

```text
Background:
#09090B

Surface:
#111113

Elevated Surface:
#18181B

Border:
#27272A

Primary Text:
#FAFAFA

Secondary Text:
#A1A1AA

Muted Text:
#71717A
```

Use engineering-related accent colors sparingly:

```text
Blue       → primary interaction
Cyan       → signals / data
Green      → successful results
Amber      → warnings
Red        → errors
Purple     → AI / advanced features
```

Do not hard-code colors throughout components.

Use semantic design tokens.

---

# 7. TYPOGRAPHY

Use a clean modern sans-serif for UI.

Recommended:

```text
Inter
```

Use a monospace font for:

* equations
* circuit values
* terminal-style displays
* code-like information
* measurement readouts

Recommended:

```text
JetBrains Mono
```

Typography should create a clear hierarchy.

---

# 8. ICONOGRAPHY

Use Lucide icons.

Do not use emojis as the primary UI icon system.

Emojis may appear occasionally in educational content, but the actual interface should use consistent SVG icons.

---

# 9. APPLICATION STRUCTURE

The application should contain:

```text
Dashboard
│
├── Circuit Lab
│
├── Signals & Systems
│
├── Digital Electronics
│
├── Control Systems
│
├── Engineering Tools
│
├── Experiments
│
└── Settings
```

---

# 10. GLOBAL APPLICATION SHELL

Create a persistent application shell.

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo     Search...                     Notifications  Avatar │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│ Dashboard    │                                               │
│              │                                               │
│ Circuit Lab  │                                               │
│              │                                               │
│ Signals      │             MAIN CONTENT                      │
│              │                                               │
│ Digital      │                                               │
│              │                                               │
│ Control      │                                               │
│              │                                               │
│ Tools        │                                               │
│              │                                               │
│ Experiments  │                                               │
│              │                                               │
│──────────────│                                               │
│ Settings     │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Sidebar requirements:

* collapsible
* icons + labels
* active route indicator
* tooltips when collapsed
* smooth transitions
* mobile drawer

Top navigation:

* global search
* command palette trigger
* notifications
* theme toggle
* user/profile menu

---

# 11. DASHBOARD

The dashboard should immediately communicate what E-Lab does.

## Hero section

Display:

```text
Good evening, Engineer.

Explore. Experiment. Understand.

Your interactive engineering laboratory.
```

Below this:

### Quick Launch

Cards:

```text
Circuit Lab
Signals & Systems
Digital Electronics
Control Systems
```

Each card should have:

* icon
* short description
* number of experiments
* subtle hover animation
* "Open Lab" action

---

# 12. DASHBOARD ANALYTICS

Include:

### Experiments completed

Example:

```text
27
+4 this week
```

### Current progress

```text
Signals & Systems     64%
Digital Electronics   82%
Circuit Analysis      71%
Control Systems       38%
```

### Recent experiments

Display:

```text
RC Low-Pass Filter
Fourier Series
JK Flip-Flop
RLC Resonance
```

### Continue Experiment

Show the most recently used experiment.

---

# 13. GLOBAL COMMAND PALETTE

Implement a command palette.

Shortcut:

```text
Ctrl + K
```

Allow:

```text
Search experiments
Open Circuit Lab
Open Signal Generator
Open Logic Simulator
Open Control Systems
Open Engineering Tools
Toggle theme
Reset workspace
```

Use keyboard navigation.

---

# 14. CIRCUIT LAB

The Circuit Lab is one of the core modules.

Create:

```text
/circuit-lab
```

## Circuit categories

### Fundamentals

* Ohm's Law
* Voltage Divider
* Current Divider
* Series Resistance
* Parallel Resistance

### AC Circuits

* RC Circuit
* RL Circuit
* RLC Circuit
* Resonance
* Impedance

### Electronics

* Diode
* Rectifier
* BJT Biasing
* MOSFET Basics
* Op-Amp

---

# 15. CIRCUIT EXPERIMENT UI

Use a three-panel layout.

```text
┌─────────────┬────────────────────────────┬───────────────┐
│ Components  │                            │ Measurements  │
│             │        Circuit Canvas      │               │
│ Resistor    │                            │ Voltage       │
│ Capacitor   │       [ Circuit ]          │ Current       │
│ Inductor    │                            │ Power         │
│ Diode       │                            │               │
│ Source      │                            │               │
└─────────────┴────────────────────────────┴───────────────┘
```

The circuit canvas should support:

* component placement
* parameter editing
* connection visualization
* zoom
* pan
* reset
* clear
* component selection

For the initial implementation, prioritize educational simulations over physically perfect SPICE-level simulation.

---

# 16. OHM'S LAW EXPERIMENT

Provide interactive controls:

```text
Voltage
Resistance
Current
Power
```

Changing one parameter should update dependent values.

Example:

```text
V = 12 V
R = 1000 Ω

I = 12 mA
P = 144 mW
```

Show the relationship visually.

---

# 17. RC CIRCUIT

Implement an interactive RC experiment.

Parameters:

```text
R
C
Vin
Initial voltage
```

Automatically calculate:

```text
τ = RC
fc = 1 / (2πRC)
```

Display:

* charging curve
* discharging curve
* time constant marker
* voltage at selected time
* calculated values

Allow users to drag sliders and watch the graph update.

---

# 18. RLC RESONANCE

Provide:

```text
R
L
C
Frequency
```

Calculate:

```text
f₀ = 1 / (2π√LC)
```

Display:

* impedance curve
* resonance frequency
* bandwidth
* quality factor

Use an interactive graph.

---

# 19. SIGNALS & SYSTEMS

Create:

```text
/signals
```

This should become one of the most visually impressive modules.

---

# 20. SIGNAL GENERATOR

Allow users to select:

```text
Sine
Cosine
Square
Triangle
Sawtooth
Impulse
Step
Ramp
```

Parameters:

```text
Amplitude
Frequency
Phase
DC Offset
Time Range
Sampling Frequency
```

Display the waveform in real time.

---

# 21. SIGNAL OPERATIONS

Implement:

### Time shifting

```text
x(t - t₀)
x(t + t₀)
```

### Time scaling

```text
x(at)
```

### Time reversal

```text
x(-t)
```

### Amplitude scaling

```text
Ax(t)
```

### Addition

```text
x₁(t) + x₂(t)
```

### Multiplication

```text
x₁(t)x₂(t)
```

Show original and transformed signals simultaneously when useful.

---

# 22. FOURIER VISUALIZER

Create an interactive Fourier visualization.

Show:

```text
Time Domain
      ↓
Fourier Transform
      ↓
Frequency Domain
```

The user should be able to modify the signal and immediately see how the frequency spectrum changes.

Show:

* magnitude spectrum
* phase spectrum
* dominant frequencies
* sampling frequency

---

# 23. CONVOLUTION VISUALIZER

Create an interactive convolution demonstration.

Display:

```text
x(t)
h(t)
──────
x(t) * h(t)
```

Allow the user to move one signal across another.

Animate the convolution process.

This should be educational and visually intuitive.

---

# 24. DIGITAL ELECTRONICS LAB

Create:

```text
/digital
```

---

# 25. LOGIC GATE SIMULATOR

Support:

```text
AND
OR
NOT
NAND
NOR
XOR
XNOR
```

Interactive inputs:

```text
A = 0 / 1
B = 0 / 1
```

Display output immediately.

Also display the truth table.

---

# 26. DIGITAL CIRCUIT BUILDER

This is a major feature.

Use a node-based canvas.

Users should be able to:

* drag gates
* connect gates
* change inputs
* observe outputs
* delete components
* duplicate components
* reset circuit
* zoom
* pan

Example:

```text
A ─────┐
       ▼
     ┌─────┐
B ──►│ AND │─────┐
     └─────┘     │
                 ▼
              ┌────┐
C ───────────►│ OR │─── Y
              └────┘
```

Use React Flow or an equivalent browser-only solution.

---

# 27. SEQUENTIAL LOGIC

Implement:

* SR latch
* D flip-flop
* JK flip-flop
* T flip-flop

Display:

* state
* inputs
* outputs
* clock
* timing diagram

---

# 28. TIMING DIAGRAMS

Create an interactive timing diagram viewer.

Example:

```text
CLK  ─┐ ┌─┐ ┌─┐ ┌─┐
      └─┘ └─┘ └─┘ └─

J    ────────┐   ┌────
             └───┘

K    ──┐       ┌──────
       └───────┘

Q    ─────┐       ┌───
          └───────┘
```

Allow users to change input sequences.

---

# 29. CONTROL SYSTEMS

Create:

```text
/control
```

Users should be able to enter transfer functions.

Example:

```text
G(s) = 10 / (s² + 2s + 10)
```

Display:

* step response
* impulse response
* pole-zero plot
* Bode magnitude
* Bode phase

Where practical, implement numerical calculations in browser-compatible TypeScript.

Do not introduce a backend merely for mathematical calculations.

---

# 30. CONTROL SYSTEM BLOCK DIAGRAM

Create an interactive block diagram builder.

Support:

```text
Input
Gain
Integrator
Transfer Function
Summing Junction
Output
Feedback
```

Example:

```text
             ┌───────────────┐
             │               │
             ▼               │
R ──► (+) ──► G(s) ──► Y(s) │
      ▲                    │ │
      │                    │ │
      └────── H(s) ◄──────┘
```

---

# 31. ENGINEERING TOOLBOX

Create:

```text
/tools
```

Organize tools by category.

## Electrical

* Ohm's Law
* Power
* Voltage Divider
* Current Divider
* Resistor Series/Parallel
* Capacitor Series/Parallel
* Inductor Series/Parallel
* Decibel Calculator

## Electronics

* Resistor Color Code
* Capacitor Code
* Diode Calculator
* BJT Bias Calculator
* Op-Amp Calculator
* RC Filter
* RL Filter
* RLC Resonance

## Mathematics

* Complex Number Calculator
* Matrix Calculator
* Laplace Transform Explorer
* Fourier Transform Explorer
* Scientific Calculator

---

# 32. EXPERIMENT SYSTEM

Create a reusable experiment framework.

Every experiment should have:

```text
Experiment Title
Objective
Theory
Parameters
Simulation
Results
Analysis
```

Example:

```text
RC Low-Pass Filter

Objective
Understand the behavior of an RC low-pass filter.

Theory
...

Parameters
R = 10 kΩ
C = 100 nF

Simulation
[ interactive graph ]

Results
fc = 159.15 Hz

Analysis
...

Reset Experiment
Save Experiment
```

---

# 33. LOCAL DATA STORAGE

Because GitHub Pages is static, initially store user data in:

```text
localStorage
```

Store:

* recent experiments
* saved experiments
* settings
* theme
* progress
* completed experiments
* custom circuits

Do not require a database.

Create a clean abstraction so IndexedDB can replace localStorage later if needed.

---

# 34. EXPERIMENT SAVE SYSTEM

Users should be able to:

```text
Save
Rename
Duplicate
Delete
Reset
Export
```

Saved experiments should appear in:

```text
My Experiments
```

---

# 35. EXPORT

Allow users to export experiment results.

At minimum:

```text
Export as JSON
```

Optionally:

```text
Export graph as PNG
Export results as CSV
Print experiment
```

All export functionality must run client-side.

---

# 36. AI LAB ASSISTANT

Design an AI assistant interface, but keep the core application fully functional without an AI backend.

The assistant UI should support:

```text
Explain this result
Why did this happen?
What happens if I increase R?
Explain this equation
Give me a practice problem
Check my circuit
```

If an API integration is later added, keep it optional.

Never expose secret API keys in frontend source code.

The base GitHub Pages application must remain functional without AI.

---

# 37. RESPONSIVE DESIGN

Desktop is the primary experience.

Support:

```text
Desktop
Tablet
Mobile
```

However, simulation-heavy interfaces should gracefully adapt rather than simply shrink.

For mobile:

* sidebar becomes drawer
* panels stack
* graphs remain horizontally usable
* circuit canvas supports touch/pan
* controls become bottom sheets or stacked cards

---

# 38. ANIMATION

Animations should communicate state.

Use Framer Motion for:

* page transitions
* panel transitions
* modal transitions
* sidebar animation
* hover states
* card interactions
* command palette
* notifications

Avoid:

* constant floating animations
* excessive bouncing
* unnecessary parallax
* distracting background animation

Target:

> **calm, precise, technical motion.**

---

# 39. DATA VISUALIZATION

Charts must be readable before they are beautiful.

Every graph should have:

* axis labels
* units
* grid
* tooltip
* readable values
* responsive scaling
* reset zoom where appropriate

Do not create decorative graphs that communicate nothing.

---

# 40. ACCESSIBILITY

Implement:

* semantic HTML
* keyboard navigation
* visible focus states
* accessible labels
* sufficient contrast
* reduced-motion support
* ARIA only where necessary

All interactive controls must be keyboard accessible.

---

# 41. ERROR HANDLING

Never allow a broken calculation to crash the entire application.

Examples:

Invalid:

```text
R = -10 Ω
```

should produce:

```text
Invalid resistance.
Resistance must be greater than zero.
```

For malformed equations:

```text
Unable to parse transfer function.

Check the expression and try again.
```

---

# 42. LOADING / EMPTY / ERROR STATES

Every data-driven or interactive section should have appropriate states.

Create reusable:

```text
LoadingState
EmptyState
ErrorState
SuccessState
```

Do not leave blank screens.

---

# 43. PROJECT ARCHITECTURE

Prefer a feature-oriented structure.

Suggested:

```text
src/
│
├── assets/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── charts/
│   ├── graphs/
│   └── common/
│
├── features/
│   ├── dashboard/
│   ├── circuits/
│   ├── signals/
│   ├── digital/
│   ├── control/
│   ├── tools/
│   ├── experiments/
│   └── assistant/
│
├── lib/
│   ├── math/
│   ├── simulation/
│   ├── storage/
│   ├── export/
│   └── utils/
│
├── hooks/
│
├── store/
│
├── types/
│
├── data/
│
├── pages/
│
├── App.tsx
└── main.tsx
```

Keep simulation algorithms separate from presentation components.

---

# 44. SIMULATION ENGINE

Create a reusable simulation layer.

For example:

```text
simulation/
├── signals/
│   ├── sine.ts
│   ├── square.ts
│   ├── triangle.ts
│   ├── convolution.ts
│   └── fourier.ts
│
├── circuits/
│   ├── ohms-law.ts
│   ├── rc.ts
│   ├── rl.ts
│   └── rlc.ts
│
├── digital/
│   ├── gates.ts
│   ├── flipflops.ts
│   └── truth-table.ts
│
└── control/
    ├── transfer-function.ts
    ├── step-response.ts
    └── bode.ts
```

Simulation functions should be:

* deterministic
* testable
* independent of React
* strongly typed

---

# 45. STATE MANAGEMENT

Use Zustand only where global state is genuinely useful.

Possible stores:

```text
useAppStore
useExperimentStore
useSettingsStore
useCircuitStore
```

Do not put every local input field into global state.

Prefer local React state for local UI.

---

# 46. ROUTING

Use a client-side router compatible with static hosting.

Recommended:

```text
React Router
```

Routes:

```text
/
 /circuits
 /circuits/ohms-law
 /circuits/rc
 /circuits/rlc

 /signals
 /signals/generator
 /signals/fourier
 /signals/convolution

 /digital
 /digital/gates
 /digital/circuit-builder
 /digital/flip-flops

 /control
 /control/response
 /control/bode

 /tools
 /experiments
 /settings
```

IMPORTANT:

Because this is deployed to GitHub Pages, configure routing and deployment so refreshing a route does not unnecessarily break the application.

Prefer a deployment strategy that works reliably with static hosting.

If necessary, implement a GitHub Pages-compatible SPA fallback.

---

# 47. GITHUB PAGES DEPLOYMENT

Create:

```text
.github/
└── workflows/
    └── deploy.yml
```

The workflow should:

1. Checkout repository
2. Install Node
3. Install dependencies with `npm ci`
4. Build with `npm run build`
5. Upload `dist`
6. Deploy to GitHub Pages

Use GitHub's Pages deployment actions.

The application should deploy automatically whenever changes are pushed to `main`.

---

# 48. VITE CONFIGURATION

Create a proper `vite.config.ts`.

The base path must be configurable.

Example concept:

```text
base: '/REPOSITORY_NAME/'
```

Do not assume the repository name forever.

Make it easy to change.

Do not break asset paths.

---

# 49. PACKAGE SCRIPTS

The project should include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

If additional validation scripts are useful, add them.

---

# 50. QUALITY REQUIREMENTS

Before considering a feature complete:

* no TypeScript errors
* no console errors
* no broken links
* no missing assets
* no horizontal overflow on supported screens
* no inaccessible buttons
* no fake functionality presented as working
* no placeholder lorem ipsum
* no unnecessary dependencies
* no duplicated components
* no hardcoded repeated values

---

# 51. PERFORMANCE

Keep the initial bundle reasonable.

Use:

* lazy loading
* route-based code splitting
* memoization where useful
* efficient graph rendering
* debounced expensive calculations
* Web Workers if a future simulation becomes computationally heavy

Do not optimize prematurely.

But avoid obvious performance problems such as recalculating thousands of points on every keystroke unnecessarily.

---

# 52. EDUCATIONAL UX

Every simulation should answer three questions:

### What am I changing?

Example:

```text
Resistance R
```

### What is happening?

Example:

```text
Increasing R reduces current.
```

### Why is it happening?

Example:

```text
Ohm's Law:

I = V / R
```

The application should teach, not merely calculate.

---

# 53. MICROCOPY

Use concise engineering language.

Good:

```text
Increase resistance
Reset simulation
Show frequency spectrum
Save experiment
```

Avoid:

```text
Click this amazing button to do something cool!
```

The interface should feel professional.

---

# 54. SAMPLE EXPERIMENT LIBRARY

Populate the initial application with realistic examples.

### Circuit Lab

1. Ohm's Law
2. Voltage Divider
3. RC Charging
4. RC Discharging
5. RL Response
6. RLC Resonance

### Signals

1. Sine Wave
2. Square Wave
3. Signal Operations
4. Time Shifting
5. Convolution
6. Fourier Spectrum

### Digital

1. Logic Gates
2. Half Adder
3. Full Adder
4. Multiplexer
5. JK Flip-Flop
6. Counter

### Control

1. First Order System
2. Second Order System
3. Step Response
4. Pole-Zero Plot
5. Bode Plot

---

# 55. LANDING EXPERIENCE

The first visit should feel impressive.

Use:

```text
E-LAB

Interactive Engineering Laboratory

Learn. Build. Simulate. Understand.

[ Start Experiment ]

[ Explore Labs ]
```

Below:

```text
Interactive Simulations
Real-time Visualization
Engineering Tools
Digital Circuit Builder
```

Then show a preview of the laboratory interface.

Do not make the landing page excessively long.

The application itself should be the focus.

---

# 56. DESIGN DETAILS

Use subtle technical motifs:

* tiny grid patterns
* measurement ticks
* waveform traces
* circuit-node decorations
* thin separators
* numerical readouts
* subtle coordinate labels

These should support the engineering identity without becoming visual noise.

---

# 57. DARK MODE

Dark mode is the primary design.

Also support light mode.

Theme preference should persist using localStorage.

Use:

```text
System
Light
Dark
```

---

# 58. COMMAND SHORTCUTS

Support:

```text
Ctrl + K     Command Palette
Ctrl + S     Save Experiment
Ctrl + R     Reset Simulation
Esc          Close Modal / Panel
```

Do not override browser shortcuts unnecessarily.

---

# 59. DEMO DATA

The application should ship with meaningful demo data.

Do not display:

```text
Lorem ipsum
Test User
Example Project
```

Instead:

```text
RC Low-Pass Filter
Fourier Series Analysis
JK Flip-Flop
RLC Resonance
```

---

# 60. NO FAKE BACKEND

Do not create fake API calls such as:

```text
fetch('/api/experiments')
```

if there is no backend.

For the initial version use:

```text
Static data
React state
Zustand
localStorage
```

This guarantees GitHub Pages compatibility.

---

# 61. FUTURE EXTENSIBILITY

Architect the application so the following can be added later:

* user authentication
* cloud synchronization
* collaborative circuits
* online experiment sharing
* AI assistant
* backend simulations
* teacher dashboards
* student accounts
* assignment mode
* automatic grading
* public experiment library

These should be future capabilities, not dependencies of version 1.

---

# 62. IMPLEMENTATION PRIORITY

Do NOT attempt every feature simultaneously.

Build in this order:

## Milestone 1

Foundation:

* Vite
* React
* TypeScript
* Tailwind
* routing
* application shell
* design system
* responsive layout

## Milestone 2

Dashboard:

* hero
* lab cards
* statistics
* recent experiments
* progress

## Milestone 3

Signals:

* signal generator
* waveform rendering
* parameters
* signal operations

## Milestone 4

Digital:

* logic gates
* truth tables
* circuit builder

## Milestone 5

Circuits:

* Ohm's Law
* RC
* RL
* RLC

## Milestone 6

Control:

* transfer functions
* step response
* Bode plots

## Milestone 7

Experiment system:

* save
* load
* reset
* export
* local persistence

## Milestone 8

Polish:

* animations
* accessibility
* keyboard shortcuts
* mobile
* performance
* error states

## Milestone 9

Deployment:

* GitHub Actions
* GitHub Pages
* production build verification

---

# 63. ANTIGRAVITY WORKFLOW

When working on this project, do not generate everything at once.

Follow this workflow:

```text
PLAN
 ↓
IMPLEMENT
 ↓
RUN
 ↓
TEST
 ↓
INSPECT
 ↓
FIX
 ↓
POLISH
```

Before implementing a major feature:

1. Inspect existing architecture.
2. Determine which components can be reused.
3. Determine required state.
4. Determine simulation logic.
5. Implement the smallest working version.
6. Run the application.
7. Check for errors.
8. Improve the UI.
9. Test edge cases.
10. Only then move to the next feature.

---

# 64. IMPORTANT VIBE-CODING RULE

Do not blindly trust generated code.

For every mathematical simulation:

* verify the equation
* verify units
* test known values
* test boundary conditions
* test zero values where mathematically valid
* test invalid values
* compare results against known engineering relationships

For example:

```text
Ohm's Law

V = IR

If:
V = 12 V
R = 1000 Ω

Then:
I = 0.012 A
  = 12 mA
```

The UI must not look correct while producing incorrect engineering results.

---

# 65. ENGINEERING ACCURACY

Accuracy is more important than visual effects.

Do not fabricate formulas.

Do not silently approximate results where the approximation materially affects the educational result.

Where numerical methods are used, document the method.

---

# 66. TESTING

At minimum, test:

### Mathematical logic

```text
Ohm's Law
RC response
RLC resonance
signal generation
Fourier calculations
logic gates
flip-flops
```

### UI

```text
navigation
theme
responsive layout
modals
command palette
saving
loading
errors
```

### Deployment

Run:

```bash
npm run build
```

The production build must succeed without errors.

Then:

```bash
npm run preview
```

and manually test the production build.

---

# 67. FINAL ACCEPTANCE CRITERIA

The project is considered successful only when:

### Design

* [ ] Looks like a premium engineering product
* [ ] Consistent visual system
* [ ] Excellent dark mode
* [ ] Responsive
* [ ] No visual clutter
* [ ] Smooth but restrained animations

### Functionality

* [ ] Dashboard works
* [ ] Circuit experiments work
* [ ] Signal generator works
* [ ] Digital logic works
* [ ] Experiment system works
* [ ] Local persistence works
* [ ] Charts update interactively

### Engineering

* [ ] Calculations verified
* [ ] Units correct
* [ ] Edge cases handled
* [ ] Simulation logic separated from UI

### Code

* [ ] TypeScript
* [ ] Reusable components
* [ ] Feature-oriented structure
* [ ] No unnecessary duplication
* [ ] No console errors

### Deployment

* [ ] `npm run build` succeeds
* [ ] `dist/` generated
* [ ] GitHub Actions workflow exists
* [ ] GitHub Pages deployment works
* [ ] Repository subpath works
* [ ] Assets load correctly
* [ ] Client-side navigation works

---

# 68. WHAT NOT TO DO

Never turn this project into:

❌ A generic dashboard

❌ A collection of basic calculators

❌ A static textbook

❌ A fake simulation with random numbers

❌ A giant single React component

❌ A backend-dependent application

❌ A neon cyberpunk UI

❌ A template-looking SaaS dashboard

❌ A project full of placeholder data

❌ A project that requires an API key just to function

---

# 69. THE PRODUCT FEEL

When a user opens E-Lab, the feeling should be:

> "This looks like professional engineering software."

When they open a simulation:

> "I can actually experiment with this."

When they change a parameter:

> "I can immediately see why the result changed."

When they inspect the code:

> "This is a properly engineered frontend application."

---

# 70. INITIAL BUILD INSTRUCTION

Start by implementing ONLY the foundation and dashboard.

Do not implement all laboratory simulations immediately.

First create:

1. Vite + React + TypeScript project
2. Tailwind CSS
3. Design token system
4. Application shell
5. Sidebar
6. Top navigation
7. Command palette
8. Routing
9. Dashboard
10. Theme system
11. Responsive layout
12. GitHub Pages deployment configuration
13. GitHub Actions workflow

Then verify:

```bash
npm run build
```

before continuing.

After the foundation is stable, implement the laboratory modules one at a time.

---

# 71. FINAL PRINCIPLE

Build E-Lab as if it were going to be used by thousands of engineering students.

Prioritize:

```text
Correctness
     ↓
Usability
     ↓
Clarity
     ↓
Interaction
     ↓
Visual polish
```

Never sacrifice engineering correctness merely to make the interface look impressive.

The goal is not to build the largest application.

The goal is to build the **best interactive engineering laboratory experience possible in a browser.**

---

## Product tagline

> **E-Lab — Learn. Build. Simulate. Understand.**

## Suggested repository name

```text
e-lab
```

or:

```text
interactive-engineering-lab
```
