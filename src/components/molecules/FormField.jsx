import React from 'react'
import Input from '@/components/atoms/Input'

const FormField = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  icon,
  className = '',
  ...props 
}) => {
  const handleChange = (e) => {
    onChange?.(e.target.value, name)
  }
  
  return (
    <div className={className}>
      <Input
        label={label}
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        error={error}
        icon={icon}
        {...props}
      />
    </div>
  )
}

export default FormField