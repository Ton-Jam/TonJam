import { MoveUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface ProjectsTypes {
  id: string;
  img: string;
  title: string;
  des: string;
}

export default function ConditionGrid({ projects = [] }: { projects?: ProjectsTypes[] }) {
  if (projects.length === 0) return null;

  return (
    <>
      <div className='grid grid-cols-12 gap-4 overflow-hidden px-5 lg:pb-5 pb-2'>
        {projects.map((project, index) => {
          let colSpanClass = 'sm:col-span-6 col-span-12 ';
          if (index === 0) {
            colSpanClass = ' sm:col-span-5 col-span-12 ';
          } else if (index === 1) {
            colSpanClass = 'sm:col-span-7 col-span-12 ';
          } else if (index === projects.length - 2) {
            colSpanClass = 'sm:col-span-7 col-span-12 ';
          } else if (index === projects.length - 1) {
            colSpanClass = 'sm:col-span-5 col-span-12 ';
          }
          return (
            <React.Fragment key={project.id ?? project.title}>
              <motion.article
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ ease: 'easeOut' }}
                viewport={{ once: false }}
                className={` relative ${colSpanClass} `}
              >
                <div className='w-auto h-full'>
                  <img
                    src={project?.img}
                    alt={project.title || 'image'}
                    height={600}
                    width={1200}
                    className='h-full w-full object-cover rounded-xl'
                  />
                </div>
                <div className='absolute lg:bottom-2 bottom-0 text-black w-full p-4 flex justify-between items-center'>
                  <h3 className='lg:text-xl text-sm bg-black text-white rounded-xl p-2 px-4'>
                    {project.title}
                  </h3>
                  <div className='lg:w-12 w-10 lg:h-12 h-10 text-white grid place-content-center rounded-full bg-black'>
                    <MoveUpRight />
                  </div>
                </div>
              </motion.article>
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
