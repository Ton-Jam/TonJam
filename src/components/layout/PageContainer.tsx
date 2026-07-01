import React from 'react';
import { motion } from 'motion/react';
import { SafeArea } from './SafeArea';

interface PageContainerProps {
  children: React.ReactNode;
  animate?: boolean;
  className?: string;
  id?: string;
  hasPlayerSpacing?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  animate = true,
  className = '',
  id,
  hasPlayerSpacing = true,
}) => {
  const content = (
    <div
      id={id}
      className={`w-full min-h-screen flex flex-col ${
        hasPlayerSpacing ? 'pb-[160px]' : 'pb-[72px]'
      } ${className}`}
    >
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full"
      >
        <SafeArea top={true} bottom={false}>
          {content}
        </SafeArea>
      </motion.div>
    );
  }

  return <SafeArea top={true} bottom={false}>{content}</SafeArea>;
};
export default PageContainer;
