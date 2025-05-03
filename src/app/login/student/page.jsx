"use client"

import React,{useState} from "react"
import Link from "next/link"
import { InputField,SubmitButton, Captcha } from "@/components"

const StudentLogin = () => {
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [captchaVerified, setCaptchaVerified] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({
        identifier: "",
        password: "",
        form: "",
    })

    const validateForm = () => {
        let valid = true
        const newErrors = { identifier: "", password: "", form: "" }

        if (!identifier) {
            newErrors.identifier = "Student ID or Email is required"
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
            console.log("Student login attempt:", { identifier, password })
            setIsLoading(false)
            // Here you would normally redirect on success
        }, 1500)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Student Login</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your student ID or email to access your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.form && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.form}</div>
                    )}

                    <InputField
                        label="Student ID or Email"
                        type="text"
                        value={identifier}
                        onChange={setIdentifier}
                        placeholder="Enter your student ID or email"
                        required
                        error={errors.identifier}
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

export default StudentLogin
