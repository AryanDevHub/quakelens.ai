// Disaster Data Types
export interface DisasterPoint {
  id: number;
  pos: [number, number];
  risk: 'HIGH' | 'MEDIUM' | 'SAFE';
  score: number;
  label: string;
}

// Chat Types
export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
  timestamp?: number;
}

// Tab Types
export type TabId = 'VISION' | 'PULSE' | 'CHAT' | 'MAP' | 'RADAR';

export interface TabConfig {
  id: TabId;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}

// Pulse Scan Types
export type PulseStatus = 'IDLE' | 'SCANNING' | 'RESULT';

export interface PulseState {
  status: PulseStatus;
  progress: number;
  score: number | null;
}

// Vision Types
export interface DetectionResult {
  label: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Offline Database Types
export interface OfflineProtocol {
  category: string;
  title: string;
  content: string;
  keywords: string[];
}

// API Response Types
export interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
  error?: {
    message: string;
    code: string;
  };
}
