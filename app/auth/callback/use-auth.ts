"use client"

import { useState, useEffect } from "react"

export const useAuth = () => {
    const [authToken, setAuthToken] = useState<string | null>(null)
    const [apiUrl, setApiUrl] = useState<string | null>(null)

    useEffect(() => {
        // Retrieve the token and API URL from localStorage on component mount
        const storedToken = localStorage.getItem("authToken")
        const storedApiUrl = localStorage.getItem("apiUrl")

        if (storedToken) {
            setAuthToken(storedToken)
        }
        if (storedApiUrl) {
            setApiUrl(storedApiUrl)
        }
    }, [])

    // Function to set the token and store it in localStorage
    const setToken = (token: string) => {
        setAuthToken(token)
        localStorage.setItem("authToken", token)
    }

    // Function to set the API URL and store it in localStorage
    const setURL = (url: string) => {
        setApiUrl(url)
        localStorage.setItem("apiUrl", url)
    }

    // Function to remove the token from state and localStorage
    const removeToken = () => {
        setAuthToken(null)
        localStorage.removeItem("authToken")
        setApiUrl(null)
        localStorage.removeItem("apiUrl")
    }

    return {
        authToken,
        apiUrl,
        setToken,
        setURL,
        removeToken,
    }
}
