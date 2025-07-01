import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Error = ({ 
  title = 'Something went wrong', 
  message = 'We encountered an error while loading your data. Please try again.',
  onRetry,
  showRetry = true,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${className}`}
    >
      <Card className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-error" />
        </div>
        
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          {showRetry && onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
              icon="RefreshCw"
            >
              Try Again
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export default Error