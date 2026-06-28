import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { ACCESS_TOKEN } from "../services/constants";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import '../style/Mesajlasma.css';

const Mesajlasma = () => {
    const { conversationId } = useParams();
    const [currentUser, setCurrentUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(null)
    const [newMessage, setNewMessage] = useState("");
    const socketRef = useRef(null);


    const messagesEndRef = useRef(null);

    const navigation = useNavigate();


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const selfuser = localStorage.getItem(ACCESS_TOKEN);
        if (selfuser) {
            const decodedToken = jwtDecode(selfuser);
            setCurrentUser(decodedToken.user_id);
        }
    }, []);

    useEffect(() => {
        const fetchConversationData = async () => {
            if (!conversationId) return;

            try {
                setLoading(true)
                const response = await api.get(`anasayfa/${conversationId}/mesajlar/`)
                setMessages(response.data)
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false)
            }
        }
        fetchConversationData();
    }, [conversationId])

    useEffect(() => {
        if (!conversationId) return;

        let websocket = null;
        let reconnectTimeout = null;
        let isUnmounting = false;

        const connect = () => {
            if (isUnmounting) return;
            const token = localStorage.getItem(ACCESS_TOKEN);
            const websocket = new WebSocket(
                `wss://mesajlasmauyg-1.onrender.com/ws/chat/${conversationId}/?token=${token}`
            );
            socketRef.current = websocket;

            websocket.onopen = () => {
                console.log("WebSocket açıldı");

            };

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "chat_message") {
                    const { gönderici, icerik, gönderilme_tarihi, id } = data;
                    setMessages((prev) => [
                        ...prev,
                        { gönderici: { id: id, username: gönderici }, icerik, gönderilme_tarihi }
                    ]);
                }
            };

            websocket.onclose = async () => {
                setSocket(null);


                try {
                    const res = await api.get("anasayfa/");
                    const bul = res.data.some(
                        (ve) => String(ve.id) === String(conversationId)
                    );
                    if (!bul) {
                        navigation("/home");
                        return;
                    }
                } catch (_) { }


                if (!isUnmounting) {
                    console.log("Yeniden bağlanılıyor...");
                    reconnectTimeout = setTimeout(connect, 2000);
                }
            };

            websocket.onerror = () => {
                websocket.close();
            };
        };

        connect();

        return () => {
            isUnmounting = true;
            clearTimeout(reconnectTimeout);
            websocket?.close();
        };
    }, [conversationId]);


    const handleSendMessage = () => {
        if (!conversationId || !newMessage.trim()) return;

        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "chat_message",
                message: newMessage,
                user: currentUser,
            }));
            setNewMessage("");
        } else {
            console.error("WebSocket is not open.");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    }

    return (
        <div className="mesajlasma-ana-kutu">
            <div className="mesajlasma-baslik">
                <h2>Oda {conversationId}</h2>
            </div>

            <div className="mesajlar-alani">
                {messages.map((message, index) => {

                    const bizimMesajMi = String(message.gönderici.id) === String(currentUser);

                    return (
                        <div className={`mesaj-satiri ${bizimMesajMi ? 'benim-mesajim' : 'karsi-mesaj'}`} key={index}>
                            <div className="mesaj-balonu">
                                <span className="gonderici-isim">{message.gönderici.username}</span>
                                <span className="mesaj-metni">{message.icerik}</span>
                            </div>
                        </div>
                    )
                })}

                <div ref={messagesEndRef} />
            </div>

            <div className="mesaj-yazma-alani">
                <input
                    type="text"
                    className="mesaj-input"
                    placeholder="Bir mesaj yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="gonder-buton" onClick={handleSendMessage}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default Mesajlasma;