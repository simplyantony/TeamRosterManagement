import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TeamRosterPage from './pages/TeamRosterPage';
import UserStoryPage from './pages/UserStoryPage';
import {BrowserRouter, Routes, Route, Navigete} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/" element={
                        <ProtectedRoute><HomePage/></ProtectedRoute>
                    }/>
                    <Route path="/team-roster" element{
                        <ProtectedRoute><TeamRosterPage/></ProtectedRoute>
                    } />
                    <Route path="/user-story" element={
                        <ProtectedRoute><UserStoryPage/></ProtectedRoute>
                    }/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}