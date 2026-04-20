import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function LoginPage() {
    const {login} = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({email: '', password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) {
            setError('Both fields are required.');
            return;
        }
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Welcome Back</h1>
                <p style={styles.subtitle}>ICSI 418Y — Project Manager</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        style={styles.input}
                        autoFocus
                    />

                    <label style={styles.label}>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={styles.input}
                    />

                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>Register here</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
    },
    card: {
        background: '#fff', borderRadius: 12,
        padding: '40px 36px', width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    },
    title: {margin: 0, fontSize: 28, fontWeight: 700, color: '#1a365d'},
    subtitle: {margin: '4px 0 24px', color: '#718096', fontSize: 14},
    error: {
        background: '#fff5f5', border: '1px solid #feb2b2',
        color: '#c53030', borderRadius: 8, padding: '10px 14px',
        marginBottom: 16, fontSize: 14,
    },
    form: {display: 'flex', flexDirection: 'column', gap: 6},
    label: {fontSize: 13, fontWeight: 600, color: '#4a5568', marginTop: 8},
    input: {
        padding: '10px 14px', borderRadius: 8,
        border: '1px solid #cbd5e0', fontSize: 15,
        outline: 'none', marginBottom: 4,
    },
    btn: {
        marginTop: 16, padding: '12px',
        backgroundColor: '#2b6cb0', color: '#fff',
        border: 'none', borderRadius: 8,
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
    },
    footer: {marginTop: 20, textAlign: 'center', fontSize: 13, color: '#718096'},
    link: {color: '#2b6cb0', fontWeight: 600},
};
