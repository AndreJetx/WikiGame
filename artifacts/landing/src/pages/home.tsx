import React, { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { Sparkles, Swords, Shield, Heart, Skull, Trophy, BookOpen, Zap, ExternalLink } from "lucide-react";
import { useListCategories } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { wikiUrl } from "@/lib/wiki-url";

// @ts-ignore - Vite handles this import
import coverImage from "@assets/legend-of-elements-upcoming-launch-cover_1779364693164.jpg";

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Swords,
  Shield,
  Heart,
  Skull,
  Trophy,
  BookOpen,
  Zap,
};

const MotionCard = motion(Card);

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: i % 3 === 0 ? "rgba(212, 160, 23, 0.6)" : "rgba(100, 200, 255, 0.4)",
            width: Math.random() * 4 + 1 + "px",
            height: Math.random() * 4 + 1 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
          }}
          animate={{
            y: [0, -100 - Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background z-10" />
        <img
          src={coverImage}
          alt="Legend of Elements"
          className="w-full h-full object-cover object-top"
        />
      </div>

      <FloatingParticles />

      {/* Content */}
      <div className="container relative z-20 mx-auto px-4 text-center mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="mb-6 flex flex-col items-center leading-none">
            <span className="font-serif text-sm sm:text-base md:text-lg tracking-[0.45em] uppercase text-foreground/90 mb-1 md:mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
              Legend of
            </span>
            <span className="font-mitshuka text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-foreground drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)] [text-shadow:0_0_28px_rgba(212,160,23,0.35)]">
              Elements
            </span>
          </h1>
          <p className="text-xl md:text-3xl font-light text-foreground/90 mb-12 tracking-[0.2em] font-serif">
            A Jornada Rumo à Imortalidade
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="https://elementsh5.joynetgame.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-yellow-300/30 shadow-[0_0_20px_rgba(212,160,23,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,160,23,0.6)]"
              >
                Começar Agora
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
            </a>
            
            <a href={wikiUrl("/")} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2 border-primary/50 text-primary hover:bg-primary/10 transition-all hover:scale-105"
              >
                Explorar a Wiki
                <BookOpen className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureSection() {
  const features = [
    {
      title: "Cultivo Espiritual",
      description: "Ascenda através de 9 reinos de cultivo, desde um mortal comum até se tornar um soberano imortal.",
      icon: Zap,
    },
    {
      title: "Bestas Espirituais",
      description: "Dome, crie e evolua companheiros espirituais poderosos para lutar ao seu lado.",
      icon: Sparkles,
    },
    {
      title: "Guerras de Guildas",
      description: "Junte-se a clãs majestosos e batalhe pela supremacia em territórios sagrados.",
      icon: Swords,
    },
  ];

  return (
    <section className="py-24 relative bg-background overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-primary mb-4"
          >
            O Caminho do Cultivador
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <MotionCard
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                whileHover={{ y: -10, borderColor: "hsl(var(--primary))", boxShadow: "0 0 20px rgba(212,160,23,0.2)" }}
                className="bg-card border-card-border/50 group cursor-default"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-serif text-foreground/90">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </MotionCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WikiSection() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <section className="py-24 relative bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4">Pergaminhos Sagrados</h2>
            <p className="text-lg text-muted-foreground">
              Desvende os segredos do universo na Wiki oficial. Conhecimento é poder na jornada para a imortalidade.
            </p>
          </div>
          <a href={wikiUrl("/")}>
            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              Ver Todos os Artigos
            </Button>
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-card border-card-border/50">
                <CardHeader>
                  <Skeleton className="w-10 h-10 rounded-md mb-2 bg-muted/50" />
                  <Skeleton className="h-6 w-3/4 bg-muted/50" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-muted/50" />
                  <Skeleton className="h-4 w-2/3 bg-muted/50" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((category, i) => {
              const IconComponent = iconMap[category.icon || "BookOpen"] || BookOpen;
              return (
                <a key={category.id} href={wikiUrl(`/wiki/${category.slug}`)} className="block h-full">
                  <MotionCard
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.1 }}
                    whileHover={{ scale: 1.03, borderColor: "hsl(var(--primary))" }}
                    className="h-full bg-card border-card-border/50 hover:bg-card/80 transition-all flex flex-col"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <div className="p-2 rounded-md bg-secondary/20 text-secondary">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        {category.articleCount !== undefined && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                            {category.articleCount} arts
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-serif">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <CardDescription className="text-sm">
                        {category.description || "Explore esta categoria para mais conhecimento."}
                      </CardDescription>
                    </CardContent>
                  </MotionCard>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-32 relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-background z-0" />
      <div className="absolute inset-0 bg-crimson-glow opacity-40 z-0 animate-pulse" />
      <FloatingParticles />
      
      <div className="container relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Shield className="w-16 h-16 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-primary to-secondary drop-shadow-md mb-6 uppercase tracking-wider">
            A Imortalidade Aguarda
          </h2>
          <p className="text-xl text-muted-foreground mb-10 font-light">
            O destino do reino espiritual está em suas mãos. Inicie seu cultivo, reúna aliados e reescreva as lendas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="https://elementsh5.joynetgame.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 px-10 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-yellow-300/30 shadow-[0_0_20px_rgba(212,160,23,0.4)] hover:shadow-[0_0_40px_rgba(212,160,23,0.6)] transition-all"
              >
                Começar Sua Jornada
              </Button>
            </a>
            
            <a href={wikiUrl("/")} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-16 px-10 text-xl font-bold border-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                Explorar a Wiki
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-black py-8 border-t border-border/30">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-lg font-serif font-bold text-foreground/90">Legend of Elements</span>
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Legend of Elements. Todos os direitos reservados.
        </p>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="https://elementsh5.joynetgame.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            Jogo Oficial
          </a>
          <a href={wikiUrl("/")} className="text-muted-foreground hover:text-primary transition-colors">
            Wiki
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      <HeroSection />
      <FeatureSection />
      <WikiSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
