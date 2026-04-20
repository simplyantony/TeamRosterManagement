import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';

export default function HomePage() {
    const {user} = useAuth();

    const [teams, setTeams] = useState([]);
    const [projects, setProjects] = useState([]);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user?._id) return;
        const fetchDashboard = async () => {
            setLoading(true);
            setError('');
            try {
                const {data} = await api.get(`/home/${user._id}`);
                setTeams(data.teams || []);
                setProjects(data.projects || []);
                setStories(data.stories || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load dashboard.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    // Group projects by team, then stories by project
    const projectsByTeam = (teamId) =>
        projects.filter((p) => p.team_id?._id === teamId || p.team_id === teamId);

    const storiesByProject = (projId) =>
        stories.filter((s) => s.proj_id?._id === projId || s.proj_id === projId);

    const priorityBadge = (p) => {
        if (p >= 8) return {label: 'High', color: '#c53030', bg: '#fff5f5'};
        if (p >= 4) return {label: 'Medium', color: '#c05621', bg: '#fffaf0'};
        return {label: 'Low', color: '#276749', bg: '#f0fff4'};
    };

    return (
        <div style={styles.page}>
            <Navbar/>

            <main style={styles.main}>
                {/* ── Welcome Banner ── */}
                <div style={styles.banner}>
                    <div>
                        <h1 style={styles.welcome}>Welcome back, {user?.username}! 👋</h1>
                        <p style={styles.welcomeSub}>Here's an overview of your teams and projects.</p>
                    </div>
                    <div style={styles.bannerStats}>
                        <Stat label="Teams" value={teams.length}/>
                        <Stat label="Projects" value={projects.length}/>
                        <Stat label="Stories" value={stories.length}/>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && <div style={styles.error}>{error}</div>}

                {/* ── Loading ── */}
                {loading && (
                    <div style={styles.center}>
                        <div style={styles.spinner}/>
                        <p style={{color: '#718096', marginTop: 12}}>Loading your dashboard…</p>
                    </div>
                )}

                {/* ── Empty state ── */}
                {!loading && !error && teams.length === 0 && (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyIcon}>🚀</p>
                        <h2 style={styles.emptyTitle}>You're not on any teams yet</h2>
                        <p style={styles.emptySub}>
                            Ask a team manager to add you, or{' '}
                            <Link to="/team-roster" style={styles.emptyLink}>go to Team Roster</Link> to manage teams.
                        </p>
                    </div>
                )}

                {/* ── Teams ── */}
                {!loading && teams.length > 0 && (
                    <section>
                        <h2 style={styles.sectionTitle}>Your Teams</h2>
                        <div style={styles.teamGrid}>
                            {teams.map((team) => {
                                const teamProjects = projectsByTeam(team._id);
                                return (
                                    <div key={team._id} style={styles.teamCard}>
                                        {/* Team header */}
                                        <div style={styles.teamHeader}>
                                            <span style={styles.teamIcon}>👥</span>
                                            <h3 style={styles.teamName}>{team.name}</h3>
                                            <span style={styles.projectCount}>
                        {teamProjects.length} project{teamProjects.length !== 1 ? 's' : ''}
                      </span>
                                        </div>

                                        {/* Projects under this team */}
                                        {teamProjects.length === 0 ? (
                                            <p style={styles.noItems}>No projects assigned to this team.</p>
                                        ) : (
                                            <div style={styles.projectList}>
                                                {teamProjects.map((proj) => {
                                                    const projStories = storiesByProject(proj._id);
                                                    return (
                                                        <div key={proj._id} style={styles.projectCard}>
                                                            <div style={styles.projectHeader}>
                                                                <span style={styles.projectIcon}>📁</span>
                                                                <span style={styles.projectName}>{proj.name}</span>
                                                                <span style={styles.storyCount}>
                                  {projStories.length} stor{projStories.length !== 1 ? 'ies' : 'y'}
                                </span>
                                                            </div>

                                                            {/* Stories under this project */}
                                                            {projStories.length === 0 ? (
                                                                <p style={styles.noItems}>No user stories yet.</p>
                                                            ) : (
                                                                <ul style={styles.storyList}>
                                                                    {projStories.map((s) => {
                                                                        const badge = priorityBadge(s.priority);
                                                                        return (
                                                                            <li key={s._id} style={styles.storyItem}>
                                                                                <span
                                                                                    style={styles.storyText}>{s.user_story}</span>
                                                                                <span style={{
                                                                                    ...styles.priorityBadge,
                                                                                    color: badge.color,
                                                                                    background: badge.bg,
                                                                                }}>
                                          P{s.priority} · {badge.label}
                                        </span>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

function Stat({label, value}) {
    return (
        <div style={statStyles.box}>
            <span style={statStyles.value}>{value}</span>
            <span style={statStyles.label}>{label}</span>
        </div>
    );
}

const styles = {
    page: {minHeight: '100vh', backgroundColor: '#f7fafc'},
    main: {maxWidth: 1100, margin: '0 auto', padding: '32px 24px'},
    banner: {
        background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
        borderRadius: 12, padding: '28px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 32, flexWrap: 'wrap', gap: 16,
        boxShadow: '0 4px 20px rgba(26,54,93,0.25)',
    },
    welcome: {margin: 0, color: '#fff', fontSize: 26, fontWeight: 700},
    welcomeSub: {margin: '4px 0 0', color: '#bee3f8', fontSize: 14},
    bannerStats: {display: 'flex', gap: 16},
    error: {
        background: '#fff5f5', border: '1px solid #feb2b2',
        color: '#c53030', borderRadius: 8, padding: '12px 16px', marginBottom: 24,
    },
    center: {display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0'},
    spinner: {
        width: 40, height: 40,
        border: '4px solid #e2e8f0', borderTop: '4px solid #2b6cb0',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    },
    emptyState: {textAlign: 'center', padding: '60px 0'},
    emptyIcon: {fontSize: 56, margin: 0},
    emptyTitle: {color: '#2d3748', fontSize: 22, fontWeight: 700, margin: '16px 0 8px'},
    emptySub: {color: '#718096', fontSize: 15},
    emptyLink: {color: '#2b6cb0', fontWeight: 600},
    sectionTitle: {fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 16},
    teamGrid: {display: 'flex', flexDirection: 'column', gap: 20},
    teamCard: {
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden',
    },
    teamHeader: {
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 20px',
        background: '#ebf8ff', borderBottom: '1px solid #bee3f8',
    },
    teamIcon: {fontSize: 20},
    teamName: {margin: 0, fontSize: 17, fontWeight: 700, color: '#1a365d', flex: 1},
    projectCount: {
        fontSize: 12,
        color: '#2b6cb0',
        background: '#bee3f8',
        padding: '2px 10px',
        borderRadius: 12,
        fontWeight: 600
    },
    noItems: {color: '#a0aec0', fontSize: 13, padding: '12px 20px', margin: 0},
    projectList: {padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10},
    projectCard: {
        background: '#f7fafc', borderRadius: 8,
        border: '1px solid #e2e8f0', padding: '10px 14px',
    },
    projectHeader: {display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8},
    projectIcon: {fontSize: 16},
    projectName: {fontWeight: 600, fontSize: 14, color: '#2d3748', flex: 1},
    storyCount: {fontSize: 11, color: '#718096', background: '#edf2f7', padding: '2px 8px', borderRadius: 10},
    storyList: {margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6},
    storyItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        background: '#fff', border: '1px solid #e2e8f0',
        borderRadius: 6, padding: '7px 10px', gap: 10,
    },
    storyText: {fontSize: 13, color: '#4a5568', flex: 1},
    priorityBadge: {
        fontSize: 11, fontWeight: 700, padding: '2px 8px',
        borderRadius: 10, whiteSpace: 'nowrap',
    },
};

const statStyles = {
    box: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 20px',
        minWidth: 70,
    },
    value: {color: '#fff', fontSize: 24, fontWeight: 700, lineHeight: 1},
    label: {color: '#bee3f8', fontSize: 12, marginTop: 4},
};
