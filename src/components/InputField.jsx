"use client"

import React from "react"


const InputField = ({
  label,
  type,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`shadow appearance-none border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500`}
      />
      {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
    </div>
  )
}

export default InputField
