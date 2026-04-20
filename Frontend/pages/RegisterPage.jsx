import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function RegisterPage() {
    const {register} = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({username: '', email: '', password: '', confirm: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.username || !form.email || !form.password)
            return setError('All fields are required.');
        if (form.password.length < 6)
            return setError('Password must be at least 6 characters.');
        if (form.password !== form.confirm)
            return setError('Passwords do not match.');

        setLoading(true);
        try {
            await register(form.username, form.email, form.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create Account</h1>
                <p style={styles.subtitle}>ICSI 418Y — Project Manager</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {[
                        {name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe'},
                        {name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com'},
                        {name: 'password', label: 'Password', type: 'password', placeholder: '••••••••'},
                        {name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••'},
                    ].map(({name, label, type, placeholder}) => (
                        <div key={name}>
                            <label style={styles.label}>{label}</label>
                            <input
                                type={type}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                style={styles.input}
                            />
                        </div>
                    ))}

                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? 'Creating account…' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>Sign in</Link>
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
    form: {display: 'flex', flexDirection: 'column', gap: 4},
    label: {display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginTop: 10},
    input: {
        width: '100%', boxSizing: 'border-box',
        padding: '10px 14px', borderRadius: 8,
        border: '1px solid #cbd5e0', fontSize: 15, outline: 'none',
    },
    btn: {
        marginTop: 20, padding: '12px',
        backgroundColor: '#2b6cb0', color: '#fff',
        border: 'none', borderRadius: 8,
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
    },
    footer: {marginTop: 20, textAlign: 'center', fontSize: 13, color: '#718096'},
    link: {color: '#2b6cb0', fontWeight: 600},
};
