import { AlertCircle, Check, X } from 'lucide-react';
import { Button } from './Button';

interface ToolApprovalCardProps {
  toolName: string;
  input: unknown;
  onApprove: () => void;
  onDeny: () => void;
  isResponding?: boolean;
}

const formatValue = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

const buildSummary = (toolName: string, input: unknown): string => {
  const args = (input ?? {}) as Record<string, unknown>;

  if (toolName === 'send_command' && args.command) {
    return `Send command: ${formatValue(args.command)}`;
  }

  if (toolName === 'update_config') {
    const changes = Object.entries(args)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k} → ${formatValue(v)}`)
      .join(', ');
    return `Update config: ${changes}`;
  }

  return `Run ${toolName.replace(/_/g, ' ')}`;
};

export const ToolApprovalCard = ({
  toolName,
  input,
  onApprove,
  onDeny,
  isResponding = false,
}: ToolApprovalCardProps) => {
  const summary = buildSummary(toolName, input);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
      <span className="flex-1 text-amber-900">{summary}</span>
      <div className="flex shrink-0 gap-1">
        <Button variant="outline" size="sm" onClick={onDeny} disabled={isResponding}>
          <X className="h-3 w-3" />
        </Button>
        <Button variant="primary" size="sm" onClick={onApprove} disabled={isResponding}>
          <Check className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
