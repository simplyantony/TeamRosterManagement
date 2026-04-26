import {useState, useEffect} from 'react';
import Select from 'react-select';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';

export default function UserStoryPage() {
    // ── Data state ────────────────────────────────────────────────────────
    const [projects, setProjects] = useState([]);
    const [allStories, setAllStories] = useState([]);

    // ── Form state ────────────────────────────────────────────────────────
    const [selectedProject, setSelectedProject] = useState(null);
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(0);

    // ── UI state ──────────────────────────────────────────────────────────
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingStories, setLoadingStories] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filterProject, setFilterProject] = useState(null);

    // ── Fetch projects on mount ───────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const {data} = await api.get('/projects');
                setProjects(data);
            } catch (err) {
                setError('Failed to load projects.');
            } finally {
                setLoadingProjects(false);
            }
        };
        init();
        fetchStories();
    }, []);

    const fetchStories = async (projId) => {
        setLoadingStories(true);
        try {
            const url = projId ? `/stories?proj_id=${projId}` : '/stories';
            const {data} = await api.get(url);
            setAllStories(data);
        } catch (err) {
            // non-critical — don't block the form
        } finally {
            setLoadingStories(false);
        }
    };

    const handleFilterChange = (opt) => {
        setFilterProject(opt);
        fetchStories(opt?.value);
    };

    // ── Form validation ───────────────────────────────────────────────────
    const validate = () => {
        if (!selectedProject) return 'Please select a project.';
        if (!description.trim()) return 'Please enter a story description.';
        if (isNaN(Number(priority)) || Number(priority) < 0)
            return 'Priority must be a non-negative number.';
        return null;
    };

    // ── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const validationError = validate();
        if (validationError) return setError(validationError);

        setSubmitting(true);
        try {
            await api.post('/stories', {
                user_story: description.trim(),
                proj_id: selectedProject.value,
                priority: Number(priority),
            });
            setSuccess('User story created successfully!');
            setDescription('');
            setPriority(0);
            setSelectedProject(null);
            // Refresh story list
            fetchStories(filterProject?.value);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user story.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user story?')) return;
        try {
            await api.delete(`/stories/${id}`);
            setAllStories((prev) => prev.filter((s) => s._id !== id));
        } catch {
            setError('Failed to delete story.');
        }
    };

    const projectOptions = projects.map((p) => ({
        value: p._id,
        label: `${p.name}${p.team_id?.name ? ` (${p.team_id.name})` : ''}`,
    }));

    const priorityBadge = (p) => {
        if (p >= 8) return {color: '#c53030', bg: '#fff5f5', label: 'High'};
        if (p >= 4) return {color: '#c05621', bg: '#fffaf0', label: 'Medium'};
        return {color: '#276749', bg: '#f0fff4', label: 'Low'};
    };

    return (
        <div style={styles.page}>
            <Navbar/>
            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>📋 User Story Management</h1>
                    <p style={styles.subtitle}>Create and manage user stories for your projects.</p>
                </div>

                <div style={styles.layout}>
                    {/* ── Left: Create Form ── */}
                    <div style={styles.formCol}>
                        <div style={styles.card}>
                            <h2 style={styles.cardTitle}>Create User Story</h2>

                            {error && <div style={styles.error}>{error}</div>}
                            {success && <div style={styles.successBox}>{success}</div>}

                            <form onSubmit={handleSubmit}>
                                {/* Project Selector */}
                                <div style={styles.field}>
                                    <label style={styles.label}>Project *</label>
                                    {loadingProjects ? (
                                        <p style={styles.muted}>Loading projects…</p>
                                    ) : projects.length === 0 ? (
                                        <p style={styles.muted}>No projects found. Create a project first.</p>
                                    ) : (
                                        <Select
                                            options={projectOptions}
                                            value={selectedProject}
                                            onChange={(opt) => {
                                                setSelectedProject(opt);
                                                setError('');
                                            }}
                                            placeholder="-- Select a project --"
                                            isClearable
                                            styles={selectStyles}
                                        />
                                    )}
                                </div>

                                {/* Description */}
                                <div style={styles.field}>
                                    <label style={styles.label}>Story Description *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="As a user, I want to…"
                                        rows={4}
                                        style={styles.textarea}
                                    />
                                    <span style={styles.charCount}>{description.length} chars</span>
                                </div>

                                {/* Priority */}
                                <div style={styles.field}>
                                    <label style={styles.label}>
                                        Priority
                                        <span style={styles.labelHint}>(0 = lowest · 10 = highest, default: 0)</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        style={styles.numberInput}
                                    />
                                    {/* Visual priority scale */}
                                    <div style={styles.priorityScale}>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setPriority(n)}
                                                style={{
                                                    ...styles.scaleBtn,
                                                    background: Number(priority) === n ? '#2b6cb0' : '#edf2f7',
                                                    color: Number(priority) === n ? '#fff' : '#718096',
                                                }}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={styles.submitBtn}
                                >
                                    {submitting ? 'Creating…' : '+ Create Story'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Right: Story List ── */}
                    <div style={styles.listCol}>
                        <div style={styles.card}>
                            <div style={styles.listHeader}>
                                <h2 style={styles.cardTitle}>
                                    Existing Stories
                                    <span style={styles.badge}>{allStories.length}</span>
                                </h2>
                                <div style={{width: 220}}>
                                    <Select
                                        options={[{value: null, label: 'All Projects'}, ...projectOptions]}
                                        value={filterProject}
                                        onChange={handleFilterChange}
                                        placeholder="Filter by project…"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </div>
                            </div>

                            {loadingStories ? (
                                <p style={styles.muted}>Loading stories…</p>
                            ) : allStories.length === 0 ? (
                                <div style={styles.emptyList}>
                                    <p style={{fontSize: 32, margin: 0}}>📭</p>
                                    <p style={styles.muted}>No user stories found.</p>
                                </div>
                            ) : (
                                <ul style={styles.storyList}>
                                    {allStories.map((s) => {
                                        const badge = priorityBadge(s.priority);
                                        return (
                                            <li key={s._id} style={styles.storyItem}>
                                                <div style={styles.storyTop}>
                          <span style={{
                              ...styles.priorityBadge,
                              color: badge.color, background: badge.bg,
                          }}>
                            P{s.priority} · {badge.label}
                          </span>
                                                    <span style={styles.projTag}>
                            📁 {s.proj_id?.name || 'Unknown Project'}
                          </span>
                                                    <button
                                                        onClick={() => handleDelete(s._id)}
                                                        style={styles.deleteBtn}
                                                        title="Delete story"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <p style={styles.storyText}>{s.user_story}</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    page: {minHeight: '100vh', backgroundColor: '#f7fafc'},
    main: {maxWidth: 1100, margin: '0 auto', padding: '32px 24px'},
    header: {marginBottom: 28},
    title: {margin: 0, fontSize: 26, fontWeight: 700, color: '#1a365d'},
    subtitle: {margin: '6px 0 0', color: '#718096', fontSize: 14},
    layout: {display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap'},
    formCol: {flex: '0 0 380px', minWidth: 300},
    listCol: {flex: 1, minWidth: 300},
    card: {
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '22px 24px',
    },
    cardTitle: {
        margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: '#2d3748',
        display: 'flex', alignItems: 'center', gap: 8,
    },
    listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
        flexWrap: 'wrap',
        gap: 10
    },
    badge: {
        background: '#ebf8ff', color: '#2b6cb0',
        fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 12,
    },
    field: {marginBottom: 16},
    label: {display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6},
    labelHint: {fontWeight: 400, color: '#a0aec0', marginLeft: 6, fontSize: 12},
    textarea: {
        width: '100%', boxSizing: 'border-box',
        padding: '10px 12px', borderRadius: 8,
        border: '1px solid #cbd5e0', fontSize: 14,
        resize: 'vertical', fontFamily: 'inherit',
        outline: 'none', lineHeight: 1.5,
    },
    charCount: {fontSize: 11, color: '#a0aec0', float: 'right', marginTop: 2},
    numberInput: {
        width: 80, padding: '8px 12px', borderRadius: 8,
        border: '1px solid #cbd5e0', fontSize: 16,
        outline: 'none', textAlign: 'center',
    },
    priorityScale: {display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap'},
    scaleBtn: {
        width: 30, height: 30, border: 'none',
        borderRadius: 6, cursor: 'pointer',
        fontWeight: 700, fontSize: 12,
        transition: 'all 0.12s',
    },
    submitBtn: {
        width: '100%', padding: '12px',
        backgroundColor: '#2b6cb0', color: '#fff',
        border: 'none', borderRadius: 8,
        fontSize: 15, fontWeight: 600, cursor: 'pointer',
        marginTop: 8,
    },
    error: {
        background: '#fff5f5', border: '1px solid #feb2b2',
        color: '#c53030', borderRadius: 8, padding: '10px 14px',
        marginBottom: 14, fontSize: 14,
    },
    successBox: {
        background: '#f0fff4', border: '1px solid #9ae6b4',
        color: '#276749', borderRadius: 8, padding: '10px 14px',
        marginBottom: 14, fontSize: 14,
    },
    muted: {color: '#a0aec0', fontSize: 13, margin: 0},
    emptyList: {textAlign: 'center', padding: '32px 0'},
    storyList: {margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10},
    storyItem: {
        background: '#f7fafc', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '12px 14px',
    },
    storyTop: {display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap'},
    priorityBadge: {
        fontSize: 11, fontWeight: 700, padding: '2px 8px',
        borderRadius: 10,
    },
    projTag: {fontSize: 12, color: '#718096', marginRight: 'auto'},
    deleteBtn: {
        background: 'none', border: 'none',
        color: '#fc8181', cursor: 'pointer',
        fontSize: 14, padding: '2px 6px',
        borderRadius: 4, marginLeft: 'auto',
    },
    storyText: {margin: 0, fontSize: 14, color: '#2d3748', lineHeight: 1.5},
};

const selectStyles = {
    control: (base) => ({
        ...base, borderRadius: 8, borderColor: '#cbd5e0', minHeight: 40,
        boxShadow: 'none', '&:hover': {borderColor: '#90cdf4'},
    }),
};
