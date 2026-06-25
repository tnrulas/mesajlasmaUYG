import React from 'react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../services/constants";
import { useNavigate } from "react-router-dom";
import '../style/giriskayit.css'
import { toast } from 'react-toastify';


const LoginregisterForm = ({ method }) => {
    const [kullanıcıadı, setkullanıcıadı] = useState("");
    const [sifre, setsifre] = useState("");
    const [yukleniyor, setyukleniyor] = useState(false)
    const [hataMesaji, setHataMesaji] = useState("")

    const navigate = useNavigate();

    const girisitetikle = async (event) => {
        event.preventDefault();
        setyukleniyor(true);
        setHataMesaji("");

        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);

        try {
            const url = method === "login"
                ? "auth/giris/"
                : "auth/kayit/";


            if (method === 'login') {
                const response = await api.post(url, {
                    username: kullanıcıadı,
                    password: sifre
                });

                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh)

                navigate("/home");
            } else if (method === 'register') {
                await api.post(url, {
                    username: kullanıcıadı,
                    password: sifre
                });
                toast.success("Kayıt başarılı! Lütfen giriş yapın.");
                navigate("/");
            }
        } catch (error) {
            if (error.response?.data?.username) {
                setHataMesaji(error.response.data.username[0]);
                toast.error("bu kullanıcı adı zaten alınmış");
            } else {
                setHataMesaji("Bir hata oluştu.");
            }
        } finally {
            setyukleniyor(false);
        }
    }
    return (
        <div className='girisregisterform'>
            <h2>{method === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
            <form onSubmit={girisitetikle}>
                <label htmlFor="kullanıcıadı">Kullanıcı Adı:</label>
                <input
                    type="text"
                    id="kullanıcıadı"
                    value={kullanıcıadı}
                    onChange={(e) => setkullanıcıadı(e.target.value)}
                />
                <label htmlFor="sifre">Şifre:</label>
                <input
                    type="password"
                    id="sifre"
                    value={sifre}
                    onChange={(e) => setsifre(e.target.value)}
                />
                <button type="submit" disabled={yukleniyor}>
                    {yukleniyor ? 'Yükleniyor...' : method === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </button>
            </form>
        </div>
    )
}


export default LoginregisterForm
