import { MoveUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface ProjectsTypes {
  id: string;
  img: string;
  title: string;
  des: string;
}

export default function NormalGrid({ projects = [] }: { projects?: ProjectsTypes[] }) {
  if (projects.length === 0) return null;

  return (
    <>
      <div className='lg:columns-2 columns-1 overflow-hidden px-5 pb-5'>
        {projects.map((project) => {
          return (
            <React.Fragment key={project.id ?? project.title}>
              <motion.article
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ ease: 'easeOut' }}
                viewport={{ once: false }}
                className="relative pb-4"
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
                <div className='absolute bottom-2 text-black w-full p-4 flex justify-between items-center'>
                  <h3 className='sm:text-xl text-sm bg-black text-white rounded-xl p-2 px-4'>
                    {project.title}
                  </h3>
                  <div className='w-12 h-12 text-white grid place-content-center rounded-full bg-black'>
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
