import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function ProtectedRoute({children}) {
    const {user, loading} = useAuth();

    if(loading) {
        return (
            <div style={styles.center}>
                <div style={styles.spinner} />
            </div>
        );
    }
    return user ? children: <Navigate to="/login" replace />;
}

const styles = {
    center: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', backgroundColor: '#f0f4f8',
    },
    spinner: {
        width: 40, height: 40,
        border: '4px solid #cbd5e0',
        borderTop: '4px solid #2b6cb0',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};