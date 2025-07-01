import React from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 shadow-sm hover:shadow-md',
    accent: 'bg-accent text-white hover:bg-accent/90 shadow-sm hover:shadow-md',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-gray-700 hover:bg-gray-100',
    success: 'bg-success text-white hover:bg-success/90 shadow-sm hover:shadow-md',
    warning: 'bg-warning text-white hover:bg-warning/90 shadow-sm hover:shadow-md',
    error: 'bg-error text-white hover:bg-error/90 shadow-sm hover:shadow-md'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && <ApperIcon name={icon} className="w-4 h-4" />}
      {children}
      {!loading && icon && iconPosition === 'right' && <ApperIcon name={icon} className="w-4 h-4" />}
    </motion.button>
  )
}

export default Button