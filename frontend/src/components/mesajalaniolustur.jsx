import React from "react";
import api from "../services/api";
import { useState, useEffect } from "react";
import { ACCESS_TOKEN } from "../services/constants";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Mesajlasma from "./mesajolustur";
import { Switch } from '@progress/kendo-react-inputs';

import '../style/MesajalaniOlustur.css';

const MesajalaniOlustur = () => {
    const [conversations, setConversations] = useState([]);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([])
    const [search, setSearch] = useState("");
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [odaIsmi, setOdaIsmi] = useState("")
    const [izinVer, setIzinVer] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const mesajlasmaalanları = async () => {
            try {
                const conversationsresponse = await api.get("anasayfa/");
                setConversations(conversationsresponse.data)

                const usersresponse = await api.get("anasayfa/kullanıcılar/");
                setUsers(usersresponse.data)

                const selfuser = localStorage.getItem(ACCESS_TOKEN);
                if (selfuser) {
                    const decodedToken = jwtDecode(selfuser);
                    setCurrentUser(decodedToken.user_id);
                }

                const ayarResponse = await api.get("anasayfa/oda-izni/");
                setIzinVer(ayarResponse.data.oda_izni);
            } catch (error) {
                console.error(error);
            }
        };

        mesajlasmaalanları();
    }, []);

    const izinDegistir = async (e) => {
        const yeniDurum = e.value;

        setIzinVer(yeniDurum);

        try {
            await api.patch("anasayfa/oda-izni/", { oda_izni: yeniDurum });
        } catch (error) {
            console.error("Ayar güncellenemedi", error);
            alert("Ayar kaydedilirken hata oluştu!");

            setIzinVer(!yeniDurum);
        }
    };

    const alanolustur = async (e) => {
        e.preventDefault();

        try {
            const participants = Array.from(
                new Set([currentUser, ...selectedUsers])
            );

            if (participants.length < 2) {
                alert("En az 2 kişi seçmelisin");
                return;
            }

            const alanresponse = await api.post(
                "anasayfa/mesajlasma-alanı-olustur/",
                {
                    katılımcılar: participants,
                    isim: odaIsmi
                });

            setConversations((prev) => [...prev, alanresponse.data]);
            console.log(alanresponse.data);
            setSelectedUsers([]);
            setSearch("");
            setOdaIsmi("");
        } catch (error) {
            console.error("Alan oluşturma hatası:", error);
            alert("oda oluşturacağınız kişinin izni gereklidir");
        }
    }

    const kisifiltrele = users.filter((user) => (
        user.username.toLowerCase().includes(search.toLowerCase())
    ));

    const toggleUser = (id) => {
        setSelectedUsers((prev) =>
            prev.includes(id)
                ? prev.filter((u) => u !== id)
                : [...prev, id]
        );
    };

    const select = (conv) => {

        const izniVarMi = conv.katılımcılar.some((co) =>
            String(co.id) === String(currentUser)
        );

        if (izniVarMi) {
            navigate(`/home/chat/${conv.id}`);
            setSelectedConversation(conv.id);
        } else {
            alert("Bu odaya giriş izniniz bulunmuyor!");
        }

    }

    return (
        <div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                padding: '12px 24px',
                borderRadius: '12px',
            }}>
                <span style={{
                    fontWeight: '600',
                    color: '#334155',
                    fontSize: '0.95rem',
                    cursor: 'default'
                }}>
                    benimle oda oluşturmalarına izin ver
                </span>

                <Switch
                    checked={izinVer}
                    onChange={izinDegistir}
                    onLabel={"AÇIK"}
                    offLabel={"KAPALI"}
                />
            </div>

            <div className="mesaj-alani-container">

                <div className="islem-karti">
                    <h1 className="bolum-baslik">Mesaj Odası Oluştur</h1>
                    <form onSubmit={alanolustur} className="olustur-form">
                        <input
                            type="text"
                            className="arama-input"
                            placeholder="Kullanıcı ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="kullanici-liste-alani">
                            {kisifiltrele.map((user) => (
                                <div className="kullanici-secim-satir" key={user.id}>
                                    <span className="isim">{user.username}</span>
                                    <button
                                        type="button"
                                        className={`sec-buton ${selectedUsers.includes(user.id) ? 'secili' : ''}`}
                                        onClick={() => toggleUser(user.id)}
                                    >
                                        {selectedUsers.includes(user.id) ? "Seçili ✓" : "Seç"}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            className="arama-input"
                            placeholder="oda isimi oluştur"
                            value={odaIsmi}
                            onChange={(e) => setOdaIsmi(e.target.value)}
                        />

                        <button type="submit" className="ana-olustur-buton">Odayı Oluştur</button>
                    </form>
                </div>


                <div className="islem-karti">
                    <h1 className="bolum-baslik">Mevcut Odalar</h1>
                    <div className="odalar-izgara">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                className="oda-buton"
                                onClick={() => select(conv)}
                            >
                                <span className="oda-ikon">💬</span>
                                {conv.isim}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MesajalaniOlustur;