import React from 'react'
import LoginregisterForm from '../components/loginregisterForm'
import { Link } from 'react-router-dom'

function Register() {
    return (
        <div>
            <LoginregisterForm method="register" />
            <Link to="/">hesabın var mı ?</Link>
        </div>
    )
}

export default Register
