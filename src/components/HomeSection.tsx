import React from 'react';
import SectionHeader from './SectionHeader';

interface HomeSectionProps {
  title: string;
  icon: React.ElementType;
  link?: string;
  children: React.ReactNode;
}

const HomeSection: React.FC<HomeSectionProps> = ({ title, icon: Icon, link, children }) => {
  return (
    <section className="section-container bg-[#060c1f] p-4 rounded-3xl">
      <SectionHeader title={title} viewAllLink={link} />
      <div className="scroll-row">
        {children}
      </div>
    </section>
  );
};

export default HomeSection;
