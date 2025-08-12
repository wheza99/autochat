"use client";

import { motion } from "framer-motion";
import { copy } from "./copy";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  ArrowRight
} from "lucide-react";

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <footer ref={ref} className="bg-background border-t border-border">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-primary mb-2">
                  {copy.footer.company.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {copy.footer.company.description}
                </p>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-3">
                {copy.footer.social.map((social, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      asChild
                    >
                      <Link href={social.url} target="_blank" rel="noopener noreferrer">
                        {social.name === 'Facebook' && <Facebook className="w-4 h-4" />}
                        {social.name === 'Twitter' && <Twitter className="w-4 h-4" />}
                        {social.name === 'Instagram' && <Instagram className="w-4 h-4" />}
                        {social.name === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h4 className="font-semibold text-foreground mb-4">
                {copy.footer.links.title}
              </h4>
              <ul className="space-y-3">
                {copy.footer.links.items.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.url}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="font-semibold text-foreground mb-4">
                {copy.footer.services.title}
              </h4>
              <ul className="space-y-3">
                {copy.footer.services.items.map((service, index) => (
                  <li key={index}>
                    <Link 
                      href={service.url}
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h4 className="font-semibold text-foreground mb-4">
                {copy.footer.newsletter.title}
              </h4>
              <p className="text-muted-foreground text-sm mb-4">
                {copy.footer.newsletter.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="Email Anda"
                    className="border-2 focus:border-primary"
                  />
                  <Button 
                    size="icon"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0"
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dengan berlangganan, Anda menyetujui kebijakan privasi kami.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {copy.footer.company.name}. Semua hak dilindungi.
            </div>
            
            {/* Legal Links */}
            <div className="flex gap-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Kebijakan Privasi
              </Link>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Syarat & Ketentuan
              </Link>
              <Link 
                href="/cookies" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                Kebijakan Cookie
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}