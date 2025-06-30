import React, { useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabNavigationProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = ''
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  
  const activeTab = controlledActiveTab || internalActiveTab;
  
  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variants = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700',
      active: 'border-blue-500 text-blue-600',
      inactive: 'text-gray-500'
    },
    pills: {
      container: 'bg-gray-100 rounded-lg p-1',
      tab: 'rounded-md transition-all duration-300 hover:bg-white hover:shadow-sm',
      active: 'bg-white shadow-sm text-blue-600',
      inactive: 'text-gray-600 hover:text-gray-900'
    },
    underline: {
      container: 'space-x-8',
      tab: 'relative pb-2 transition-all duration-300',
      active: 'text-blue-600',
      inactive: 'text-gray-500 hover:text-gray-700'
    }
  };

  const currentVariant = variants[variant];

  return (
    <div className={className}>
      <div className={`flex ${fullWidth ? 'w-full' : ''} ${currentVariant.container}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                ${sizes[size]}
                ${currentVariant.tab}
                ${isActive ? currentVariant.active : currentVariant.inactive}
                ${fullWidth ? 'flex-1' : ''}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                flex items-center justify-center space-x-2 font-medium transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2
              `}
            >
              {Icon && (
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              )}
              <span>{tab.label}</span>
              
              {tab.badge && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full font-medium
                  ${isActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
              
              {variant === 'underline' && isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};