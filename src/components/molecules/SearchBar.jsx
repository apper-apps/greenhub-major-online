import React, { useState } from 'react'
import Input from '@/components/atoms/Input'
import Button from '@/components/atoms/Button'

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  onClear,
  className = '',
  showClearButton = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }
  
  const handleClear = () => {
    setSearchTerm('')
    onClear?.()
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        icon="Search"
        className="flex-1"
      />
      {showClearButton && searchTerm && (
        <Button
          variant="ghost"
          icon="X"
          onClick={handleClear}
          size="sm"
        />
      )}
    </div>
  )
}

export default SearchBar