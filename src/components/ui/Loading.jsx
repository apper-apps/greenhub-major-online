import React from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'

const Loading = ({ type = 'default', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded shimmer"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 shimmer"></div>
              </div>
            </div>
          </Card>
        )
      
      case 'table':
        return (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/4 shimmer"></div>
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded shimmer"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 shimmer"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 shimmer"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 shimmer"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg shimmer"></div>
                </div>
              </Card>
            ))}
          </div>
        )
      
      default:
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded shimmer mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 shimmer"></div>
              </div>
            ))}
          </div>
        )
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      {renderSkeleton()}
    </motion.div>
  )
}

export default Loading