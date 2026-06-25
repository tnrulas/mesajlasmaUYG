import React from 'react'
import KullanıcıListe from '../components/kullanıcıliste'
import MesajalaniOlustur from '../components/mesajalaniolustur'

const Home = () => {

    const styles = {
        sayfa: {
            backgroundColor: '#f1f5f9',
            minHeight: '100vh',
            padding: '40px 20px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
        },
        baslik: {
            textAlign: 'center',
            color: '#1e293b',
            marginBottom: '40px',
            fontSize: '2.5rem',
            fontWeight: '800',
            letterSpacing: '-1px'
        },
        icerikAlani: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '40px',
            flexWrap: 'wrap',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        solKolon: {
            flex: '1',
            minWidth: '300px',
            maxWidth: '400px'
        },
        sagKolon: {
            flex: '2',
            minWidth: '350px'
        }
    };

    return (
        <div style={styles.sayfa}>
            <h1 style={styles.baslik}>Ana Sayfa</h1>

            <div style={styles.icerikAlani}>
                {/* <div style={styles.solKolon}>
                    <KullanıcıListe />
                </div> */}

                <div style={styles.sagKolon}>
                    <MesajalaniOlustur />
                </div>
            </div>
        </div>
    )
}

export default Home;
