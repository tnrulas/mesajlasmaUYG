import React from 'react'
import { Link } from 'react-router-dom'
import LoginregisterForm from '../components/loginregisterForm'

const Login = () => {
    return (
        <div>
            <LoginregisterForm method="login" />
            <Link to="/kayit">Hesabın yok mu ?</Link>
        </div>
    )
}

export default Login
