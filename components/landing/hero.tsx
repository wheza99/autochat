"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { copy } from "./copy";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingElements, setFloatingElements] = useState<Array<{left: number, top: number, duration: number, delay: number}>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Generate consistent floating element positions on client side only
    const elements = Array.from({ length: 6 }, (_, i) => ({
      left: (i * 15 + Math.sin(i) * 10 + 10) % 100,
      top: (i * 20 + Math.cos(i) * 15 + 15) % 100,
      duration: 4 + (i % 3),
      delay: i * 0.3
    }));
    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--muted-foreground) / 0.05) 1px, transparent 1px)
          `,
            backgroundSize: "60px 60px, 40px 40px, 120px 120px",
          }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top decorative element */}
        <div className="absolute top-20 left-20">
          <motion.div
            className="w-32 h-32 rounded-full border-2 border-dashed border-primary/30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-20 right-20">
          <motion.div
            className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30"
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Floating chat bubbles */}
        {isClient && floatingElements.map((element, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
            }}
          >
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-primary/50 rounded-full" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive cursor effect */}
      <motion.div
        className="absolute w-4 h-4 pointer-events-none z-20 opacity-60"
        style={{
          left: mousePosition.x * 0.03,
          top: mousePosition.y * 0.03,
        }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      >
        <div className="w-full h-full bg-primary rounded-full" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-6 py-3 bg-primary/10 border border-primary/20 rounded-full">
              <span className="font-medium text-sm tracking-wide text-primary">
                {copy.hero.badge}
              </span>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
              <span className="block text-foreground">
                {copy.hero.title}
              </span>
              <span className="block text-2xl md:text-4xl lg:text-5xl font-light mt-2 text-primary">
                {copy.hero.subtitle}
              </span>
            </h1>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="relative bg-card/60 backdrop-blur-sm rounded-3xl p-8 border border-border max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground">
                {copy.hero.description}
              </p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="px-8 py-4 text-lg rounded-2xl">
                <Link href="/dashboard">
                  <span className="flex items-center gap-2">
                    <span>{copy.hero.primaryCta}</span>
                    <span className="text-xl">🚀</span>
                  </span>
                </Link>
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg rounded-2xl border-2">
                <Link href="#demo">
                  <span className="flex items-center gap-2">
                    <span>{copy.hero.secondaryCta}</span>
                    <span className="text-xl">👀</span>
                  </span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-20"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center text-muted-foreground"
            >
              <span className="text-sm font-medium mb-2 tracking-wide">
                Scroll untuk melihat fitur
              </span>
              <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}