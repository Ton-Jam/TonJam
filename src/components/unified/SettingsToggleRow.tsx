import React from 'react';

export interface SettingsToggleRowProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SettingsToggleRow: React.FC<SettingsToggleRowProps> = ({
  icon: Icon,
  iconBgColor = 'bg-[#2E8CEB]/15',
  iconColor = 'text-[#2E8CEB]',
  title,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.06] ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-[#F5F7FB] truncate">
            {title}
          </span>
          {description && (
            <span className="text-xs text-[#91A8C5] line-clamp-1 mt-0.5">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
            checked ? 'bg-[#2E8CEB]' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ${
              checked ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default SettingsToggleRow;
