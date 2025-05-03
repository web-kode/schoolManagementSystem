"use client"

import React,{useState, useEffect} from "react";


const Captcha = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")

  // Generate a simple captcha
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaText(result)
    setUserInput("")
    setVerified(false)
    setError("")
    onVerify(false)
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleInputChange = (value) => {
    setUserInput(value)
    setError("")

    if (value === captchaText) {
      setVerified(true)
      onVerify(true)
    } else if (value.length === captchaText.length) {
      setError("Incorrect captcha. Please try again.")
      setVerified(false)
      onVerify(false)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Captcha Verification <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-col space-y-2">
        <div className="bg-amber-400 p-3 text-center font-mono text-lg tracking-wider select-none">{captchaText}</div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter the text above"
            className="shadow appearance-none border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1"
          />
          <button
            type="button"
            onClick={generateCaptcha}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-20 cursor-pointer rounded"
            aria-label="Refresh captcha"
          >
            ↻
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-1">{error}</p>}
      </div>
    </div>
  )
}

export default Captcha
