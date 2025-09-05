
'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


export function PingIndicator({ isConnected }: { isConnected: boolean }) {
  const status = isConnected ? 'good' : 'bad';

  const pingConfig = {
    good: { color: 'text-green-500', label: 'Monitor Connected', icon: <Wifi className={cn('h-5 w-5 transition-colors', 'text-green-500')} /> },
    bad: { color: 'text-red-500', label: 'Monitor Disconnected', icon: <WifiOff className={cn('h-5 w-5 transition-colors', 'text-red-500')} /> },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {pingConfig[status].icon}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{pingConfig[status].label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
