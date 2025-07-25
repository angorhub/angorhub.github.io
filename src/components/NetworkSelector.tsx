import { useNetwork } from '@/contexts/NetworkContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NetworkSelectorProps {
  variant?: 'compact' | 'full';
}

export function NetworkSelector({ variant = 'compact' }: NetworkSelectorProps) {
  const { network, setNetwork } = useNetwork();

  if (variant === 'full') {
    return (
      <Select value={network} onValueChange={setNetwork}>
        <SelectTrigger className="w-40">
          <SelectValue>
            <span className="text-sm font-medium">
              {network === 'mainnet' ? 'Bitcoin Mainnet' : 'Bitcoin Testnet'}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mainnet">
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Bitcoin Mainnet</span>
              <span className="text-xs text-muted-foreground">Live Bitcoin network</span>
            </div>
          </SelectItem>
          <SelectItem value="testnet">
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Bitcoin Testnet</span>
              <span className="text-xs text-muted-foreground">Test Bitcoin network</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center space-xl">   
      <Select value={network} onValueChange={setNetwork}>
        <SelectTrigger className="w-24 h-8">
          <SelectValue>
            <span className="text-sm font-medium">
              {network === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mainnet">
            <span className="text-sm">Mainnet</span>
          </SelectItem>
          <SelectItem value="testnet">
            <span className="text-sm">Testnet</span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
