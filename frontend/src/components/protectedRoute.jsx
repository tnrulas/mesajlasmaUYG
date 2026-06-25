import React from 'react'
import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../services/constants'
import api from '../services/api'
import { jwtDecode } from "jwt-decode"


function ProtectedRoute({ children }) {

    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        checkAuthentication().catch(() => setIsAuthenticated(false))
    }, [])

    const refresh = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthenticated(false);
            return
        }

        try {
            const response = await api.post("auth/yenile/", {
                refresh: refreshToken
            });

            const newAccess = response.data.access;
            localStorage.setItem(ACCESS_TOKEN, newAccess);

            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        }
    }

    const checkAuthentication = async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);

        if (!accessToken) {
            setIsAuthenticated(false);
            return
        }

        try {
            const decoded = jwtDecode(accessToken)
            const now = Date.now() / 1000

            if (decoded.exp < now) {
                await refresh()
            } else {
                setIsAuthenticated(true)
            }
        } catch (err) {
            setIsAuthenticated(false);
        }
    }

    if (isAuthenticated === null) {
        return <div>Loading...</div>
    }

    return isAuthenticated ? children : <Navigate to="/giris" />
}

export default ProtectedRoute
