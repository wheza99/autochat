"use client";

import { motion } from "framer-motion";
import { copy } from "./copy";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="pricing" className="py-20 bg-background">
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
              {copy.pricing.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {copy.pricing.subtitle}
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {copy.pricing.plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-2 border-primary shadow-lg hover:shadow-xl' 
                    : 'border-2 hover:border-primary/20 hover:shadow-lg'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-foreground mb-2">
                      {plan.name}
                    </CardTitle>
                    <div className="mb-4">
                      {plan.price === "Custom" ? (
                        <div className="text-4xl font-bold text-primary">
                          Custom
                        </div>
                      ) : (
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold text-primary">
                            Rp{plan.price}K
                          </span>
                          {plan.period && (
                            <span className="text-muted-foreground ml-1">
                              /{plan.period}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {plan.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, delay: index * 0.2 + featureIndex * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        asChild
                        className={`w-full py-3 rounded-xl font-semibold ${
                          plan.popular 
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                            : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                      >
                        <Link href="/register">
                          {plan.price === "Custom" ? "Hubungi Sales" : "Mulai Sekarang"}
                        </Link>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="bg-muted/50 border border-border rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Semua paket termasuk:
              </h3>
              <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Setup gratis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Training tim</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Support 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Garansi uang kembali</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}