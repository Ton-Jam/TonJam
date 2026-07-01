import React from 'react';

interface SafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  top = true,
  bottom = true,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full
        ${top ? 'pt-safe-top mt-safe-top' : ''}
        ${bottom ? 'pb-safe-bottom mb-safe-bottom' : ''}
        ${className}
      `}
      style={{
        paddingTop: top ? 'var(--sab, 0px)' : undefined,
        paddingBottom: bottom ? 'var(--sab, 0px)' : undefined,
      }}
    >
      {children}
    </div>
  );
};
