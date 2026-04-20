import {NavLink, useNavigate } from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function Navbar() {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleSignout = async () => {
        await logout();
        navigate('/login');
    };

    return(
        <nav style = {styles.nav}>
            <div style={styles.brand}>
                <span style={styles.brandText}>ICSI 418Y</span>
                <span style={styles.brandSub}>Project Manager</span>
            </div>

            <div style={styles.links}>
                <NavLink
                    to="/"
                    end
                    style={({isActive}) => ({...styles.link, ...(isActive ? styles.activeLink : {}) })}>
                    Home
                </NavLink>
                <NavLink
                to="/team-roster"
                style={({isActive}) => ({...styles.link, ...(isActive ? styles.activeLink : {}) })}>
                    Team Roster
                </NavLink>
                <NavLink
                to="/user-story"
                style={({isActive}) => ({...styles.link, ...(isActive ? styles.activeLink : {}) })}>
                    User Stories
                </NavLink>
            </div>

            <div style={styles.userSection}>
                {user && <span style={styles.username}> {user.username}</span>}
                <button onClick={handleSignout} style={styles.signOutBtn}>
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: 60,
        backgroundColor: '#1a365d',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    brand: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: 1.1,
    },
    brandText: {
        color: '#fff',
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: 1,
    },
    brandSub: {
        color: '#90cdf4',
        fontSize: 11,
    },
    links: {
        display: 'flex',
        gap: 6,
    },
    link: {
        color: '#bee3f8',
        textDecoration: 'none',
        padding: '6px 14px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        transition: 'background 0.15s',
    },
    activeLink: {
        backgroundColor:'#2b6cb0',
        color: '#fff',
        },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    username: {
        color: '#90cdf4',
        fontSize: 13,
    },
    signOutBtn: {
        backgroundColor: '#e53e3e',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
    },
};