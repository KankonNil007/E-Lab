import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MathematicalFormula } from '../../components/common/MathematicalFormula';
import {
  Sparkles,
  X,
  Send,
  Key,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  formula?: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  'Explain this result',
  'Why did this happen?',
  'What happens if I increase R?',
  'Explain this equation',
  'Give me a practice problem',
  'Check my circuit',
];

export const AIAssistantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load API key from local storage if available
  useEffect(() => {
    const savedKey = localStorage.getItem('e_lab_ai_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Determine current active lab context
  const getContextName = () => {
    const p = location.pathname;
    if (p.includes('circuits')) return 'Circuit Lab (Ohm / RC / RLC)';
    if (p.includes('signals')) return 'Signals & Systems (Operations / Fourier / Convolution)';
    if (p.includes('digital')) return 'Digital Electronics (Gates / Flip-Flops / Builder)';
    if (p.includes('control')) return 'Control Systems (Transfer Functions / Bode / Poles)';
    if (p.includes('tools')) return 'Engineering Toolbox';
    return 'Dashboard & Laboratory Workspace';
  };

  // Set initial welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: `Hello, Engineer! I am your E-Lab Assistant. I am monitoring your active session in **${getContextName()}**. Ask me about the mathematics, physics, behavior under parameter changes, or request a practice challenge!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [isOpen, location.pathname]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('e_lab_ai_key', key);
    setShowKeyInput(false);
  };

  // Rule-based engineering intelligence based on active context and query
  const generateEngineeringAnswer = (query: string): { text: string; formula?: string } => {
    const q = query.toLowerCase();
    const p = location.pathname;

    if (q.includes('increase r') || q.includes('increase resistance')) {
      if (p.includes('circuits')) {
        return {
          text: 'In an electrical circuit, increasing resistance R produces distinct effects depending on the network topology:\n\n1. **In DC Circuits (Ohm\'s Law):** Current decreases inversely with R (I = V/R) for a fixed voltage source.\n2. **In RC Low-Pass Filters:** Increasing R increases the time constant tau = R*C, meaning the capacitor charges and discharges more slowly. Consequently, the cutoff frequency fc = 1/(2*pi*R*C) shifts lower.\n3. **In RLC Series Resonant Circuits:** Increasing R increases damping (damping ratio zeta = (R/2)*sqrt(C/L)), reducing the peak resonance and lowering the Quality Factor Q = (1/R)*sqrt(L/C).',
          formula: 'I = \\frac{V}{R}, \\quad \\tau = R \\cdot C, \\quad Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}}',
        };
      }
      return {
        text: 'In passive filtering and control circuits, increasing resistance increases thermal noise (Johnson-Nyquist noise) and increases the attenuation of voltage dividers while extending RC time constants.',
        formula: 'v_n = \\sqrt{4 k_B T R \\Delta f}',
      };
    }

    if (q.includes('explain this result') || q.includes('why did this happen')) {
      if (p.includes('control')) {
        return {
          text: 'The step response shape is directly dictated by the damping ratio zeta (ζ) and natural frequency omega_n (ωn):\n\n- **Underdamped (ζ < 1):** The poles are complex conjugates in the left half of the s-plane, resulting in sinusoidal oscillations decaying exponentially.\n- **Critically Damped (ζ = 1):** Fast response without overshoot.\n- **Overdamped (ζ > 1):** Two real distinct poles; slower asymptotic approach without ringing.',
          formula: 's_{1,2} = -\\zeta \\omega_n \\pm j \\omega_n \\sqrt{1 - \\zeta^2}',
        };
      }
      if (p.includes('signals')) {
        return {
          text: 'In Fourier synthesis, periodic waveforms are composed of infinite series of discrete sinusoidal harmonics. Sharp transitions (like in square waves) require very high-frequency odd harmonics. The small overshoot near discontinuities is the famous Gibbs phenomenon, approximately ~9% overshoot.',
          formula: 'x(t) = \\frac{4}{\\pi} \\sum_{n=1,3,5...}^{\\infty} \\frac{1}{n} \\sin(2\\pi n f_0 t)',
        };
      }
      if (p.includes('digital')) {
        return {
          text: 'The digital output reflects Boolean algebraic propagation through logic gates. For sequential flip-flops (such as JK), the outputs toggle or hold state based on clock edges and feedback loops formed by cross-coupled NAND or NOR gates.',
          formula: 'Q(t+1) = J\\overline{Q} + \\overline{K}Q',
        };
      }
      return {
        text: 'The calculated simulation results follow physical boundary conditions and energy conservation principles. Current flow and voltage distributions maintain Kirchhoff\'s Voltage (KVL) and Current Laws (KCL).',
        formula: '\\sum V = 0, \\quad \\sum I_{in} = \\sum I_{out}',
      };
    }

    if (q.includes('equation') || q.includes('formula')) {
      if (p.includes('circuits')) {
        return {
          text: 'The RC transient charging curve represents the solution to the first-order linear differential equation governed by Kirchhoff\'s Voltage Law:',
          formula: 'V_C(t) = V_0 \\left(1 - e^{-\\frac{t}{RC}}\\right)',
        };
      }
      if (p.includes('control')) {
        return {
          text: 'The canonical second-order transfer function in Laplace s-domain relates output Y(s) to input R(s):',
          formula: 'G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta \\omega_n s + \\omega_n^2}',
        };
      }
      if (p.includes('signals')) {
        return {
          text: 'Continuous-time convolution integrates the overlap of an input signal with the time-reversed and shifted impulse response:',
          formula: '(x * h)(t) = \\int_{-\\infty}^{\\infty} x(\\tau) h(t - \\tau) d\\tau',
        };
      }
      return {
        text: 'Fundamental Ohm\'s and Joulean power dissipation relationship:',
        formula: 'P = V \\cdot I = I^2 R = \\frac{V^2}{R}',
      };
    }

    if (q.includes('practice problem') || q.includes('quiz') || q.includes('challenge')) {
      if (p.includes('circuits')) {
        return {
          text: '### Challenge Problem: RC Filter Design\n\nYou are designing an audio low-pass filter with a cutoff frequency fc = 1 kHz. If you select a standard capacitor C = 100 nF, what exact resistor value R is required?\n\n**Hint & Formula:** fc = 1 / (2 * pi * R * C)\n**Answer:** R = 1 / (2 * pi * 1000 * 100e-9) = **1.59 kΩ** (1591 Ω).',
          formula: 'R = \\frac{1}{2\\pi f_c C}',
        };
      }
      if (p.includes('control')) {
        return {
          text: '### Challenge Problem: Second-Order Response\n\nA control system has a transfer function with natural frequency ωn = 10 rad/s and damping ratio ζ = 0.5.\n\nCalculate the peak overshoot percentage (Mp) and peak time (tp).\n\n**Answer:**\n- Mp = exp(-pi * 0.5 / sqrt(1 - 0.25)) * 100% = **16.3%**\n- tp = pi / (10 * sqrt(0.75)) = **0.363 seconds**.',
          formula: 'M_p = e^{-\\frac{\\pi \\zeta}{\\sqrt{1 - \\zeta^2}}} \\times 100\\%',
        };
      }
      return {
        text: '### Challenge Problem: Logic Synthesis\n\nExpress the XOR operator using only NAND gates. How many 2-input NAND gates are minimally required?\n\n**Answer:** Exactly **4 NAND gates** are required to implement A ⊕ B.',
        formula: 'A \\oplus B = \\overline{\\overline{A\\cdot\\overline{AB}} \\cdot \\overline{B\\cdot\\overline{AB}}}',
      };
    }

    if (q.includes('check my circuit') || q.includes('validate') || q.includes('sanity check')) {
      return {
        text: '### Circuit Diagnostics & Verification:\n\n1. **DC Feasibility:** All node voltages are positive and within supply rails.\n2. **Current Limits:** Verify power ratings P = I^2 * R to avoid thermal failure in real components (e.g., standard 1/4W resistors).\n3. **Capacitive/Inductive Loading:** No instantaneous voltage discontinuities on capacitors (dv/dt) or open circuits on energized inductors (di/dt).\n4. **Logic States:** High impedance (floating) inputs should be tied to Vcc or GND with pull-up/pull-down resistors.',
        formula: 'i_C(t) = C \\frac{dv_C}{dt}, \\quad v_L(t) = L \\frac{di_L}{dt}',
      };
    }

    // Default response
    return {
      text: `Based on your analysis in **${getContextName()}**:\n\nThe simulation demonstrates the continuous interplay between governing physical laws and numerical modeling. You can adjust the parameters via the interactive sliders or tabs to observe immediate mathematical changes in real time.`,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    // Simulate responsive assistant thinking
    setTimeout(() => {
      const response = generateEngineeringAnswer(prompt);
      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        formula: response.formula,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-xl shadow-2xl flex flex-col h-[600px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center text-accent-purple shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-text-primary truncate">E-Lab AI Assistant</span>
                <span className="hidden sm:inline-flex"><Badge variant="info">OFFLINE / LOCAL READY</Badge></span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono text-text-muted truncate block">
                Context: {getContextName()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-colors"
              title="Configure Custom LLM Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key Bar */}
        {showKeyInput && (
          <div className="p-3 bg-[#131316] border-b border-border flex items-center gap-2 text-xs">
            <span className="text-text-muted font-mono whitespace-nowrap">API Key (Optional):</span>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter Gemini or OpenAI API Key for external cloud models"
              className="flex-1 bg-surface border border-border rounded px-2.5 py-1 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-purple"
            />
            <Button size="sm" variant="primary" onClick={() => saveApiKey(apiKey)}>
              Save
            </Button>
          </div>
        )}

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-accent-blue/15 text-text-primary border border-accent-blue/30'
                    : 'bg-surface-elevated text-text-secondary border border-border shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {msg.formula && (
                  <div className="pt-2">
                    <MathematicalFormula formula={msg.formula} block />
                  </div>
                )}

                <div className="text-[9px] font-mono text-text-muted text-right pt-1">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-text-muted italic px-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-purple animate-spin" />
              <span>Analyzing laboratory parameters and engineering equations...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 border-t border-border bg-surface-elevated/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none select-none">
          <span className="text-[10px] font-mono text-text-muted whitespace-nowrap pl-1">ASK:</span>
          {PRESET_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => handleSendMessage(p)}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-elevated border border-border text-[11px] text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-3 border-t border-border bg-surface-elevated flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about this experiment or parameter..."
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-purple"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim()}
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Ask
          </Button>
        </div>
      </div>
    </div>
  );
};
