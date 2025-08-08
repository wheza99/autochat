"use client";

import { motion } from "framer-motion";
import { copy } from "./copy";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {copy.stats.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {copy.stats.subtitle}
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {copy.stats.items.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className="mb-4"
                  >
                    <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
                      {stat.number}
                      <span className="text-2xl">{stat.suffix}</span>
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {stat.label}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground">
                <span className="font-semibold text-primary">Trusted by 1000+ companies</span> worldwide.
                Join the revolution of AI-powered customer service.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}