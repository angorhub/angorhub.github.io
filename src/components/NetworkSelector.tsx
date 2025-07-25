import { useNetwork } from '@/contexts/NetworkContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function NetworkSelector() {
  const { network, setNetwork } = useNetwork();

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
