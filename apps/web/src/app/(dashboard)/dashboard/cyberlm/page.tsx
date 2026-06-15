import { Header } from '@/components/layout/header';
import { CyberLM } from '@/components/cyberlm/cyber-lm';

export default function CyberLMPage() {
  return (
    <div className="animate-in">
      <Header
        title="CyberLM"
        subtitle="AI-powered incident response copilot — analyze threats, get structured response guidance"
      />
      <div style={{ padding: 24 }}>
        <CyberLM />
      </div>
    </div>
  );
}
