import React from 'react'
import { useEffect, useState } from 'react'
import api from '../services/api'
import { jwtDecode } from 'jwt-decode'
import '../style/kullanıcı.css'


const KullanıcıListe = () => {
    const [kullanıcılar, setKullanıcılar] = useState([]);

    const url = 'anasayfa/kullanıcılar/'

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get("anasayfa/kullanıcılar/");
                setKullanıcılar(response.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchUsers();
    }, [])

    return (
        <div className='kullaniciliste'>
            <h2 className='kullanici'>Kullanıcılar</h2>

            {kullanıcılar.map((kullanıcı) => (
                <div
                    className='kull'
                    key={kullanıcı.id}>
                    {kullanıcı.username}
                </div>
            ))}
        </div>
    );
}

export default KullanıcıListe