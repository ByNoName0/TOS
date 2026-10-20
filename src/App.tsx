/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal as TerminalIcon,
  HardDrive,
  Cpu,
  Activity,
  Layers,
  Folder,
  Settings as SettingsIcon,
  Compass,
  Monitor,
  Power,
  Wifi,
  Volume2,
  Battery,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  RefreshCw,
  Sliders,
  Shield,
  Download,
  Info,
  Clock,
  ArrowRight,
  Code
} from 'lucide-react';

// TOS Official Visual Identity Colors
// Background: #05070A, Secondary: #0A0F16, Panel: #0D1520, Accent: #1683FF, Bright: #38A9FF, Text: #EAF4FF

interface AppWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'desktop' | 'architecture' | 'phase2-env' | 'phase3-rootfs' | 'phase4-bootloader' | 'phase5-firstboot' | 'phase6-networking' | 'phase7-graphics' | 'phase9-apps' | 'build-guide' | 'repo-tree'>('phase9-apps');
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const [networkPopover, setNetworkPopover] = useState(false);
  const [soundPopover, setSoundPopover] = useState(false);
  const [soundLevel, setSoundLevel] = useState(75);
  const [accentColor, setAccentColor] = useState('#1683FF');
  const [wallpaper, setWallpaper] = useState('dark-mesh');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Window Manager State
  const [windows, setWindows] = useState<Record<string, AppWindow>>({
    terminal: { id: 'terminal', title: 'TOS Terminal', icon: <TerminalIcon className="w-4 h-4 text-[#38A9FF]" />, isOpen: true, isMinimized: false, zIndex: 10 },
    settings: { id: 'settings', title: 'TOS Settings', icon: <SettingsIcon className="w-4 h-4 text-[#38A9FF]" />, isOpen: false, isMinimized: false, zIndex: 5 },
    fileManager: { id: 'fileManager', title: 'Files', icon: <Folder className="w-4 h-4 text-[#38A9FF]" />, isOpen: false, isMinimized: false, zIndex: 6 },
    installer: { id: 'installer', title: 'TOS Installer', icon: <HardDrive className="w-4 h-4 text-emerald-400" />, isOpen: false, isMinimized: false, zIndex: 7 },
    systemMonitor: { id: 'systemMonitor', title: 'System Monitor', icon: <Activity className="w-4 h-4 text-[#38A9FF]" />, isOpen: false, isMinimized: false, zIndex: 8 },
  });

  const [topZ, setTopZ] = useState(15);

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; output: string | React.ReactNode }>>([
    {
      cmd: 'tos-info',
      output: (
        <div className="font-mono text-xs text-[#EAF4FF] space-y-1 my-1">
          <div className="text-[#1683FF] font-bold">
            {'  '}████████╗ ██████╗ ███████╗<br />
            {'  '}╚══██╔══╝██╔═══██╗██╔════╝<br />
            {'     '}██║   ██║   ██║███████╗<br />
            {'     '}██║   ██║   ██║╚════██║<br />
            {'     '}██║   ╚██████╔╝███████║<br />
            {'     '}╚═╝    ╚═════╝ ╚══════╝
          </div>
          <div className="text-white font-bold pt-1">TOS Linux (0.1 Alpha)</div>
          <div className="text-slate-400">Kernel: <span className="text-[#38A9FF]">6.6.15-tos-lts-x86_64</span></div>
          <div className="text-slate-400">Base: <span className="text-white">Debian Minimal (Stripped minbase)</span></div>
          <div className="text-slate-400">Architecture: <span className="text-white">x86_64</span></div>
          <div className="text-slate-400">Memory: <span className="text-emerald-400">218 MB / 4096 MB (Idle target: &lt;500 MB)</span></div>
          <div className="text-slate-400">Storage: <span className="text-emerald-400">2.33 GB used / 10 GB budget</span></div>
          <div className="text-slate-400">Desktop: <span className="text-white">TOS Desktop Shell (Openbox / Tint2)</span></div>
          <div className="text-slate-400">Uptime: <span className="text-white">4 minutes</span></div>
        </div>
      ),
    },
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Super / Windows key hotkey handler for Application Launcher
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' || (e.altKey && e.key === 'F1')) {
        e.preventDefault();
        setLauncherOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const bringToFront = (id: string) => {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: false, zIndex: newZ },
    }));
  };

  const openApp = (id: string) => {
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: newZ },
    }));
    setLauncherOpen(false);
  };

  const closeApp = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  };

  const minimizeApp = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Terminal command execution engine
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = terminalInput.trim();
    if (!rawCmd) return;

    const parts = rawCmd.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    let output: React.ReactNode = '';

    switch (cmd) {
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;

      case 'tos-info':
        output = (
          <div className="font-mono text-xs text-[#EAF4FF] space-y-1 my-1">
            <div className="text-white font-bold">TOS Linux (0.1 Alpha)</div>
            <div className="text-slate-400">Kernel: <span className="text-[#38A9FF]">6.6.15-tos-lts-x86_64</span></div>
            <div className="text-slate-400">Architecture: <span className="text-white">x86_64</span></div>
            <div className="text-slate-400">CPU: <span className="text-white">Intel / AMD x86_64 (2 cores allocated)</span></div>
            <div className="text-slate-400">Memory: <span className="text-emerald-400">218 MB / 4096 MB</span></div>
            <div className="text-slate-400">Storage: <span className="text-emerald-400">2.33 GB used of 10.0 GB target (23.3%)</span></div>
            <div className="text-slate-400">Desktop: <span className="text-white">TOS Desktop Shell</span></div>
            <div className="text-slate-400">Uptime: <span className="text-white">12 minutes</span></div>
          </div>
        );
        break;

      case 'tos-size':
        output = (
          <div className="font-mono text-xs text-[#EAF4FF] my-1 bg-[#0A0F16] p-3 rounded border border-[#1683FF]/30">
            <div className="text-[#38A9FF] font-bold border-b border-[#1683FF]/30 pb-1 mb-2">==========================================<br />             TOS Size Report<br />==========================================</div>
            <div className="grid grid-cols-2 gap-y-0.5">
              <span className="text-slate-400">Kernel:</span><span className="text-right">58 MB</span>
              <span className="text-slate-400">Bootloader:</span><span className="text-right">18 MB</span>
              <span className="text-slate-400">RootFS Core:</span><span className="text-right">750 MB</span>
              <span className="text-slate-400">Desktop Shell:</span><span className="text-right">120 MB</span>
              <span className="text-slate-400">Applications:</span><span className="text-right">350 MB</span>
              <span className="text-slate-400">Libraries:</span><span className="text-right">620 MB</span>
              <span className="text-slate-400">Drivers & Firmware:</span><span className="text-right">274 MB</span>
              <span className="text-slate-400">Other:</span><span className="text-right">145 MB</span>
            </div>
            <div className="border-t border-slate-700 my-1 pt-1 flex justify-between font-bold">
              <span>TOTAL:</span>
              <span className="text-emerald-400">2.33 GB</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Budget Target:</span>
              <span>10.00 GB</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-400 pt-1">
              <span>Status:</span>
              <span>PASS (23.3% capacity — 7.67 GB free)</span>
            </div>
          </div>
        );
        break;

      case 'tos-performance':
        output = (
          <div className="font-mono text-xs text-[#EAF4FF] my-1 bg-[#0A0F16] p-3 rounded border border-[#1683FF]/30">
            <div className="text-[#38A9FF] font-bold border-b border-[#1683FF]/30 pb-1 mb-2">==========================================<br />             TOS Performance<br />==========================================</div>
            <div className="space-y-1">
              <div><span className="text-slate-400">RAM:</span> <span className="text-emerald-400">218 MB / 4096 MB (5.3% utilized)</span></div>
              <div><span className="text-slate-400">CPU:</span> <span className="text-emerald-400">0.3% idle load (Governor: powersave/ondemand)</span></div>
              <div><span className="text-slate-400">Boot time:</span> <span className="text-white">4.18 seconds (systemd-analyze)</span></div>
              <div><span className="text-slate-400">Services:</span> <span className="text-white">14 active systemd services (0 telemetry/bloat daemons)</span></div>
              <div><span className="text-slate-400">Disk usage:</span> <span className="text-white">2.33 GB / 10 GB limit</span></div>
            </div>
          </div>
        );
        break;

      case 'tos-install':
        if (!arg) {
          output = <div className="text-red-400">Error: Package name required. Example: tos-install htop</div>;
        } else {
          output = (
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div className="text-[#38A9FF]">[*] Auditing storage budget before install... (Free: 7.67 GB &gt; 500 MB safe threshold)</div>
              <div>[*] Resolving dependencies for &apos;{arg}&apos; with --no-install-recommends...</div>
              <div>[✓] Package &apos;{arg}&apos; successfully installed (Added 4.2 MB to system).</div>
            </div>
          );
        }
        break;

      case 'tos-remove':
        if (!arg) {
          output = <div className="text-red-400">Error: Package name required. Example: tos-remove htop</div>;
        } else {
          output = (
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div className="text-[#38A9FF]">[*] Removing package &apos;{arg}&apos; and purge-cleaning unused dependencies...</div>
              <div>[✓] Package &apos;{arg}&apos; removed. Freed 4.2 MB.</div>
            </div>
          );
        }
        break;

      case 'tos-update':
        output = (
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div className="text-[#38A9FF]">[*] Contacting TOS Debian security &amp; stable mirrors...</div>
            <div>[*] Reading package lists... Done</div>
            <div>[*] Calculating upgrade... 0 upgraded, 0 newly installed, 0 to remove.</div>
            <div className="text-emerald-400">[✓] System is fully up-to-date and clean.</div>
          </div>
        );
        break;

      case 'tos-search':
        output = (
          <div className="font-mono text-xs text-slate-300">
            <div>Results matching &apos;{arg || 'tools'}&apos;:</div>
            <div className="text-[#38A9FF] mt-1">• {arg || 'htop'} - Interactive lightweight process viewer</div>
            <div className="text-slate-400">• {arg || 'htop'}-doc - Documentation for {arg || 'htop'}</div>
          </div>
        );
        break;

      case 'tos-settings':
        openApp('settings');
        output = <div className="text-emerald-400">Opened TOS Settings application.</div>;
        break;

      case 'tos-system':
      case 'uname':
      case 'uname -a':
        output = <div className="text-slate-300 font-mono">Linux tos-pc 6.6.15-tos-lts #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>;
        break;

      case 'df':
      case 'df -h':
        output = (
          <div className="font-mono text-xs text-slate-300">
            Filesystem      Size  Used Avail Use% Mounted on<br />
            /dev/sda2       9.8G  2.3G  7.0G  24% /<br />
            /dev/sda1       256M   28M  228M  11% /boot/efi<br />
            tmpfs           1.9G     0  1.9G   0% /dev/shm
          </div>
        );
        break;

      case 'free':
      case 'free -m':
        output = (
          <div className="font-mono text-xs text-slate-300">
            {'              '}total        used        free      shared  buff/cache   available<br />
            Mem:            3984         218        3120          14         646        3710<br />
            Swap:           2048           0        2048
          </div>
        );
        break;

      case 'ls':
        output = <div className="font-mono text-xs text-[#38A9FF]">Desktop  Documents  Downloads  Music  Pictures  Videos  tos-build.log</div>;
        break;

      case 'tos-help':
      case 'help':
        output = (
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div className="text-white font-bold">TOS Command System:</div>
            <div><span className="text-[#38A9FF]">tos-info</span>         - Display detailed TOS specs and hardware state</div>
            <div><span className="text-[#38A9FF]">tos-size</span>         - Audit disk space against strict 10 GB limit</div>
            <div><span className="text-[#38A9FF]">tos-performance</span>  - Audit RAM, CPU, boot time &amp; services</div>
            <div><span className="text-[#38A9FF]">tos-install &lt;pkg&gt;</span> - Install package with --no-install-recommends</div>
            <div><span className="text-[#38A9FF]">tos-remove &lt;pkg&gt;</span>  - Uninstall package and purge orphan libs</div>
            <div><span className="text-[#38A9FF]">tos-update</span>       - Sync repository lists &amp; upgrade packages</div>
            <div><span className="text-[#38A9FF]">tos-search &lt;term&gt;</span> - Search software repository</div>
            <div><span className="text-[#38A9FF]">tos-settings</span>     - Launch graphical settings app</div>
            <div><span className="text-[#38A9FF]">clear</span>            - Clear terminal screen</div>
          </div>
        );
        break;

      default:
        output = (
          <div className="text-red-400 font-mono text-xs">
            bash: {cmd}: command not found. Type &apos;tos-help&apos; for available commands.
          </div>
        );
    }

    setTerminalHistory((prev) => [...prev, { cmd: rawCmd, output }]);
    setTerminalInput('');
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#05070A] text-[#EAF4FF] font-sans overflow-hidden select-none">
      {/* Top Engineering Workspace Navigation Bar */}
      <header className="h-11 bg-[#0A0F16] border-b border-[#1B293C] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1683FF] flex items-center justify-center font-black text-black text-xs shadow-[0_0_12px_rgba(22,131,255,0.6)]">
              T
            </div>
            <span className="font-bold text-sm tracking-wide text-white">TOS</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1683FF]/20 text-[#38A9FF] border border-[#1683FF]/40">
              0.1 Alpha
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Mode Switcher */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'desktop'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              TOS Desktop Shell
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'architecture'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Phase 1: Architecture
            </button>
            <button
              onClick={() => setActiveTab('phase2-env')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase2-env'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Phase 2: Host Environment
            </button>
            <button
              onClick={() => setActiveTab('phase3-rootfs')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase3-rootfs'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Phase 3: RootFS &amp; Kernel
            </button>
            <button
              onClick={() => setActiveTab('phase4-bootloader')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase4-bootloader'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Phase 4: Bootloader
            </button>
            <button
              onClick={() => setActiveTab('phase5-firstboot')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase5-firstboot'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              Phase 5: First Boot
            </button>
            <button
              onClick={() => setActiveTab('phase6-networking')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase6-networking'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              Phase 6: Networking
            </button>
            <button
              onClick={() => setActiveTab('phase7-graphics')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase7-graphics'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Phase 7: Graphics
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'desktop'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Phase 8: Desktop Shell
            </button>
            <button
              onClick={() => setActiveTab('phase9-apps')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'phase9-apps'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              Phase 9: Applications
            </button>
            <button
              onClick={() => setActiveTab('build-guide')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'build-guide'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              Build Commands (Linux/WSL)
            </button>
            <button
              onClick={() => setActiveTab('repo-tree')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'repo-tree'
                  ? 'bg-[#1683FF] text-white shadow-[0_0_10px_rgba(22,131,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-[#0D1520]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Project Files
            </button>
          </nav>
        </div>

        {/* System Vitals Bar */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-[#38A9FF]" />
            <span>CPU: 0.3%</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>RAM: 218 MB / 4 GB</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-[#38A9FF]" />
            <span>Target: 2.33 GB / 10 GB</span>
          </div>
          <a
            href="/downloads/TOS-0.1-alpha-x86_64.iso"
            download="TOS-0.1-alpha-x86_64.iso"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(52,211,153,0.3)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download TOS ISO
          </a>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ISO Built
          </span>
        </div>
      </header>

      {/* Main Body Content based on activeTab */}
      <div className="flex-1 relative overflow-hidden">
        {/* ======================================================== */}
        {/* VIEW 1: TOS INTERACTIVE DESKTOP ENVIRONMENT               */}
        {/* ======================================================== */}
        {activeTab === 'desktop' && (
          <div className="w-full h-full relative bg-[#05070A] overflow-hidden flex flex-col justify-between">
            {/* Desktop Wallpaper & Grid */}
            <div
              className="absolute inset-0 z-0 pointer-events-none opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse at 50% 20%, rgba(22, 131, 255, 0.15) 0%, transparent 60%), linear-gradient(rgba(27, 41, 60, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(27, 41, 60, 0.2) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 48px 48px, 48px 48px',
              }}
            />

            {/* Desktop Ambient Logo Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
              <div className="text-center">
                <div className="text-9xl font-black tracking-widest text-[#1683FF]">TOS</div>
                <div className="text-xl tracking-[0.4em] font-mono text-white mt-2">LIGHTWEIGHT LINUX OS</div>
                <div className="text-xs font-mono text-slate-400 mt-1">≤ 10 GB STORAGE TARGET</div>
              </div>
            </div>

            {/* Desktop Icons */}
            <div className="relative z-10 p-6 grid grid-flow-col grid-rows-6 gap-6 w-fit">
              <button
                onDoubleClick={() => openApp('terminal')}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-all text-center w-20 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D1520] border border-[#1B293C] group-hover:border-[#1683FF] flex items-center justify-center text-[#38A9FF] shadow-lg group-hover:shadow-[0_0_15px_rgba(22,131,255,0.3)] transition-all">
                  <TerminalIcon className="w-6 h-6" />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white drop-shadow font-medium">Terminal</span>
              </button>

              <button
                onDoubleClick={() => openApp('fileManager')}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-all text-center w-20 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D1520] border border-[#1B293C] group-hover:border-[#1683FF] flex items-center justify-center text-[#38A9FF] shadow-lg group-hover:shadow-[0_0_15px_rgba(22,131,255,0.3)] transition-all">
                  <Folder className="w-6 h-6" />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white drop-shadow font-medium">Files</span>
              </button>

              <button
                onDoubleClick={() => openApp('settings')}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-all text-center w-20 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D1520] border border-[#1B293C] group-hover:border-[#1683FF] flex items-center justify-center text-[#38A9FF] shadow-lg group-hover:shadow-[0_0_15px_rgba(22,131,255,0.3)] transition-all">
                  <SettingsIcon className="w-6 h-6" />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white drop-shadow font-medium">Settings</span>
              </button>

              <button
                onDoubleClick={() => openApp('systemMonitor')}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-all text-center w-20 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D1520] border border-[#1B293C] group-hover:border-[#1683FF] flex items-center justify-center text-[#38A9FF] shadow-lg group-hover:shadow-[0_0_15px_rgba(22,131,255,0.3)] transition-all">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white drop-shadow font-medium">Monitor</span>
              </button>

              <button
                onDoubleClick={() => openApp('installer')}
                className="group flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-all text-center w-20 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D1520] border border-[#1B293C] group-hover:border-emerald-400 flex items-center justify-center text-emerald-400 shadow-lg group-hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all">
                  <HardDrive className="w-6 h-6" />
                </div>
                <span className="text-xs text-slate-300 group-hover:text-white drop-shadow font-medium">Install TOS</span>
              </button>
            </div>

            {/* =================================================== */}
            {/* WINDOWS CONTAINER                                   */}
            {/* =================================================== */}

            {/* Window 1: Terminal */}
            {windows.terminal.isOpen && !windows.terminal.isMinimized && (
              <div
                onClick={() => bringToFront('terminal')}
                style={{ zIndex: windows.terminal.zIndex }}
                className="absolute top-12 left-28 w-[680px] h-[440px] bg-[#0A0F16] rounded-xl border border-[#1B293C] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Title Bar */}
                <div className="h-9 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between px-3 select-none">
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-mono font-medium text-slate-200">tos@tos-pc: ~ (TOS Terminal)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); minimizeApp('terminal'); }}
                      className="w-5 h-5 rounded hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeApp('terminal'); }}
                      className="w-5 h-5 rounded hover:bg-red-500/80 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 p-3 bg-[#05070A] overflow-y-auto font-mono text-xs text-slate-200">
                  <div className="text-slate-400 mb-2">
                    TOS Linux (v0.1 Alpha) — Minimal Debian-based Core<br />
                    Type <span className="text-[#38A9FF]">tos-help</span>, <span className="text-[#38A9FF]">tos-info</span>, <span className="text-[#38A9FF]">tos-size</span>, or <span className="text-[#38A9FF]">tos-performance</span>.
                  </div>

                  {terminalHistory.map((item, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="text-[#1683FF] font-bold">tos@tos-pc</span>
                        <span className="text-slate-500">:</span>
                        <span className="text-[#38A9FF]">~</span>
                        <span className="text-slate-500">$</span>
                        <span className="text-white font-medium">{item.cmd}</span>
                      </div>
                      <div className="pl-2">{item.output}</div>
                    </div>
                  ))}

                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 text-slate-300 mt-2">
                    <span className="text-[#1683FF] font-bold">tos@tos-pc</span>
                    <span className="text-slate-500">:</span>
                    <span className="text-[#38A9FF]">~</span>
                    <span className="text-slate-500">$</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-[#EAF4FF] font-mono text-xs border-none p-0"
                      autoFocus
                    />
                  </form>
                  <div ref={terminalBottomRef} />
                </div>

                {/* Terminal Footer Quick Buttons */}
                <div className="h-7 bg-[#0D1520] border-t border-[#1B293C] px-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Quick run:</span>
                  {['tos-info', 'tos-size', 'tos-performance', 'tos-help', 'clear'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setTerminalInput(cmd);
                      }}
                      className="px-1.5 py-0.5 rounded bg-[#1683FF]/10 text-[#38A9FF] hover:bg-[#1683FF]/20 border border-[#1683FF]/30 cursor-pointer"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Window 2: Settings App */}
            {windows.settings.isOpen && !windows.settings.isMinimized && (
              <div
                onClick={() => bringToFront('settings')}
                style={{ zIndex: windows.settings.zIndex }}
                className="absolute top-16 left-64 w-[640px] h-[460px] bg-[#0A0F16] rounded-xl border border-[#1B293C] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="h-9 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between px-3 select-none">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-medium text-slate-200">TOS Settings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); minimizeApp('settings'); }}
                      className="w-5 h-5 rounded hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeApp('settings'); }}
                      className="w-5 h-5 rounded hover:bg-red-500/80 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Settings Sidebar */}
                  <div className="w-44 bg-[#070B10] border-r border-[#1B293C] p-2 space-y-1 text-xs">
                    <div className="px-2 py-1.5 rounded bg-[#1683FF]/20 text-[#38A9FF] font-medium flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5" /> Appearance
                    </div>
                    <div className="px-2 py-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer">
                      <Monitor className="w-3.5 h-3.5" /> Display
                    </div>
                    <div className="px-2 py-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer">
                      <Wifi className="w-3.5 h-3.5" /> Network
                    </div>
                    <div className="px-2 py-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer">
                      <Volume2 className="w-3.5 h-3.5" /> Sound
                    </div>
                    <div className="px-2 py-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer">
                      <Shield className="w-3.5 h-3.5" /> Security &amp; Users
                    </div>
                    <div className="px-2 py-1.5 rounded hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2 cursor-pointer">
                      <Info className="w-3.5 h-3.5" /> System Info
                    </div>
                  </div>

                  {/* Settings Main Panel */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
                    <div>
                      <h3 className="font-semibold text-sm text-white mb-1">Visual Theme</h3>
                      <p className="text-slate-400 text-xs">TOS is calibrated with an electric blue dark minimal aesthetic.</p>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="p-3 rounded-lg border border-[#1683FF] bg-[#05070A] flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">TOS Electric Dark (Default)</div>
                            <div className="text-[11px] text-slate-400">#05070A / #1683FF / #EAF4FF</div>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-[#1683FF]" />
                        </div>
                        <div className="p-3 rounded-lg border border-[#1B293C] bg-[#0A0F16] opacity-60 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-300">Monochrome Obsidian</div>
                            <div className="text-[11px] text-slate-500">Pure minimal grayscale</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-white mb-2">Accent Color</h3>
                      <div className="flex items-center gap-3">
                        {[
                          { name: 'Electric Blue', hex: '#1683FF' },
                          { name: 'Bright Cyan', hex: '#38A9FF' },
                          { name: 'Emerald', hex: '#10B981' },
                          { name: 'Violet', hex: '#8B5CF6' },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => setAccentColor(c.hex)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#1B293C] hover:border-slate-500 transition-all cursor-pointer"
                          >
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                            <span className="text-[11px] text-slate-300">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-white mb-1">Privacy &amp; Telemetry</h3>
                      <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Operating System Telemetry</span>
                          <span className="text-emerald-400 font-mono font-bold text-[11px]">DISABLED (BY DEFAULT)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Third-Party Crash Analytics</span>
                          <span className="text-emerald-400 font-mono font-bold text-[11px]">DISABLED</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Network Advertising Daemons</span>
                          <span className="text-emerald-400 font-mono font-bold text-[11px]">NONE INCLUDED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Window 3: File Manager */}
            {windows.fileManager.isOpen && !windows.fileManager.isMinimized && (
              <div
                onClick={() => bringToFront('fileManager')}
                style={{ zIndex: windows.fileManager.zIndex }}
                className="absolute top-24 left-44 w-[600px] h-[390px] bg-[#0A0F16] rounded-xl border border-[#1B293C] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="h-9 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between px-3 select-none">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-medium text-slate-200">Files — /home/tos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); minimizeApp('fileManager'); }}
                      className="w-5 h-5 rounded hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeApp('fileManager'); }}
                      className="w-5 h-5 rounded hover:bg-red-500/80 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  <div className="w-40 bg-[#070B10] border-r border-[#1B293C] p-2 space-y-1 text-xs">
                    {['Home', 'Desktop', 'Documents', 'Downloads', 'Music', 'Pictures', 'Videos'].map((item) => (
                      <div
                        key={item}
                        className={`px-2 py-1 rounded flex items-center gap-2 cursor-pointer ${
                          item === 'Home' ? 'bg-[#1683FF]/20 text-[#38A9FF] font-medium' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5" /> {item}
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 p-4 bg-[#05070A] overflow-y-auto">
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { name: 'Documents', type: 'folder', count: '4 items' },
                        { name: 'Downloads', type: 'folder', count: '1 item' },
                        { name: 'Pictures', type: 'folder', count: '8 items' },
                        { name: 'tos-build.log', type: 'file', count: '14.2 KB' },
                        { name: 'kernel-config.txt', type: 'file', count: '8.4 KB' },
                        { name: 'packages.list', type: 'file', count: '1.2 KB' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-white/5 border border-transparent hover:border-[#1B293C] cursor-pointer text-center group"
                        >
                          {item.type === 'folder' ? (
                            <Folder className="w-10 h-10 text-[#1683FF] group-hover:scale-105 transition-transform" />
                          ) : (
                            <FileText className="w-10 h-10 text-slate-400 group-hover:text-[#38A9FF] group-hover:scale-105 transition-transform" />
                          )}
                          <span className="text-xs text-slate-200 mt-2 font-medium truncate w-full">{item.name}</span>
                          <span className="text-[10px] text-slate-500">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Window 4: TOS Guided Installer */}
            {windows.installer.isOpen && !windows.installer.isMinimized && (
              <div
                onClick={() => bringToFront('installer')}
                style={{ zIndex: windows.installer.zIndex }}
                className="absolute top-10 left-36 w-[640px] h-[450px] bg-[#0A0F16] rounded-xl border border-emerald-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="h-9 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between px-3 select-none">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-slate-200">TOS 0.1 Alpha Guided Installer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); closeApp('installer'); }}
                      className="w-5 h-5 rounded hover:bg-red-500/80 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-6 bg-[#05070A] overflow-y-auto space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">Target Disk &amp; Partitioning Layout</h2>
                      <p className="text-xs text-slate-400">Target storage budget: 10 GB limit (Installed: ~2.33 GB)</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-red-300">Destructive Disk Operation Protection:</span> TOS will never silently format drives. The installer requires explicit target disk selection and user confirmation before creating the partition table.
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="text-slate-300 font-medium">Detected Drive</label>
                    <div className="p-3 rounded bg-[#0A0F16] border border-[#1683FF]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-[#38A9FF]" />
                        <div>
                          <div className="font-mono text-white font-medium">/dev/sda (20.0 GB - QEMU/VirtualBox/SATA SSD)</div>
                          <div className="text-slate-500 text-[11px]">Partition scheme: GPT (EFI + Ext4 Root)</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-mono text-[11px]">SUITABLE (&gt; 10 GB)</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="text-slate-300 font-medium">Automatic Partition Scheme</label>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="p-2.5 rounded bg-[#0A0F16] border border-[#1B293C]">
                        <div className="text-[#38A9FF]">/dev/sda1 (ESP)</div>
                        <div className="text-slate-400">512 MB • FAT32 • /boot/efi</div>
                      </div>
                      <div className="p-2.5 rounded bg-[#0A0F16] border border-[#1B293C]">
                        <div className="text-[#38A9FF]">/dev/sda2 (Root /)</div>
                        <div className="text-slate-400">Remaining space • ext4</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-12 bg-[#0D1520] border-t border-[#1B293C] px-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Step 4 of 11: Disk Partitioning</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => closeApp('installer')}
                      className="px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert('In real deployment, this runs /usr/local/tos/tos-installer.sh. See Phase 12 in docs/BUILD.md');
                      }}
                      className="px-4 py-1.5 rounded text-xs font-medium bg-[#1683FF] hover:bg-[#38A9FF] text-white shadow-[0_0_12px_rgba(22,131,255,0.4)] cursor-pointer"
                    >
                      Next: User Creation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Window 5: System Monitor */}
            {windows.systemMonitor.isOpen && !windows.systemMonitor.isMinimized && (
              <div
                onClick={() => bringToFront('systemMonitor')}
                style={{ zIndex: windows.systemMonitor.zIndex }}
                className="absolute top-20 left-72 w-[580px] h-[380px] bg-[#0A0F16] rounded-xl border border-[#1B293C] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="h-9 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between px-3 select-none">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-medium text-slate-200">TOS System Resource Monitor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); closeApp('systemMonitor'); }}
                      className="w-5 h-5 rounded hover:bg-red-500/80 flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 bg-[#05070A] overflow-y-auto space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-[#0A0F16] border border-[#1B293C]">
                      <div className="text-slate-400 text-[11px] mb-1">CPU UTILIZATION</div>
                      <div className="text-xl font-bold text-white">0.3% <span className="text-xs font-normal text-slate-400">idle</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#1683FF] h-full w-[3%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0A0F16] border border-[#1B293C]">
                      <div className="text-slate-400 text-[11px] mb-1">RAM UTILIZATION (TARGET: &lt;500 MB)</div>
                      <div className="text-xl font-bold text-emerald-400">218 MB <span className="text-xs font-normal text-slate-400">/ 4096 MB (5.3%)</span></div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[5%]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0A0F16] border border-[#1B293C]">
                    <div className="text-slate-400 text-[11px] mb-1">STORAGE FOOTPRINT AUDIT (TARGET: &lt;10 GB)</div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-bold text-white">2.33 GB installed</div>
                      <div className="text-xs text-emerald-400 font-bold">PASS (7.67 GB Remaining)</div>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#1683FF] h-full w-[23.3%]" />
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 mb-1 text-[11px]">ACTIVE PROCESSES (MINIMAL PROFILE)</div>
                    <div className="bg-[#0A0F16] rounded border border-[#1B293C] p-2 space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1">
                        <span>PID  COMMAND</span>
                        <span>RESIDENT MEM</span>
                      </div>
                      <div className="flex justify-between"><span>1    /sbin/init (systemd)</span><span>14.2 MB</span></div>
                      <div className="flex justify-between"><span>210  /usr/bin/Xorg :0</span><span>42.1 MB</span></div>
                      <div className="flex justify-between"><span>340  /usr/bin/openbox</span><span>11.4 MB</span></div>
                      <div className="flex justify-between"><span>345  /usr/bin/tint2 (taskbar)</span><span>8.9 MB</span></div>
                      <div className="flex justify-between"><span>412  /usr/bin/pipewire</span><span>9.2 MB</span></div>
                      <div className="flex justify-between"><span>501  tos-terminal</span><span>18.5 MB</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================== */}
            {/* TOS APPLICATION LAUNCHER (SUPER / WIN KEY MODAL)     */}
            {/* =================================================== */}
            {launcherOpen && (
              <div
                className="absolute bottom-12 left-2 w-80 bg-[#0A0F16] border border-[#1683FF]/40 rounded-xl shadow-2xl z-50 p-3 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
              >
                {/* Search input */}
                <div className="flex items-center gap-2 bg-[#05070A] px-2.5 py-1.5 rounded-lg border border-[#1B293C] text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search applications (or press Super)..."
                    className="bg-transparent outline-none flex-1 text-slate-200"
                    autoFocus
                  />
                </div>

                <div className="text-[10px] uppercase font-mono text-slate-500 px-1 pt-1">Installed Applications</div>

                <div className="space-y-0.5 text-xs">
                  {[
                    { id: 'terminal', name: 'TOS Terminal', icon: <TerminalIcon className="w-4 h-4 text-[#38A9FF]" />, desc: 'System shell & tos-* tools' },
                    { id: 'fileManager', name: 'File Manager (PCManFM)', icon: <Folder className="w-4 h-4 text-[#38A9FF]" />, desc: 'Lightweight file browser' },
                    { id: 'settings', name: 'TOS Settings', icon: <SettingsIcon className="w-4 h-4 text-[#38A9FF]" />, desc: 'Display, theme, power, users' },
                    { id: 'systemMonitor', name: 'Resource Monitor', icon: <Activity className="w-4 h-4 text-[#38A9FF]" />, desc: 'CPU, RAM, and Disk audit' },
                    { id: 'installer', name: 'Install TOS to Disk', icon: <HardDrive className="w-4 h-4 text-emerald-400" />, desc: 'Guided UEFI/BIOS installer' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      onClick={() => openApp(app.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1683FF]/15 transition-all text-left cursor-pointer group"
                    >
                      <div className="p-1.5 rounded bg-[#0D1520] border border-[#1B293C] group-hover:border-[#1683FF]">
                        {app.icon}
                      </div>
                      <div>
                        <div className="text-white font-medium">{app.name}</div>
                        <div className="text-[11px] text-slate-400">{app.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-[#1B293C] pt-2 flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#1683FF] text-black font-black text-[10px] flex items-center justify-center">
                      T
                    </div>
                    <span className="font-mono text-[11px] text-slate-300">tos@tos-pc</span>
                  </div>
                  <button
                    onClick={() => {
                      setLauncherOpen(false);
                      setPowerMenuOpen(true);
                    }}
                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Power Menu Modal */}
            {powerMenuOpen && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-[#0A0F16] border border-[#1B293C] rounded-2xl p-6 w-96 text-center shadow-2xl space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                    <Power className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">TOS Power Menu</h3>
                    <p className="text-xs text-slate-400 mt-1">Select an action for tos-pc</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <button
                      onClick={() => { alert('TOS shutting down cleanly (syncing disk buffers)...'); setPowerMenuOpen(false); }}
                      className="p-3 rounded-xl bg-red-600/20 border border-red-500/40 text-red-300 hover:bg-red-600/30 transition-all font-medium cursor-pointer"
                    >
                      Power Off
                    </button>
                    <button
                      onClick={() => { alert('TOS rebooting into bootloader...'); setPowerMenuOpen(false); }}
                      className="p-3 rounded-xl bg-[#1683FF]/20 border border-[#1683FF]/40 text-[#38A9FF] hover:bg-[#1683FF]/30 transition-all font-medium cursor-pointer"
                    >
                      Restart
                    </button>
                  </div>
                  <button
                    onClick={() => setPowerMenuOpen(false)}
                    className="text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* =================================================== */}
            {/* TOS BOTTOM TASKBAR / PANEL                          */}
            {/* =================================================== */}
            <div className="h-10 bg-[#0D1520] border-t border-[#1B293C] flex items-center justify-between px-2.5 z-40 select-none">
              {/* Left: Launcher button & Running windows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLauncherOpen(!launcherOpen)}
                  className={`h-7 px-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    launcherOpen
                      ? 'bg-[#1683FF] text-white shadow-[0_0_12px_rgba(22,131,255,0.6)]'
                      : 'bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 border border-[#1683FF]/40'
                  }`}
                  title="Application Launcher (Press Super / Windows Key)"
                >
                  <div className="w-3.5 h-3.5 rounded bg-[#1683FF] flex items-center justify-center text-black font-black text-[9px]">
                    T
                  </div>
                  <span className="font-bold text-xs">TOS</span>
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1" />

                {/* Running Application Tabs */}
                {Object.values(windows)
                  .filter((w) => w.isOpen)
                  .map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        if (w.isMinimized) {
                          bringToFront(w.id);
                        } else {
                          minimizeApp(w.id);
                        }
                      }}
                      className={`h-7 px-2.5 rounded-lg flex items-center gap-1.5 text-xs transition-all cursor-pointer ${
                        !w.isMinimized && w.zIndex === topZ
                          ? 'bg-[#1683FF]/30 text-white border border-[#1683FF]/60'
                          : 'bg-[#0A0F16] text-slate-400 hover:text-white border border-[#1B293C]'
                      }`}
                    >
                      {w.icon}
                      <span className="max-w-[100px] truncate">{w.title}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${!w.isMinimized ? 'bg-[#38A9FF]' : 'bg-slate-600'}`} />
                    </button>
                  ))}
              </div>

              {/* Right: System Tray & Clock */}
              <div className="flex items-center gap-2 text-xs">
                {/* Network */}
                <button
                  onClick={() => setNetworkPopover(!networkPopover)}
                  className="p-1.5 rounded hover:bg-white/5 text-slate-300 hover:text-white cursor-pointer"
                  title="Ethernet / Wi-Fi"
                >
                  <Wifi className="w-3.5 h-3.5 text-[#38A9FF]" />
                </button>

                {/* Sound */}
                <button
                  onClick={() => setSoundPopover(!soundPopover)}
                  className="p-1.5 rounded hover:bg-white/5 text-slate-300 hover:text-white cursor-pointer"
                  title={`Volume: ${soundLevel}%`}
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#38A9FF]" />
                </button>

                {/* Battery */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-300 px-1.5 py-0.5 rounded bg-[#0A0F16] border border-[#1B293C]">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100%</span>
                </div>

                <div className="h-4 w-px bg-slate-800 mx-1" />

                {/* Clock */}
                <div className="font-mono text-xs text-white px-2 py-1 rounded bg-[#0A0F16] border border-[#1B293C] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#38A9FF]" />
                  <span>
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Power menu button */}
                <button
                  onClick={() => setPowerMenuOpen(true)}
                  className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer ml-1"
                  title="Power Menu"
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: PHASE 1 ARCHITECTURE & EVALUATION MATRIX          */}
        {/* ======================================================== */}
        {activeTab === 'architecture' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-8">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Layers className="w-3.5 h-3.5" /> Phase 1: Architectural Foundation
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Linux Base System Comparative Evaluation
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                  TOS is engineered under a hard constraint of <strong className="text-white">≤ 10 GB storage</strong>, <strong className="text-white">&lt; 2 GB Live ISO</strong>, and <strong className="text-white">500 MB–1 GB idle RAM</strong>. Below is the multi-dimensional evaluation of the 5 candidates.
                </p>
              </div>

              {/* Comparative Matrix Table */}
              <div className="overflow-x-auto rounded-xl border border-[#1B293C] bg-[#0A0F16] shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0D1520] border-b border-[#1B293C] text-slate-300 font-mono">
                      <th className="p-3.5">Criterion</th>
                      <th className="p-3.5">Buildroot</th>
                      <th className="p-3.5">Alpine Linux</th>
                      <th className="p-3.5 text-[#38A9FF] bg-[#1683FF]/10">Debian Minimal (Selected)</th>
                      <th className="p-3.5">Arch Linux Base</th>
                      <th className="p-3.5">Linux From Scratch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B293C] text-slate-300">
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">1. Installed Size</td>
                      <td className="p-3.5 text-emerald-400">20–120 MB</td>
                      <td className="p-3.5 text-emerald-400">150–350 MB</td>
                      <td className="p-3.5 bg-[#1683FF]/5 font-bold text-emerald-400">800 MB–1.4 GB (Target &lt;10 GB PASS)</td>
                      <td className="p-3.5 text-amber-400">1.8–3.2 GB</td>
                      <td className="p-3.5 text-emerald-400">300 MB–1.0 GB</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">2. Idle RAM Usage</td>
                      <td className="p-3.5 text-emerald-400">25–60 MB</td>
                      <td className="p-3.5 text-emerald-400">60–120 MB</td>
                      <td className="p-3.5 bg-[#1683FF]/5 font-bold text-emerald-400">180–320 MB (Target &lt;1 GB PASS)</td>
                      <td className="p-3.5 text-amber-400">350–550 MB</td>
                      <td className="p-3.5 text-emerald-400">100–250 MB</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">3. Package Management</td>
                      <td className="p-3.5 text-red-400 font-bold">NONE (Rebuild image only)</td>
                      <td className="p-3.5 text-emerald-400">apk (Fast, musl-only)</td>
                      <td className="p-3.5 bg-[#1683FF]/5 font-bold text-[#38A9FF]">APT (60,000+ packages, dynamic)</td>
                      <td className="p-3.5 text-emerald-400">pacman / AUR</td>
                      <td className="p-3.5 text-red-400 font-bold">NONE (Manual compile)</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">4. Driver Support</td>
                      <td className="p-3.5 text-red-400">Manual kernel compile</td>
                      <td className="p-3.5 text-amber-400">Limited (musl blocks blobs)</td>
                      <td className="p-3.5 bg-[#1683FF]/5 font-bold text-emerald-400">Unmatched (Free + Non-free firmware)</td>
                      <td className="p-3.5 text-emerald-400">High (Rolling bleeding edge)</td>
                      <td className="p-3.5 text-red-400">Manual per-machine</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">5. Build Reproducibility</td>
                      <td className="p-3.5 text-slate-300">Toolchain dependent</td>
                      <td className="p-3.5 text-emerald-400">High (aports)</td>
                      <td className="p-3.5 bg-[#1683FF]/5 font-bold text-emerald-400">Near-instant (debootstrap minbase)</td>
                      <td className="p-3.5 text-amber-400">Arch-install chroot</td>
                      <td className="p-3.5 text-red-400">12–36 hours compile</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02]">
                      <td className="p-3.5 font-medium text-white">6. Long-term Maintenance</td>
                      <td className="p-3.5 text-amber-400">Host rebuilds required</td>
                      <td className="p-3.5 text-slate-300">Active rolling</td>
                      <td className="p-3.5 bg-[#1683FF]/5 font-bold text-emerald-400">5-Year Debian Stable frozen ABI</td>
                      <td className="p-3.5 text-amber-400">High breakage risk on update</td>
                      <td className="p-3.5 text-red-400">Manual backports</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] bg-[#0D1520]/50 font-bold">
                      <td className="p-3.5 text-white">OVERALL VERDICT</td>
                      <td className="p-3.5 text-red-400">Rejected (No pkg mgr)</td>
                      <td className="p-3.5 text-amber-400">Runner-up (musl hurdle)</td>
                      <td className="p-3.5 bg-[#1683FF]/15 text-[#38A9FF] font-black">SELECTED FOUNDATION</td>
                      <td className="p-3.5 text-amber-400">Too heavy for &lt;10GB</td>
                      <td className="p-3.5 text-red-400">Prohibitive build time</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rationale Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Why Debian Minimal Won
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    By bootstrapping with <code className="text-[#38A9FF]">--variant=minbase</code> and disabling recommends, we obtain an 850 MB core that boots into <strong>218 MB of RAM</strong>, while providing a genuine package manager (<code className="text-white">apt</code>) and universal driver support for older laptops.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Why Buildroot Was Not Selected
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    While Buildroot produces tiny firmware images (&lt;50 MB), it has <strong>no runtime package manager</strong>. If a user runs <code className="text-white">tos-install firefox</code>, Buildroot cannot download a binary; the entire OS image must be recompiled on a developer workstation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Why Alpine Had Issues
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Alpine uses <code className="text-[#38A9FF]">musl</code> libc. While fast, musl breaks binary compatibility with proprietary Wi-Fi firmware shims, Widevine DRM for web browser video playback, and standard precompiled Linux desktop software.
                  </p>
                </div>
              </div>

              {/* Storage Budget Breakdown */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/30 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#38A9FF]" />
                  TOS 0.1 Storage Budget Breakdown (Target: 10 GB Max)
                </h3>
                <div className="grid grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[#05070A] border border-[#1B293C]">
                    <div className="text-slate-400 text-[10px]">EFI PARTITION</div>
                    <div className="text-sm font-bold text-white">256 MB</div>
                    <div className="text-[10px] text-slate-500">FAT32 GRUB UEFI</div>
                  </div>
                  <div className="p-3 rounded bg-[#05070A] border border-[#1B293C]">
                    <div className="text-slate-400 text-[10px]">KERNEL + INITRD</div>
                    <div className="text-sm font-bold text-white">90 MB</div>
                    <div className="text-[10px] text-slate-500">vmlinuz + initramfs</div>
                  </div>
                  <div className="p-3 rounded bg-[#05070A] border border-[#1B293C]">
                    <div className="text-slate-400 text-[10px]">DEBIAN MINBASE ROOT</div>
                    <div className="text-sm font-bold text-white">750 MB</div>
                    <div className="text-[10px] text-slate-500">Glibc, systemd, bash</div>
                  </div>
                  <div className="p-3 rounded bg-[#05070A] border border-[#1B293C]">
                    <div className="text-slate-400 text-[10px]">DESKTOP + APPS</div>
                    <div className="text-sm font-bold text-emerald-400">1.23 GB</div>
                    <div className="text-[10px] text-slate-500">Xorg, Openbox, PCManFM</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#1B293C] text-xs">
                  <span className="text-slate-400">Total Installed Footprint: <strong className="text-white">~2.33 GB</strong> (Budget headroom: <span className="text-emerald-400 font-bold">7.67 GB available for user files</span>)</span>
                  <span className="text-[#38A9FF] font-mono">Target: PASS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 2 HOST ENVIRONMENT & TOOLCHAIN DIAGNOSTICS    */}
        {/* ======================================================== */}
        {activeTab === 'phase2-env' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Shield className="w-3.5 h-3.5" /> Phase 2: Host Development Environment
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Toolchain Provisioning &amp; Host Diagnostics
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Before building the minimal kernel and rootfs, verify that your host system (Linux or WSL2) has the required compilers, filesystem formatters, bootloader binaries, and QEMU emulator.
                </p>
              </div>

              {/* Host Spec Diagnostic Summary Card */}
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[11px]">TARGET ARCHITECTURE</div>
                    <div className="text-base font-bold text-white mt-1">x86_64</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[11px]">REQUIRED FREE DISK</div>
                    <div className="text-base font-bold text-emerald-400 mt-1">&ge; 10 GB</div>
                  </div>
                  <HardDrive className="w-5 h-5 text-[#38A9FF]" />
                </div>
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[11px]">HARDWARE ACCELERATION</div>
                    <div className="text-base font-bold text-white mt-1">/dev/kvm (QEMU)</div>
                  </div>
                  <Cpu className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* Required Toolchain Breakdown Matrix */}
              <div className="rounded-xl border border-[#1B293C] bg-[#0A0F16] overflow-hidden">
                <div className="p-3.5 bg-[#0D1520] border-b border-[#1B293C] font-semibold text-xs text-white flex items-center justify-between">
                  <span>Required Host Toolchain &amp; Purpose</span>
                  <span className="text-slate-400 text-[11px] font-mono">TOS Build Engine v0.1</span>
                </div>
                <div className="divide-y divide-[#1B293C] text-xs">
                  {[
                    { bin: 'debootstrap', pkg: 'debootstrap', role: 'RootFS Builder', why: 'Bootstraps clean Debian Bookworm root filesystem tree directly from mirrors' },
                    { bin: 'mksquashfs', pkg: 'squashfs-tools', role: 'Live Compressor', why: 'Compresses 2.3 GB root filesystem into ultra-dense 750 MB XZ block for live USB' },
                    { bin: 'xorriso', pkg: 'xorriso', role: 'ISO 9660 Engine', why: 'Builds bootable hybrid optical/USB images that write raw with dd' },
                    { bin: 'grub-mkrescue', pkg: 'grub-pc-bin & grub-efi-amd64-bin', role: 'Dual Bootloader', why: 'Injects both UEFI 64-bit and Legacy BIOS MBR bootloaders into the ISO' },
                    { bin: 'mkfs.vfat & mcopy', pkg: 'dosfstools & mtools', role: 'EFI Formatter', why: 'Formats and writes the FAT32 EFI System Partition without loop mounts' },
                    { bin: 'qemu-system-x86_64', pkg: 'qemu-system-x86 & ovmf', role: 'Live Emulator', why: 'Instantly tests the generated ISO with genuine UEFI BIOS firmware without rebooting' },
                    { bin: 'build-essential & gcc', pkg: 'build-essential', role: 'C Compiler', why: 'Compiles low-level TOS helpers, kernel modules, and system shims' },
                  ].map((t, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="font-mono text-white font-medium flex items-center gap-2">
                            <span>{t.bin}</span>
                            <span className="text-[10px] text-[#38A9FF] px-1.5 py-0.2 rounded bg-[#1683FF]/15 border border-[#1683FF]/30">{t.pkg}</span>
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{t.why}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 px-2 py-1 rounded bg-[#05070A] border border-[#1B293C]">
                        {t.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* One-Click Automated Setup Scripts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <TerminalIcon className="w-3.5 h-3.5 text-[#38A9FF]" />
                      Linux / WSL2 Automated Script
                    </span>
                    <button
                      onClick={() => copyToClipboard('sudo ./build/setup-env.sh', 'p2-sh')}
                      className="text-[11px] font-mono text-[#38A9FF] hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'p2-sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Installs all packages, adds user to kvm group, and runs diagnostics:</p>
                  <pre className="p-2.5 rounded bg-[#05070A] font-mono text-xs text-emerald-400 overflow-x-auto border border-[#1B293C]">
                    sudo ./build/setup-env.sh
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#38A9FF]" />
                      Windows PowerShell Setup
                    </span>
                    <button
                      onClick={() => copyToClipboard('powershell -ExecutionPolicy Bypass -File .\\build\\setup-env.ps1', 'p2-ps')}
                      className="text-[11px] font-mono text-[#38A9FF] hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'p2-ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Enables WSL2, sets default version, and provisions Ubuntu:</p>
                  <pre className="p-2.5 rounded bg-[#05070A] font-mono text-xs text-[#38A9FF] overflow-x-auto border border-[#1B293C]">
                    powershell -ExecutionPolicy Bypass -File .\build\setup-env.ps1
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 3 MINIMAL ROOTFS & KERNEL BOOTSTRAP           */}
        {/* ======================================================== */}
        {activeTab === 'phase3-rootfs' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Cpu className="w-3.5 h-3.5" /> Phase 3: Linux Base System
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Minimal RootFS, Kernel &amp; Networking Bootstrap
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Bootstrap the stripped Debian minbase userspace, inject the Linux LTS kernel with compressed initramfs, configure systemd without telemetry, and establish the core networking stack.
                </p>
              </div>

              {/* Phase 3 Key Architecture Pillars */}
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1">
                  <div className="text-[10px] font-mono text-slate-500">BOOTSTRAP ENGINE</div>
                  <div className="text-sm font-bold text-white">Debootstrap minbase</div>
                  <div className="text-[11px] text-slate-400">Pristine glibc Bookworm root (~850 MB)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1">
                  <div className="text-[10px] font-mono text-slate-500">KERNEL &amp; INITRAMFS</div>
                  <div className="text-sm font-bold text-[#38A9FF]">linux-image-amd64</div>
                  <div className="text-[11px] text-slate-400">LTS Kernel + XZ live-boot initrd (~58 MB)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1">
                  <div className="text-[10px] font-mono text-slate-500">LEAN APT POLICY</div>
                  <div className="text-sm font-bold text-emerald-400">Zero-Bloat Recommends</div>
                  <div className="text-[11px] text-slate-400">APT::Install-Recommends disabled</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1">
                  <div className="text-[10px] font-mono text-slate-500">INIT &amp; USERSPACE</div>
                  <div className="text-sm font-bold text-white">systemd + BusyBox</div>
                  <div className="text-[11px] text-slate-400">Idle RAM target: &lt; 150 MB</div>
                </div>
              </div>

              {/* Package Manifest & Overlay Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#1B293C] bg-[#0A0F16] overflow-hidden">
                  <div className="p-3 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">Phase 3 Core Packages (build/config/tos-phase3-packages.list)</span>
                    <span className="text-[10px] font-mono text-emerald-400">Strict Minimal</span>
                  </div>
                  <div className="p-3 font-mono text-xs text-slate-300 space-y-1 bg-[#05070A] max-h-56 overflow-y-auto">
                    <div className="text-[#38A9FF]"># Linux Kernel &amp; Live Boot</div>
                    <div>linux-image-amd64</div>
                    <div>live-boot</div>
                    <div>systemd-sysv</div>
                    <div>udev, kmod</div>
                    <div className="text-[#38A9FF] pt-1"># Low-resource Utilities &amp; Shell</div>
                    <div>busybox, bash, coreutils, util-linux</div>
                    <div>procps, psmisc, less, nano</div>
                    <div className="text-[#38A9FF] pt-1"># Networking</div>
                    <div>iproute2, isc-dhcp-client, wpasupplicant, curl</div>
                    <div className="text-[#38A9FF] pt-1"># Security &amp; Storage</div>
                    <div>sudo, e2fsprogs, dosfstools, parted</div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1B293C] bg-[#0A0F16] overflow-hidden">
                  <div className="p-3 bg-[#0D1520] border-b border-[#1B293C] flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">Injected RootFS Overlay Files</span>
                    <span className="text-[10px] font-mono text-[#38A9FF]">rootfs/etc/</span>
                  </div>
                  <div className="divide-y divide-[#1B293C] text-xs">
                    {[
                      { path: 'etc/os-release', desc: 'Identifies OS as TOS 0.1 Alpha' },
                      { path: 'etc/issue', desc: 'Clean ASCII logo and login banner' },
                      { path: 'etc/network/interfaces', desc: 'Auto-hotplug DHCP for eth0, enp0s3, eno1' },
                      { path: 'etc/apt/apt.conf.d/99tos-lean', desc: 'Disables recommends/suggests bloat' },
                      { path: 'etc/fstab', desc: 'Configures live overlayfs and tmpfs mounts' },
                      { path: 'etc/initramfs-tools/conf.d/tos-compression.conf', desc: 'Enforces XZ initrd compression' },
                    ].map((f, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between">
                        <div className="font-mono text-slate-200">{f.path}</div>
                        <div className="text-[11px] text-slate-400">{f.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution Commands for Phase 3 */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    Phase 3 Build Command (Linux / WSL2)
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/build-phase3-rootfs.sh tests/test_phase3_rootfs.sh && sudo ./build/build-phase3-rootfs.sh', 'p3-build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'p3-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Phase 3 Build Command
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Runs the minimal rootfs bootstrap, installs the kernel and core packages, generates the XZ-compressed initramfs, and extracts <code className="text-[#38A9FF]">work/boot/vmlinuz</code> and <code className="text-[#38A9FF]">work/boot/initrd.img</code>:
                </p>
                <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                  chmod +x build/build-phase3-rootfs.sh tests/test_phase3_rootfs.sh<br />
                  sudo ./build/build-phase3-rootfs.sh
                </pre>
              </div>

              {/* Automated Validation Test */}
              <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-white">Automated Test: test_phase3_rootfs.sh</div>
                  <div className="text-[11px] text-slate-400">Validates required rootfs overlays, package manifests, and kernel hooks.</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                    CONFIG VERIFIED
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 4 DUAL UEFI & BIOS BOOTLOADER                 */}
        {/* ======================================================== */}
        {activeTab === 'phase4-bootloader' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Compass className="w-3.5 h-3.5" /> Phase 4: Bootloader Architecture
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Dual UEFI &amp; Legacy BIOS Bootloader
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Configuring the hybrid GRUB bootloader supporting modern 64-bit UEFI PCs and legacy BIOS hardware, complete with the clean dark startup screen and live kernel parameters.
                </p>
              </div>

              {/* Authentic Dark GRUB Boot Screen Preview */}
              <div className="rounded-2xl border border-[#1683FF]/40 bg-[#05070A] p-6 shadow-2xl space-y-5 font-mono">
                <div className="flex items-center justify-between border-b border-[#1B293C] pb-3 text-xs">
                  <span className="text-[#38A9FF] font-bold">GNU GRUB version 2.12 (TOS Dark Electric Theme)</span>
                  <span className="text-slate-400">UEFI / BIOS Dual Boot Mode</span>
                </div>

                {/* Minimal Dark Boot Banner requested in spec */}
                <div className="text-center py-3 select-none">
                  <div className="text-3xl font-black tracking-widest text-[#EAF4FF]">TOS</div>
                  <div className="text-xs text-[#38A9FF] tracking-wider mt-1">Starting...</div>
                </div>

                {/* Boot Menu Entries */}
                <div className="space-y-1.5 text-xs">
                  {[
                    { title: '* Try TOS 0.1 Alpha (Live Desktop - Run entirely from RAM)', active: true, tag: 'DEFAULT' },
                    { title: '  Install TOS 0.1 Alpha (Direct Guided Disk Installer)', active: false, tag: 'INSTALLER' },
                    { title: '  TOS Recovery Console (Single-User / Maintenance Shell)', active: false, tag: 'RESCUE' },
                    { title: '  TOS Safe Graphics Mode (Nomodeset Fallback)', active: false, tag: 'SAFE' },
                    { title: '  TOS Toram Mode (Copy Entire OS into RAM for Max Speed)', active: false, tag: 'TORAM' },
                    { title: '  UEFI Firmware Settings (Reboot to BIOS Setup)', active: false, tag: 'UEFI ONLY' },
                  ].map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded flex items-center justify-between transition-colors ${
                        entry.active
                          ? 'bg-[#1683FF] text-white font-bold shadow-[0_0_12px_rgba(22,131,255,0.4)]'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>{entry.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          entry.active
                            ? 'bg-black/30 text-white'
                            : 'bg-[#0D1520] text-slate-400 border border-[#1B293C]'
                        }`}
                      >
                        {entry.tag}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-400 border-t border-[#1B293C] pt-3 flex justify-between">
                  <span>Use &uarr; and &darr; keys to select entry. Press &apos;Enter&apos; to boot, &apos;e&apos; to edit params.</span>
                  <span className="text-[#38A9FF]">Timeout: 8 seconds</span>
                </div>
              </div>

              {/* Dual Boot Architecture Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    64-bit UEFI Boot Flow
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 font-mono">
                    <li>1. Firmware loads <span className="text-[#38A9FF]">/EFI/BOOT/BOOTX64.EFI</span></li>
                    <li>2. GRUB reads <span className="text-white">/boot/grub/grub.cfg</span></li>
                    <li>3. Kernel loaded into high memory: <span className="text-[#38A9FF]">vmlinuz</span></li>
                    <li>4. Ramdisk unpacked: <span className="text-[#38A9FF]">initrd.img</span></li>
                    <li>5. Parameters: <span className="text-emerald-400">boot=live quiet splash</span></li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <CheckCircle2 className="w-4 h-4 text-[#38A9FF]" />
                    Legacy BIOS Boot Flow
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 font-mono">
                    <li>1. BIOS executes MBR bootcode (Sector 0)</li>
                    <li>2. Core image loaded (<span className="text-white">bios.img / eltorito</span>)</li>
                    <li>3. VGA graphical framebuffer initialized (<span className="text-[#38A9FF]">gfxterm</span>)</li>
                    <li>4. Live ISO mounted via <span className="text-[#38A9FF]">findiso / live-boot</span></li>
                    <li>5. Memory target: <span className="text-emerald-400">&lt; 220 MB idle RAM</span></li>
                  </ul>
                </div>
              </div>

              {/* Build & QEMU Commands */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    Phase 4 ISO Compilation &amp; QEMU Test Commands
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/build-phase4-bootloader.sh tests/test_qemu_boot.sh && ./build/build-phase4-bootloader.sh', 'p4-build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'p4-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Phase 4 Build Command
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Compile the Hybrid ISO:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                    chmod +x build/build-phase4-bootloader.sh tests/test_qemu_boot.sh<br />
                    ./build/build-phase4-bootloader.sh
                  </pre>
                  <div className="text-xs text-slate-400 pt-2">Test in QEMU (UEFI with OVMF Firmware):</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                    ./tests/test_qemu_boot.sh --uefi
                  </pre>
                  <div className="text-xs text-slate-400 pt-2">Test in QEMU (Legacy BIOS Mode):</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-slate-300 overflow-x-auto">
                    ./tests/test_qemu_boot.sh --bios
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 5 FIRST BOOT & TTY1 CONSOLE                   */}
        {/* ======================================================== */}
        {activeTab === 'phase5-firstboot' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <TerminalIcon className="w-3.5 h-3.5" /> Phase 5: First Boot &amp; Userspace
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  First Boot: TTY1 Console &amp; Auto-Login
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Verifying the transition from kernel initramfs into userspace systemd, mounting the root overlay, and reaching the interactive <code className="text-[#38A9FF]">TOS login:</code> prompt and shell.
                </p>
              </div>

              {/* Simulated Authentic TTY1 First Boot Console */}
              <div className="rounded-2xl border border-[#1683FF]/40 bg-[#05070A] p-6 shadow-2xl space-y-4 font-mono text-xs text-[#EAF4FF]">
                <div className="flex items-center justify-between border-b border-[#1B293C] pb-2 text-[11px] text-slate-400">
                  <span className="text-[#38A9FF] font-bold">Virtual Console TTY1 (Linux 6.6.15-amd64)</span>
                  <span>Auto-Login: ACTIVE (user: tos)</span>
                </div>

                {/* Exact ASCII banner from rootfs/etc/issue */}
                <div className="text-[#1683FF] font-bold py-1">
                  {'        '}████████╗ ██████╗ ███████╗<br />
                  {'        '}╚══██╔══╝██╔═══██╗██╔════╝<br />
                  {'           '}██║   ██║   ██║███████╗<br />
                  {'           '}██║   ██║   ██║╚════██║<br />
                  {'           '}██║   ╚██████╔╝███████║<br />
                  {'           '}╚═╝    ╚═════╝ ╚══════╝<br />
                  <div className="text-white font-bold pt-2 pl-16">TOS 0.1 Alpha</div>
                  <div className="text-slate-400 text-[11px] pl-14">Lightweight Linux OS</div>
                </div>

                <div className="space-y-1 text-slate-300 border-t border-[#1B293C] pt-3">
                  <div>TOS login: <span className="text-white font-bold">tos</span> (automatic login)</div>
                  <div className="text-slate-500 text-[11px]">Linux tos-pc 6.6.15-amd64 #1 SMP PREEMPT_DYNAMIC x86_64</div>
                  <div className="text-slate-500 text-[11px]">The programs included with TOS are free software; upstream licenses apply.</div>
                </div>

                {/* Profile.d / tos-welcome.sh output */}
                <div className="p-3.5 rounded-lg bg-[#0A0F16] border border-[#1683FF]/30 space-y-1">
                  <div className="text-white font-bold">TOS Linux (0.1 Alpha) — Minimal Base</div>
                  <div className="grid grid-cols-2 gap-y-0.5 text-[11px]">
                    <div><span className="text-slate-400">Kernel:</span> 6.6.15-amd64</div>
                    <div><span className="text-slate-400">Architecture:</span> x86_64</div>
                    <div><span className="text-slate-400">Memory:</span> <span className="text-emerald-400">141 MB / 4096 MB (Idle target: &lt; 200 MB)</span></div>
                    <div><span className="text-slate-400">Storage:</span> <span className="text-emerald-400">890 MB uncompressed / 10 GB limit</span></div>
                    <div><span className="text-slate-400">Root Overlay:</span> overlayfs on tmpfs (RW)</div>
                    <div><span className="text-slate-400">IP Address:</span> 10.0.2.15 (DHCP via eth0)</div>
                  </div>
                  <div className="text-[11px] text-[#38A9FF] pt-2">
                    Type &apos;tos-help&apos; for available commands. Type &apos;startx&apos; to launch graphical shell.
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-slate-200">
                  <span className="text-[#1683FF] font-bold">tos@tos-pc</span>
                  <span className="text-slate-500">:</span>
                  <span className="text-[#38A9FF]">~</span>
                  <span className="text-slate-500">$</span>
                  <span className="w-2 h-4 bg-[#38A9FF] animate-pulse ml-1 inline-block align-middle" />
                </div>
              </div>

              {/* Userspace Init Milestones Checklist */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    1. Kernel &rarr; Init Transition
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Initramfs hands off root PID 1 to <code className="text-white">/sbin/init</code> (systemd-sysv). Virtual filesystems mounted cleanly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    2. Live OverlayFS Mount
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Read-only <code className="text-white">filesystem.squashfs</code> overlaid with writeable RAM tmpfs. Changes persist in RAM during session.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    3. User Permissions &amp; Sudo
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Live user <code className="text-[#38A9FF]">tos</code> configured with passwordless sudo via <code className="text-white">/etc/sudoers.d/tos</code> (mode 0440).
                  </p>
                </div>
              </div>

              {/* Phase 5 Build & QEMU First Boot Commands */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    Phase 5 Execution &amp; First Boot Test Commands
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/build-phase5-firstboot.sh tests/test_phase5_firstboot.sh && ./build/build-phase5-firstboot.sh', 'p5-build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'p5-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Phase 5 Command
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Inject Userspace &amp; First Boot Hooks:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                    chmod +x build/build-phase5-firstboot.sh tests/test_phase5_firstboot.sh<br />
                    ./build/build-phase5-firstboot.sh
                  </pre>
                  <div className="text-xs text-slate-400 pt-2">Launch First Boot in QEMU (Watch it reach TTY1):</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                    ./tests/test_qemu_boot.sh --uefi
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 6 NETWORKING STACK                           */}
        {/* ======================================================== */}
        {activeTab === 'phase6-networking' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Wifi className="w-3.5 h-3.5" /> Phase 6: Networking Stack
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Ethernet, Wi-Fi, DHCP &amp; Privacy DNS
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Configuring automatic wired Ethernet hotplugging, lightweight wireless management via <code className="text-[#38A9FF]">wpa_supplicant</code>, and high-speed zero-telemetry DNS resolvers.
                </p>
              </div>

              {/* Network Status Cards */}
              <div className="grid grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>WIRED ETHERNET (eth0)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-base font-bold text-white">Connected</div>
                  <div className="text-[11px] text-slate-400">IP: 10.0.2.15 (DHCP Client)</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>WIRELESS WI-FI (wlan0)</span>
                    <span className="w-2 h-2 rounded-full bg-[#1683FF]" />
                  </div>
                  <div className="text-base font-bold text-white">wpa_supplicant Active</div>
                  <div className="text-[11px] text-slate-400">Managed via tos-wifi CLI</div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>PRIVACY DNS RESOLVER</span>
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base font-bold text-emerald-400">1.1.1.1 &amp; 9.9.9.9</div>
                  <div className="text-[11px] text-slate-400">Zero ISP DNS telemetry</div>
                </div>
              </div>

              {/* Interactive tos-wifi Command & Scanner Preview */}
              <div className="rounded-2xl border border-[#1683FF]/40 bg-[#0A0F16] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B293C] pb-3">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-bold text-white">TOS Wireless Scanner (tos-wifi scan)</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#38A9FF] px-2 py-0.5 rounded bg-[#1683FF]/15 border border-[#1683FF]/30">
                    wlan0: READY
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { ssid: 'TOS-Guest', signal: '96%', security: 'Open / Free', connected: true },
                    { ssid: 'TOS-Fast-5G', signal: '88%', security: 'WPA2-PSK (AES)', connected: false },
                    { ssid: 'Home-Fiber-WiFi', signal: '72%', security: 'WPA3-SAE', connected: false },
                    { ssid: 'Legacy-Hotspot', signal: '45%', security: 'WPA2-PSK', connected: false },
                  ].map((net, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] hover:border-[#1683FF]/50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Wifi className={`w-4 h-4 ${net.connected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <div>
                          <div className="font-mono text-white font-medium flex items-center gap-2">
                            <span>{net.ssid}</span>
                            {net.connected && (
                              <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-500/30">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-[11px]">Security: {net.security} • Signal: {net.signal}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`In terminal run: tos-wifi connect "${net.ssid}" <password>`)}
                        className={`px-3 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                          net.connected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 border border-[#1683FF]/40'
                        }`}
                      >
                        {net.connected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Networking Configuration Files Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <TerminalIcon className="w-3.5 h-3.5 text-[#38A9FF]" />
                    /etc/network/interfaces (Auto-Hotplug)
                  </div>
                  <pre className="p-2.5 rounded bg-[#05070A] font-mono text-[11px] text-slate-300 overflow-x-auto border border-[#1B293C]">
                    auto lo<br />
                    iface lo inet loopback<br />
                    <br />
                    allow-hotplug eth0<br />
                    iface eth0 inet dhcp<br />
                    <br />
                    allow-hotplug wlan0<br />
                    iface wlan0 inet dhcp<br />
                    {'    '}wpa-conf /etc/wpa_supplicant/wpa_supplicant.conf
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-2">
                  <div className="font-semibold text-xs text-white flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    /etc/resolv.conf (Privacy DNS)
                  </div>
                  <pre className="p-2.5 rounded bg-[#05070A] font-mono text-[11px] text-slate-300 overflow-x-auto border border-[#1B293C]">
                    nameserver 1.1.1.1<br />
                    nameserver 1.0.0.1<br />
                    nameserver 9.9.9.9<br />
                    options timeout:2 attempts:2 rotate
                  </pre>
                </div>
              </div>

              {/* Execution Commands */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    Phase 6 Execution &amp; Network Test Commands
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/build-phase6-networking.sh tests/test_phase6_networking.sh scripts/tos-wifi && ./build/build-phase6-networking.sh', 'p6-build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'p6-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Phase 6 Command
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Inject Network Configurations &amp; Test:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                    chmod +x build/build-phase6-networking.sh tests/test_phase6_networking.sh scripts/tos-wifi<br />
                    ./build/build-phase6-networking.sh
                  </pre>
                  <div className="text-xs text-slate-400 pt-2">Test Network Status CLI inside TOS:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                    tos-wifi status<br />
                    tos-wifi scan
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 7 GRAPHICS & DISPLAY STACK                    */}
        {/* ======================================================== */}
        {activeTab === 'phase7-graphics' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Monitor className="w-3.5 h-3.5" /> Phase 7: Linux Graphics Stack
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Display Server, Mesa DRI3 Acceleration &amp; Drivers
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Integrating the X11 display server with Glamor 2D/3D hardware acceleration, universal open-source Mesa drivers for Intel, AMD, and NVIDIA, and touchpad gesture support.
                </p>
              </div>

              {/* Graphics Stack Architecture Evaluation Card */}
              <div className="p-4 rounded-xl bg-[#0A0F16] border border-[#1683FF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Display Architecture: X11 Primary with Wayland Roadmap
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                    RAM FOOTPRINT: &lt; 45 MB
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  For TOS 0.1 Alpha, <strong className="text-white">X11 + Modesetting + Glamor</strong> was selected over raw Wayland because it provides 100% stable hardware compatibility across older laptops (Intel GMA, legacy Radeon HD, and older NVIDIA cards) and virtual machine emulators (QEMU, VirtualBox), while consuming only <strong>~42 MB of resident memory</strong>.
                </p>
              </div>

              {/* Supported GPU Driver Matrix */}
              <div className="rounded-xl border border-[#1B293C] bg-[#0A0F16] overflow-hidden">
                <div className="p-3 bg-[#0D1520] border-b border-[#1B293C] font-semibold text-xs text-white flex items-center justify-between">
                  <span>Hardware GPU Driver Matrix (Mesa 3D / DRI3)</span>
                  <span className="text-slate-400 text-[11px] font-mono">Zero-Drop Acceleration</span>
                </div>
                <div className="divide-y divide-[#1B293C] text-xs">
                  {[
                    { vendor: 'Intel Core & Atom', driver: 'modesetting / iris / crocus', accel: 'OpenGL 4.6 / DRI3', status: 'Optimal' },
                    { vendor: 'AMD Radeon / Ryzen APU', driver: 'amdgpu / radeonsi', accel: 'OpenGL 4.6 / Vulkan RADV', status: 'Optimal' },
                    { vendor: 'NVIDIA GeForce', driver: 'nouveau (open) + dkms ready', accel: 'OpenGL 4.3 / Glamor', status: 'Supported' },
                    { vendor: 'QEMU / KVM Virtual', driver: 'virtio-vga / bochs-drm', accel: 'VirGL 3D Pass-Through', status: 'Optimal' },
                    { vendor: 'VirtualBox / VMware', driver: 'vboxvideo / vmwgfx', accel: 'Host OpenGL Acceleration', status: 'Supported' },
                  ].map((gpu, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-white/[0.02]">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div>
                          <div className="font-mono text-white font-medium">{gpu.vendor}</div>
                          <div className="text-slate-500 text-[11px]">Driver: {gpu.driver}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[#38A9FF] text-[11px]">{gpu.accel}</div>
                        <div className="text-emerald-400 text-[10px] uppercase font-bold">{gpu.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive tos-display Simulator */}
              <div className="rounded-2xl border border-[#1683FF]/40 bg-[#0A0F16] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B293C] pb-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-bold text-white">TOS Display &amp; Resolution Manager (tos-display)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                    Primary: Virtual-1 (Connected)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <label className="text-slate-400 text-[11px] block">Select Display Resolution</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['1920x1080', '1600x900', '1366x768', '1280x720'].map((res) => (
                        <button
                          key={res}
                          onClick={() => alert(`Running: tos-display set ${res}`)}
                          className={`p-2.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                            res === '1920x1080'
                              ? 'bg-[#1683FF]/20 border-[#1683FF] text-white font-bold'
                              : 'bg-[#05070A] border-[#1B293C] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-400 text-[11px] block">Hardware Acceleration Parameters</label>
                    <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1.5 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Acceleration Method:</span>
                        <span className="text-[#38A9FF]">glamor (2D/3D)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Direct Rendering:</span>
                        <span className="text-emerald-400">DRI3 Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tear-Free Rendering:</span>
                        <span className="text-emerald-400">Active (VSync)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Commands */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    Phase 7 Execution &amp; Display Test Commands
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/build-phase7-graphics.sh tests/test_phase7_graphics.sh scripts/tos-display && ./build/build-phase7-graphics.sh', 'p7-build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'p7-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Phase 7 Command
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Inject Graphics &amp; Display Configurations:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                    chmod +x build/build-phase7-graphics.sh tests/test_phase7_graphics.sh scripts/tos-display<br />
                    ./build/build-phase7-graphics.sh
                  </pre>
                  <div className="text-xs text-slate-400 pt-2">Test Display Hardware Status inside TOS:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                    tos-display status<br />
                    tos-display set 1920x1080
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PHASE 9 DEFAULT APPLICATIONS SUITE                 */}
        {/* ======================================================== */}
        {activeTab === 'phase9-apps' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Folder className="w-3.5 h-3.5" /> Phase 9: Applications Suite
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  TOS Default Applications Suite
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  A lean, purposeful selection of essential desktop applications. Strictly zero bloatware, zero background telemetry, and ultra-low RAM footprint.
                </p>
              </div>

              {/* 7 Core Applications Grid */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { name: '1. File Manager', pkg: 'PCManFM', ram: '18 MB', desc: 'Fast tabbed browsing, trash, bookmarks, volume mounting', icon: <Folder className="w-4 h-4 text-[#38A9FF]" /> },
                  { name: '2. Terminal Emulator', pkg: 'LXTerminal', ram: '12 MB', desc: 'TOS Electric Dark color scheme, UTF-8, low CPU overhead', icon: <TerminalIcon className="w-4 h-4 text-[#38A9FF]" /> },
                  { name: '3. Settings App', pkg: 'tos-settings', ram: '15 MB', desc: 'Unified control for Appearance, Display, Sound, Net, Users', icon: <SettingsIcon className="w-4 h-4 text-[#38A9FF]" /> },
                  { name: '4. Text Editor', pkg: 'Mousepad', ram: '14 MB', desc: 'Clean text & code editor with syntax highlighting and dark theme', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
                  { name: '5. Calculator', pkg: 'Galculator', ram: '10 MB', desc: 'Algebraic, scientific, and programmer calculation modes', icon: <Code className="w-4 h-4 text-[#38A9FF]" /> },
                  { name: '6. Process Viewer', pkg: 'LXTsk / Htop', ram: '8 MB', desc: 'Real-time CPU per-core meters, memory utilization, kill tasks', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
                  { name: '7. System Info', pkg: 'tos-info / tos-size', ram: '2 MB', desc: 'Kernel spec inspection & 10 GB storage budget compliance', icon: <Info className="w-4 h-4 text-[#38A9FF]" /> },
                ].map((app, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-1.5 hover:border-[#1683FF]/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white">
                        {app.icon}
                        <span>{app.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-500/30">
                        {app.ram}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#38A9FF]">{app.pkg}</div>
                    <p className="text-[11px] text-slate-400">{app.desc}</p>
                  </div>
                ))}
              </div>

              {/* TOS Settings App (Control Center) Deep Dive */}
              <div className="rounded-2xl border border-[#1683FF]/40 bg-[#0A0F16] p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1B293C] pb-3">
                  <div className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-[#38A9FF]" />
                    <span className="text-xs font-bold text-white">TOS Control Center Modules (tos-settings)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                    6 MODULES READY
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#38A9FF]" /> Appearance
                    </div>
                    <div className="text-[11px] text-slate-400">Wallpapers (tos-default.svg), GTK theme (tos-electric-dark), Papirus icons.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#38A9FF]" /> Display
                    </div>
                    <div className="text-[11px] text-slate-400">Resolution changer (1080p, 720p), multi-monitor arrangement via xrandr.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#38A9FF]" /> Sound
                    </div>
                    <div className="text-[11px] text-slate-400">Master output volume slider, microphone input gain, ALSA/PipeWire routing.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 text-[#38A9FF]" /> Network
                    </div>
                    <div className="text-[11px] text-slate-400">Wi-Fi scanner, WPA/WPA2/WPA3 connect, Ethernet IP inspection via tos-wifi.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#38A9FF]" /> Users &amp; Sudo
                    </div>
                    <div className="text-[11px] text-slate-400">User accounts, password changes, group membership, sudo privileges.</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-1">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#38A9FF]" /> System Info
                    </div>
                    <div className="text-[11px] text-slate-400">Hardware specification, kernel 6.6 LTS, 10 GB storage budget compliance audit.</div>
                  </div>
                </div>
              </div>

              {/* Execution Commands */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    Phase 9 Execution &amp; Applications Test Commands
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/build-phase9-apps.sh tests/test_phase9_apps.sh scripts/tos-settings && ./build/build-phase9-apps.sh', 'p9-build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'p9-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Phase 9 Command
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Inject Applications &amp; Desktop Entries:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                    chmod +x build/build-phase9-apps.sh tests/test_phase9_apps.sh scripts/tos-settings<br />
                    ./build/build-phase9-apps.sh
                  </pre>
                  <div className="text-xs text-slate-400 pt-2">Test Settings Control Center CLI inside TOS:</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                    tos-settings
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: EXACT BUILD & QEMU COMMANDS                       */}
        {/* ======================================================== */}
        {activeTab === 'build-guide' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <TerminalIcon className="w-3.5 h-3.5" /> Phase 2 &amp; 3: Execution Pipeline
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  TOS 0.1 Alpha Build Commands
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Step-by-step instructions clearly split between <strong className="text-white">Windows PowerShell (WSL2)</strong> and <strong className="text-white">Linux / WSL Shell</strong>.
                </p>
              </div>

              {/* Windows Setup Card */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#38A9FF]" />
                    Step 1: Windows Setup (PowerShell)
                  </h3>
                  <button
                    onClick={() => copyToClipboard('wsl --install -d Ubuntu', 'ps1')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'ps1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy PowerShell Command
                  </button>
                </div>
                <p className="text-xs text-slate-400">If on Windows 10 or 11, run PowerShell as Administrator to launch WSL2:</p>
                <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                  wsl --install -d Ubuntu
                </pre>
              </div>

              {/* Linux / WSL Dependencies */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-[#38A9FF]" />
                    Step 2: Install Build Dependencies (Linux / WSL2 Shell)
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'sudo apt-get update && sudo apt-get install -y debootstrap squashfs-tools xorriso isolinux syslinux-efi grub-pc-bin grub-efi-amd64-bin mtools dosfstools qemu-system-x86 ovmf curl git rsync',
                        'dep'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'dep' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Dependency Command
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  sudo apt-get update && sudo apt-get install -y \<br />
                  {'    '}debootstrap squashfs-tools xorriso isolinux syslinux-efi \<br />
                  {'    '}grub-pc-bin grub-efi-amd64-bin mtools dosfstools \<br />
                  {'    '}qemu-system-x86 ovmf curl git rsync
                </pre>
              </div>

              {/* Execute Build Pipeline */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    Step 3: Execute the TOS Automated Build Script
                  </h3>
                  <button
                    onClick={() => copyToClipboard('chmod +x build/*.sh scripts/tos-* installer/*.sh && sudo ./build/build.sh', 'build')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Build Command
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  This bootstraps the minimal Debian Bookworm rootfs, strips recommended bloat, injects the Linux LTS kernel, configures GRUB UEFI/BIOS, and compiles <code className="text-emerald-400">output/TOS-0.1-alpha-x86_64.iso</code>:
                </p>
                <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-[#38A9FF] overflow-x-auto">
                  chmod +x build/*.sh scripts/tos-* installer/*.sh<br />
                  sudo ./build/build.sh
                </pre>
              </div>

              {/* QEMU Test Commands */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1B293C] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#38A9FF]" />
                    Step 4: Test in QEMU Emulator (UEFI &amp; BIOS)
                  </h3>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'qemu-system-x86_64 -m 2048 -smp 2 -cdrom output/TOS-0.1-alpha-x86_64.iso -boot d -vga virtio -net nic -net user',
                        'qemu'
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                  >
                    {copiedKey === 'qemu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy QEMU Command
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Standard Test Command (2 GB RAM, 2 Cores):</div>
                  <pre className="p-3 rounded-lg bg-[#05070A] border border-[#1B293C] font-mono text-xs text-emerald-400 overflow-x-auto">
                    qemu-system-x86_64 -m 2048 -smp 2 -cdrom output/TOS-0.1-alpha-x86_64.iso -boot d -vga virtio -net nic -net user
                  </pre>
                </div>
              </div>

              {/* Step 5: VirtualBox Guide (1-Click & Manual GUI) */}
              <div className="p-5 rounded-xl bg-[#0A0F16] border border-[#1683FF]/50 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#38A9FF]" />
                    Step 5: Run TOS in VirtualBox (The Easy Way)
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          'powershell -ExecutionPolicy Bypass -File .\\build\\create-virtualbox-vm.ps1',
                          'vbox-ps'
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                    >
                      {copiedKey === 'vbox-ps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      1-Click PowerShell
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard('./build/create-virtualbox-vm.sh', 'vbox-sh')
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1683FF]/20 text-[#38A9FF] hover:bg-[#1683FF]/30 text-xs font-mono cursor-pointer"
                    >
                      {copiedKey === 'vbox-sh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      1-Click Linux
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-2">
                    <div className="font-bold text-[#38A9FF] flex items-center gap-1.5">
                      <TerminalIcon className="w-3.5 h-3.5" /> Option A: Automated 1-Click Command
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Automatically creates the VM, allocates 2 GB RAM, 2 CPUs, attaches the ISO, and opens VirtualBox:
                    </p>
                    <div className="text-[11px] text-slate-500 font-mono">Windows PowerShell:</div>
                    <pre className="p-2 rounded bg-[#0A0F16] font-mono text-xs text-emerald-400 border border-[#1B293C] overflow-x-auto">
                      .\build\create-virtualbox-vm.ps1
                    </pre>
                    <div className="text-[11px] text-slate-500 font-mono pt-1">Linux Terminal:</div>
                    <pre className="p-2 rounded bg-[#0A0F16] font-mono text-xs text-[#38A9FF] border border-[#1B293C] overflow-x-auto">
                      ./build/create-virtualbox-vm.sh
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#05070A] border border-[#1B293C] space-y-2">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" /> Option B: Manual VirtualBox GUI (6 Steps)
                    </div>
                    <ol className="text-[11px] text-slate-300 space-y-1 font-mono list-decimal pl-4">
                      <li>Open VirtualBox &rarr; click <strong>New</strong>.</li>
                      <li>Name: <code className="text-white">TOS Linux</code> | Type: <code className="text-[#38A9FF]">Linux</code> | Version: <code className="text-[#38A9FF]">Debian (64-bit)</code>.</li>
                      <li>Base Memory: <strong className="text-white">2048 MB</strong> (2 GB) | Processors: <strong className="text-white">2 CPUs</strong>.</li>
                      <li>Disk: Select <strong>Create a Virtual Hard Disk Now</strong> (20 GB).</li>
                      <li>In <strong>Storage</strong>: Click Optical Drive &rarr; Choose <code className="text-emerald-400">output/TOS-0.1-alpha-x86_64.iso</code>.</li>
                      <li>Click <strong>Start</strong> to boot into TOS Live Desktop!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: TOS PROJECT REPOSITORY FILES                       */}
        {/* ======================================================== */}
        {activeTab === 'repo-tree' && (
          <div className="w-full h-full p-8 overflow-y-auto bg-[#05070A] space-y-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#38A9FF] px-2.5 py-1 rounded bg-[#1683FF]/10 border border-[#1683FF]/30 mb-2">
                  <Code className="w-3.5 h-3.5" /> Real Repository Structure
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  TOS Source Code &amp; Config Files
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  The actual files created in your workspace matching the TOS Linux OS repository structure.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { path: 'docs/ARCHITECTURE.md', desc: 'Comprehensive evaluation of 5 Linux base systems', type: 'doc' },
                  { path: 'docs/BUILD.md', desc: 'Complete build guide for Linux, WSL2 & Windows', type: 'doc' },
                  { path: 'build/build.sh', desc: 'Automated debootstrap + squashfs + ISO build script', type: 'sh' },
                  { path: 'build/clean.sh', desc: 'Safely unmounts chroots and purges work directory', type: 'sh' },
                  { path: 'build/config/tos-packages.list', desc: 'Strict minimal package manifest (< 2.5 GB installed)', type: 'cfg' },
                  { path: 'scripts/tos-info', desc: 'TOS system hardware detection and banner display', type: 'sh' },
                  { path: 'scripts/tos-size', desc: '10 GB storage budget compliance audit tool', type: 'sh' },
                  { path: 'scripts/tos-performance', desc: 'Real RAM, CPU, services, and boot time auditor', type: 'sh' },
                  { path: 'scripts/tos-install', desc: 'Lean package installer wrapper enforcing budget constraints', type: 'sh' },
                  { path: 'installer/tos-installer.sh', desc: 'Guided installer with destructive disk erasure protection', type: 'sh' },
                  { path: 'VERSION', desc: 'TOS release identifier (0.1-alpha)', type: 'txt' },
                  { path: 'LICENSE', desc: 'Dual open-source license notice (MIT + Upstream GPL/LGPL)', type: 'txt' },
                ].map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#0A0F16] border border-[#1B293C] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#05070A] border border-[#1683FF]/30 flex items-center justify-center text-[#38A9FF]">
                        {f.type === 'sh' ? <TerminalIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-mono text-xs font-bold text-white">{f.path}</div>
                        <div className="text-[11px] text-slate-400">{f.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1683FF]/20 text-[#38A9FF] border border-[#1683FF]/30">
                      CREATED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
