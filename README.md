<div align="center">

# ⚡ E-Lab — Interactive Engineering Laboratory
### *Explore. Build. Simulate. Understand.*

An advanced, production-grade browser-based engineering laboratory designed for Electrical and Computer Engineering (ECE) students and researchers. Features real-time deterministic physics simulations, dynamic signal visualization, interactive digital logic synthesis, control systems analysis, and a comprehensive engineering toolbox.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-Math%20Engine-00d084?logo=latex)](https://katex.org/)
[![Static PWA](https://img.shields.io/badge/Deployment-GitHub%20Pages%20Ready-success)](https://pages.github.com/)

[**Live Demo**](https://kankonnil007.github.io/Machine-Learning-Journey/) • [**Report Bug**](https://github.com/KankonNil007/Machine-Learning-Journey/issues) • [**Request Feature**](https://github.com/KankonNil007/Machine-Learning-Journey/issues)

</div>

---

## 📑 Table of Contents

- [Overview & Core Vision](#-overview--core-vision)
- [Key Features at a Glance](#-key-features-at-a-glance)
- [Laboratory Modules](#-laboratory-modules)
  - [1. Circuit Laboratory](#1-circuit-laboratory)
  - [2. Signals & Systems](#2-signals--systems)
  - [3. Digital Electronics](#3-digital-electronics)
  - [4. Control Systems](#4-control-systems)
  - [5. Engineering Toolbox](#5-engineering-toolbox)
  - [6. E-Lab AI Assistant & Command Hub](#6-e-lab-ai-assistant--command-hub)
- [Cross-Device Responsiveness](#-cross-device-responsiveness)
- [Technical Architecture](#-technical-architecture)
- [Mathematical Precision & Simulation Engines](#-mathematical-precision--simulation-engines)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Getting Started & Local Development](#-getting-started--local-development)
- [GitHub Pages Static Deployment](#-github-pages-static-deployment)
- [Project Directory Structure](#-project-directory-structure)
- [License](#-license)

---

## 🔭 Overview & Core Vision

Traditional engineering education often relies on static textbook equations or bulky desktop software that disconnects mathematics from real-time intuition. **E-Lab** bridges this gap by transforming theoretical equations into **living, interactive simulations**.

### Guiding Principles:
* **Interaction > Visualization > Explanation > Calculation**: Sliders and controls provide instantaneous visual and mathematical feedback.
* **100% Client-Side Architecture**: Pure deterministic TypeScript simulation engines execute entirely in the browser with **zero server dependencies**—enabling offline static deployment on GitHub Pages.
* **Engineering-First Aesthetic**: Dark-first terminal theme inspired by modern digital oscilloscopes and precision laboratory instruments, paired with KaTeX mathematical typography.

---

## 🚀 Key Features at a Glance

| Feature Domain | Capabilities |
| :--- | :--- |
| **Circuit Simulation** | DC V-I load lines, RC/RL time constants, RLC resonance, Diode I-V, Half/Full-Wave rectifiers with ripple analysis |
| **Signals & Waveforms** | Multi-waveform synthesis, continuous transforms (time-shift, scaling, inversion), Fourier harmonics, linear convolution |
| **Digital Logic** | TTL logic gates with propagation delay, SR/D/JK/T flip-flops, drag-and-drop circuit canvas, 4-bit counters with 7-segment display |
| **Control Theory** | 2nd-order transfer functions, transient specs ($M_p, t_r, t_s, t_p$), Bode magnitude/phase plots, s-plane pole-zero trajectories, closed-loop SISO builder |
| **Component Toolbox** | Full scientific calculator, MOSFET Level-1 SPICE analyzer, BJT voltage divider bias, EIA capacitor decoder, 4-band resistor color decoder, matrix algebra |
| **Command Hub & AI** | Quick launcher (`Ctrl + K`), offline engineering AI assistant, local session storage, JSON/CSV curriculum export |

---

## 🔬 Laboratory Modules

### 1. Circuit Laboratory
*Interactive analysis of electric circuits and passive networks.*

* **Ohm's Law & Power Dissipation**: Linear $V = I \cdot R$ dynamic load line, power dissipation $P = V \cdot I = I^2 R$, and active thermal overload alerts.
* **RC Transient Response**: Step and pulse voltage stimulus, exponential charging/discharging curves:
  $$v_C(t) = V_{in}(1 - e^{-t / \tau}), \quad \tau = R \cdot C, \quad f_c = \frac{1}{2\pi R C}$$
* **RL Transient Response**: Magnetic energy storage, inductive current growth and decay, back-EMF voltage spikes:
  $$i_L(t) = \frac{V_{in}}{R}(1 - e^{-t / \tau}), \quad \tau = \frac{L}{R}$$
* **RLC Series Resonance**: Second-order RLC network frequency sweep, impedance minimum, phase shift, resonant frequency $f_0$, Quality Factor $Q$, and bandwidth $\Delta f$:
  $$\omega_0 = \frac{1}{\sqrt{LC}}, \quad Q = \frac{1}{R}\sqrt{\frac{L}{C}}, \quad \zeta = \frac{R}{2}\sqrt{\frac{C}{L}}$$
* **Diode & Rectifier Circuits**: Silicon, Germanium, and Schottky barrier diode models. Compare **Half-Wave** vs. **Full-Wave Center-Tapped / Bridge Rectifiers** with filter capacitance $C$ and DC ripple factor $\gamma$:
  $$V_{dc} = \frac{2V_m}{\pi} - 2V_D, \quad V_{\text{ripple(p-p)}} \approx \frac{I_{dc}}{2f C}, \quad \gamma = \frac{1}{2\sqrt{3} f R_L C}$$

---

### 2. Signals & Systems
*Continuous signal synthesis, harmonic analysis, and linear time-invariant (LTI) operations.*

* **Waveform Synthesis Engine**: High-fidelity sine, square (50% duty cycle), triangle, sawtooth, and chirp waveforms with real-time frequency, amplitude, and DC offset modulation.
* **Signal Transformations**: Interactive parameter sliders for time-shifting $x(t - t_0)$, time-scaling $x(a \cdot t)$, amplitude scaling $A \cdot x(t)$, and time-reversal $x(-t)$.
* **Fourier Series Decomposition**: Synthesizes periodic waveforms from harmonic sinusoidal components up to $N = 25$. Visualizes the **Gibbs phenomenon** at discontinuous transitions and plots harmonic line spectra $|c_n|$.
* **Linear Convolution Visualizer**: Step-by-step graphical convolution of input signal $x(t)$ with impulse response $h(t)$:
  $$y(t) = (x * h)(t) = \int_{-\infty}^{\infty} x(\tau)h(t - \tau) \, d\tau$$

---

### 3. Digital Electronics
*Combinational logic design, sequential state machines, and canvas breadboarding.*

* **TTL 74LS Logic Gates**: Real-time evaluation of AND, OR, NOT, NAND, NOR, XOR, and XNOR gates with live truth tables, Boolean algebra identities, and propagation delay modeling ($t_{pd} \approx 10\text{ ns}$).
* **Sequential Flip-Flops**: Edge-triggered SR, D, JK (with toggle and indeterminate state handling), and T flip-flops with clock pulse timing diagrams.
* **Interactive Digital Circuit Builder**:
  * Freeform drag-and-drop workspace with radial grid alignment.
  * Multi-input gate nodes and live LED output probes.
  * Bezier wire routing with animated signal propagation dots.
  * Mobile touch-drag support and horizontal panning.
  * Pre-loaded presets: Half Adder, Full Adder, 2:1 Multiplexer.
* **4-Bit Digital Counter & 7-Segment Display**:
  * Modulo-16 Up/Down, Modulo-10 BCD Decade, 4-Bit Ring, and 8-State Johnson counters.
  * Dynamic common-cathode 7-segment SVG display with glowing segment polygons.
  * 4-Bit binary LED indicators ($Q_3 \rightarrow Q_0$) with decimal and hexadecimal readouts.
  * Multi-channel frequency-divided timing diagrams.

---

### 4. Control Systems
*Frequency-domain and time-domain analysis of dynamic feedback systems.*

* **Standard Second-Order Transfer Function**:
  $$G(s) = \frac{\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}$$
* **Transient Response Metrics**: Real-time numerical integration computing:
  * **Percent Overshoot ($M_p$)**: $M_p = e^{-\frac{\pi\zeta}{\sqrt{1-\zeta^2}}} \times 100\%$
  * **Rise Time ($t_r$)**: $t_r \approx \frac{1.8}{\omega_n}$
  * **Peak Time ($t_p$)**: $t_p = \frac{\pi}{\omega_n\sqrt{1-\zeta^2}}$
  * **Settling Time ($t_s$)**: $t_s \approx \frac{4}{\zeta\omega_n}$ (2% criterion)
* **Bode Plot Analyzer**: Dual logarithmic frequency response showing asymptotic and exact Magnitude ($20\log_{10}|G(j\omega)|$ dB) and Phase ($\angle G(j\omega)^\circ$) across 4 decades ($0.1\text{ to }1000\text{ rad/s}$).
* **S-Plane Pole-Zero Constellation**: Root locus mapping of closed-loop poles $s_{1,2} = -\zeta\omega_n \pm j\omega_n\sqrt{1-\zeta^2}$. Highlights un-damped ($\zeta = 0$), under-damped ($0 < \zeta < 1$), critically damped ($\zeta = 1$), and over-damped ($\zeta > 1$) stability regimes.
* **Closed-Loop SISO Block Diagram Builder**: Interactive feedback control loop with Proportional-Integral (PI) controller $C(s) = K_p + \frac{K_i}{s}$, second-order plant $G(s)$, and sensor gain $H$. Solves real-time system ODEs via Runge-Kutta integration.

---

### 5. Engineering Toolbox
*Precision calculators and component decoders for benchtop engineering.*

* **Scientific Engineering Calculator**:
  * Arithmetic: $+$, $-$, $\times$, $\div$, $\%$, $\pm$.
  * Scientific: $\sin, \cos, \tan, \sin^{-1}, \cos^{-1}, \tan^{-1}, \ln, \log_{10}, \sqrt{x}, x^2, x^y, e^x, 10^x, 1/x$.
  * Engineering constants: $\pi, e$.
  * SI Engineering Metric Prefixes: $\text{G } (10^9), \text{M } (10^6), \text{k } (10^3), \text{m } (10^{-3}), \mu (10^{-6}), \text{n } (10^{-9}), \text{p } (10^{-12})$.
  * Deg/Rad angle modes, parentheses, memory registers (MC, MR, M+, M-), and collapsible tape reel history.
  * **Adaptive Mobile Layout**: 4-column numeric keypad with dedicated function ribbons on mobile; full 8-column layout on desktop.
* **MOSFET Level-1 SPICE Transistor Lab**:
  * Simulates NMOS and PMOS enhancement-mode transistors across **Cutoff**, **Triode (Linear)**, and **Saturation** regions:
    $$I_D = \begin{cases} 0 & V_{GS} < V_{TH} \\ k_n \left[(V_{GS} - V_{TH})V_{DS} - \frac{V_{DS}^2}{2}\right](1 + \lambda V_{DS}) & V_{DS} < V_{GS} - V_{TH} \\ \frac{k_n}{2}(V_{GS} - V_{TH})^2(1 + \lambda V_{DS}) & V_{DS} \ge V_{GS} - V_{TH} \end{cases}$$
  * Plots multi-trace $I_D \text{ vs } V_{DS}$ family curves with dashed parabolic pinch-off boundary ($V_{DS} = V_{GS} - V_{TH}$) and live quiescent Q-point marker.
  * Readouts: Transconductance $g_m$, small-signal output resistance $r_o$, overdrive voltage $V_{ov}$, and power dissipation $P_D$.
* **BJT Voltage Divider Bias Calculator**: DC load line analysis, Thevenin equivalent base network, base current $I_B$, collector current $I_C$, and active vs. saturation verification ($V_{CE} \ge 0.2\text{ V}$).
* **EIA 3-Digit Capacitor Code Decoder**: Instant decoding of ceramic and film capacitor 3-digit markings (e.g., $104 \rightarrow 100\text{ nF} = 0.1\ \mu\text{F}$), EIA-198 tolerance letters ($\pm 1\%$ to $\pm 80\%$), and DC working voltage codes.
* **4-Band Resistor Color Code Decoder**: Standard IEC 60062 resistor color-band decoder with graphic resistor illustration, nominal resistance, tolerance bounds, and standard E12/E24 series checks.
* **Matrix Algebra Calculator**: 2x2 and 3x3 matrix computation of determinants ($\det A$), traces ($\text{tr}(A)$), characteristic polynomial eigenvalues ($\lambda_i$), matrix addition ($A + B$), matrix multiplication ($A \times B$), and analytic inverse ($A^{-1}$).
* **Integral Transforms Explorer**: Interactive reference for Laplace and Fourier transform duality pairs (Step, Exponential, Sine, Cosine, Rectangular pulse, Triangular pulse, Gaussian) with time-domain waveforms and Region of Convergence (ROC) / frequency spectra.
* **Quick Tools**: Voltage & current dividers, passive series/parallel combinations ($R, C, L$), active/passive filter cutoff frequencies, Op-Amp gain configurations (inverting, non-inverting, differential), and decibel voltage/power gain conversions.

---

### 6. E-Lab AI Assistant & Command Hub

* **Local Engineering AI Assistant**:
  * Context-aware engineering guidance embedded directly in the laboratory workspace.
  * Explains physics principles, derives formulas, and answers "What happens if I increase $R$?" questions deterministically without external cloud dependencies.
  * Optional user-supplied API key support for external LLM models (Google Gemini / OpenAI).
* **Global Command Palette (`Ctrl + K` / `Cmd + K`)**:
  * Fuzzy search navigation across all laboratories, simulators, calculators, and curriculum topics.
  * Quick theme toggle, reset commands, and instant routing.
* **Curriculum & Data Management**:
  * Tracks completed experiments in browser local storage (`localStorage`).
  * One-click curriculum progress export in **JSON** and **CSV** formats.
  * Print-ready stylesheet for laboratory assignments.

---

## 📱 Cross-Device Responsiveness

E-Lab is engineered to deliver a seamless experience across all viewports:

| Device Category | Typical Width | Responsive Behavior |
| :--- | :--- | :--- |
| **Mobile Phones** | 320px – 480px | Compact navigation drawer, full-width touch-scrollable tab bars (`scrollbar-none`), 4-column adaptive calculator keypad with quick function ribbon, horizontally pannable circuit canvases (`touch-pan-x`), and stacked metrics cards. |
| **Tablets** | 768px – 1024px | 2-column parameter/graph splits, collapsible sidebar navigation, responsive Recharts SVG containers. |
| **Desktop Workstations** | 1200px+ | Full multi-column dashboard, expanded 8-column scientific calculator workstation, expanded SVG schematic layouts, and keyboard shortcut acceleration. |

---

## 🏗️ Technical Architecture

E-Lab adopts a modular, decoupled frontend architecture designed for maintainability and deterministic numerical evaluation:

```text
src/
├── components/
│   ├── common/             # CommandPalette, MathematicalFormula (KaTeX), WaveformVisualizer
│   ├── layout/             # AppShell (Sidebar, TopNav, MobileDrawer, Footer)
│   └── ui/                 # Atomic UI components (Card, Button, Badge, Slider, Input)
├── data/                   # EXPERIMENTS_CATALOG and LAB_MODULES metadata
├── features/
│   ├── assistant/          # AIAssistantModal (Offline engineering intelligence)
│   ├── circuits/           # CircuitLabPage (Ohm, RC, RL, RLC, Rectifiers)
│   ├── control/            # ControlLabPage & BlockDiagramBuilder
│   ├── dashboard/          # DashboardPage & analytics overview
│   ├── digital/            # DigitalLabPage, DigitalCircuitBuilder, DigitalCounter
│   ├── experiments/        # ExperimentsPage (Curriculum & export hub)
│   ├── settings/           # SettingsPage (Theme, simulation precision)
│   ├── signals/            # SignalsLabPage (Generator, Fourier, Convolution)
│   └── tools/              # ScientificCalculator, MosfetCalculator, MatrixCalculator, etc.
├── lib/
│   ├── simulation/         # Pure TypeScript physics engines (Decoupled from UI)
│   │   ├── circuits/       # ohmsLaw, rcTransient, rlTransient, rlcResonance, rectifier, mosfet
│   │   ├── control/        # transferFunction, bodePlot, poleZero
│   │   ├── digital/        # logicGates, flipFlops, counter
│   │   └── signals/        # waveform, fourier, convolution
│   └── utils.ts            # Metric formatters (formatResistance, formatCapacitance, etc.)
└── store/                  # useAppStore (Zustand state with localStorage sync)
```

### Key Architectural Strengths:
* **Separation of Concerns**: Numerical ODE solvers, SPICE equations, and Boolean evaluation are isolated in `src/lib/simulation/` as pure functions, facilitating unit testing and zero React coupling.
* **Predictable State Management**: Zustand handles global UI state (theme, sidebar collapse, completed experiments, active recent sessions) synchronized with `localStorage`.
* **Zero UI Layout Shifts**: Recharts graphs are wrapped in responsive containers with explicit aspect ratios and coordinate bounds.

---

## 🧮 Mathematical Precision & Simulation Engines

Simulation engines adhere to standard physical constants and engineering conventions:

| Constant / Parameter | Symbol | Value |
| :--- | :--- | :--- |
| **Speed of Light** | $c$ | $2.99792458 \times 10^8\text{ m/s}$ |
| **Elementary Charge** | $q$ | $1.602176634 \times 10^{-19}\text{ C}$ |
| **Boltzmann Constant** | $k_B$ | $1.380649 \times 10^{-23}\text{ J/K}$ |
| **Thermal Voltage ($300\text{ K}$)** | $V_T$ | $25.85\text{ mV}$ |
| **Silicon Barrier Potential** | $V_D$ | $0.7\text{ V}$ |
| **Germanium Barrier Potential** | $V_D$ | $0.3\text{ V}$ |

Engineering units automatically format using standard SI prefixes:
`1,000 Ω → 1.00 kΩ`, `0.000001 F → 1.00 µF`, `0.000000001 H → 1.00 nH`.

---

## ⌨️ Keyboard Shortcuts

Speed up your laboratory workflow with system-wide hotkeys:

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Toggle Global Command Hub | Global |
| `Ctrl + S` / `Cmd + S` | Save Current Experiment Configuration | Global |
| `Alt + R` / `Ctrl + Shift + R` | Reset Active Simulation Parameters | Active Lab |
| `Esc` | Close Modal / Command Palette / AI Assistant | Modals |

---

## 💻 Getting Started & Local Development

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KankonNil007/Machine-Learning-Journey.git
   cd Machine-Learning-Journey
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run TypeScript type checks & Production Build**:
   ```bash
   npm run build
   ```

5. **Preview the production bundle**:
   ```bash
   npm run preview
   ```

---

## 🌐 GitHub Pages Static Deployment

E-Lab is architected specifically for static deployment. The build configuration outputs to `dist/` with relative asset resolution (`base: './'`) and uses `HashRouter` for reliable client-side routing on GitHub Pages.

### Automated GitHub Actions Deployment
Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy E-Lab to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Static Distribution
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 👥 Author & Acknowledgments

* **Created by**: [Kankon Nil](https://github.com/KankonNil007)
* **Inspiration**: Traditional electrical engineering lab benches (Tektronix oscilloscopes, Keithley source meters, breadboard trainers).
* **Open Source Libraries**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [KaTeX](https://katex.org/), [Recharts](https://recharts.org/), [Lucide Icons](https://lucide.dev/), and [Zustand](https://github.com/pmndrs/zustand).

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with precision for engineers, students, and educators worldwide.</sub>
</div>
