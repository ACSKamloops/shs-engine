/**
 * AnimatedCard - Reusable animated card with scroll reveal and hover effects
 * 
 * Features:
 * - Spring-based reveal on scroll
 * - Hover lift effect with shadow
 * - Optional glassmorphism
 * - Stagger support for lists
 */
import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
  glass = false,
  hover = true,
  onClick,
}: AnimatedCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const glassStyles = glass
    ? 'bg-white/70 backdrop-blur-md border border-white/40'
    : 'bg-white border border-gray-200';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: delay,
      }}
      whileHover={hover ? { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`rounded-2xl shadow-sm transition-colors ${glassStyles} ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * SectionReveal - Animated section wrapper with staggered children
 */
interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SectionReveal({ children, className = '', delay = 0 }: SectionRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - Container for staggered child animations
 */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.1 }: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerChildVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

/**
 * FloatingIcon - Animated floating icon with gentle bob
 */
interface FloatingIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
}

export function FloatingIcon({ icon, size = 'md', delay = 0 }: FloatingIconProps) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  };

  return (
    <motion.span
      className={`inline-block ${sizes[size]}`}
      animate={{
        y: [0, -6, 0],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay: delay,
      }}
    >
      {icon}
    </motion.span>
  );
}

/**
 * GlowButton - Premium button with glow effect
 */
interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function GlowButton({ children, onClick, variant = 'primary', className = '' }: GlowButtonProps) {
  const baseStyles = 'relative px-8 py-4 rounded-xl font-semibold transition-all overflow-hidden';
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25',
    secondary: 'bg-white text-emerald-700 border-2 border-emerald-200',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export default AnimatedCard;
