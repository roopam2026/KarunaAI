import React from 'react';
import { motion } from 'motion/react';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-light leading-tight"
          >
            Outrospection <br />
            <span className="serif-italic text-karuna-olive">for a better world</span>
          </motion.h1>
          <p className="text-stone-500 mt-4 max-w-xl leading-relaxed text-lg">
            KarunaAI is your companion in building a more empathetic world. 
            Through mindful dialogue and prosocial nudges, we augment human intelligence with the power of kindness.
          </p>
        </div>
      </div>
    </div>
  );
}

