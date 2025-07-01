import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hoverable = false,
  padding = 'default',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-card border border-gray-100'
  
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const hoverClasses = hoverable ? 'cursor-pointer' : ''
  
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' } : {}}
      className={`${baseClasses} ${paddings[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card