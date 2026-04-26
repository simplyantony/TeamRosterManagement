import {createContext, useContext, useState, useEffect, useCallback} from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (stored && token) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        const {data} = await api.post('/auth/login', {email, password});
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({_id: data._id, username: data.username, email: data.email}));
        setUser({_id: data._id, username: data.username, email: data.email});
        return data;
    }, []);

    const register = useCallback(async (username, email, password) => {
        const {data} = await api.post('/auth/register', {username, email, password});
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({_id: data._id, username: data.username, email: data.email}));
        setUser({_id: data._id, username: data.username, email: data.email});
        return data;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (_) {
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}