"use client"

import React, { useState } from "react"
import Link from "next/link"
import { InputField, SubmitButton, Captcha } from "@/components"

const AdminLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  })

  const validateForm = () => {
    let valid = true
    const newErrors = { email: "", password: "", form: "" }

    if (!email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    if (!password) {
      newErrors.password = "Password is required"
      valid = false
    }

    if (!captchaVerified) {
      newErrors.form = "Please complete the captcha verification"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Admin login attempt:", { email, password })
      setIsLoading(false)
      // Here you would normally redirect on success
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 border-t-4 border-red-500">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Secure access to administration portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.form && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.form}</div>
          )}

          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your admin email"
            required
            error={errors.email}
          />

          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
            error={errors.password}
          />

          <Captcha onVerify={setCaptchaVerified} />

          <div className="mb-6">
            <SubmitButton text="Login" onClick={() => { }} isLoading={isLoading} disabled={isLoading} />
          </div>

          <div className="text-center text-sm">
            <Link href={""} to="/forgot-password" className="text-blue-500 hover:text-blue-700">
              Forgot password?
            </Link>
            <span className="mx-2">•</span>
            <Link href={""} to="/signup" className="text-blue-500 hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin