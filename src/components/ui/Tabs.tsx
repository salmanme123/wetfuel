import { cn } from '@/lib/cn';

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex gap-6" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              'inline-flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  activeTab === tab.key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
