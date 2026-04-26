import {useState, useEffect} from 'react';
import Select from 'react-select';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';

export default function TeamRosterPage() {
    // ── Data state ────────────────────────────────────────────────────────
    const [teams, setTeams] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [currentMembers, setCurrentMembers] = useState([]);

    // ── UI state ──────────────────────────────────────────────────────────
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedToAdd, setSelectedToAdd] = useState([]);  // react-select values
    const [selectedToRemove, setSelectedToRemove] = useState([]);  // react-select values

    const [loadingTeams, setLoadingTeams] = useState(true);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const [removingMembers, setRemovingMembers] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ── On mount: fetch teams + all users ─────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [teamsRes, usersRes] = await Promise.all([
                    api.get('/teams'),
                    api.get('/users'),
                ]);
                setTeams(teamsRes.data);
                setAllUsers(usersRes.data);
            } catch (err) {
                setError('Failed to load teams or users.');
            } finally {
                setLoadingTeams(false);
            }
        };
        init();
    }, []);

    // ── When a team is selected: load its current roster ─────────────────
    useEffect(() => {
        if (!selectedTeam) {
            setCurrentMembers([]);
            setSelectedToAdd([]);
            setSelectedToRemove([]);
            return;
        }
        const fetchRoster = async () => {
            setLoadingRoster(true);
            setError('');
            setSuccess('');
            setSelectedToAdd([]);
            setSelectedToRemove([]);
            try {
                const {data} = await api.get(`/roster/${selectedTeam.value}`);
                setCurrentMembers(data); // array of { _id, member_id: { _id, username, email } }
            } catch (err) {
                setError('Failed to load roster for this team.');
            } finally {
                setLoadingRoster(false);
            }
        };
        fetchRoster();
    }, [selectedTeam]);

    // ── Derived option lists for react-select ─────────────────────────────
    const currentMemberIds = new Set(currentMembers.map((r) => r.member_id?._id || r.member_id));

    // Available to add = all users NOT already on this team
    const addOptions = allUsers
        .filter((u) => !currentMemberIds.has(u._id))
        .map((u) => ({value: u._id, label: `${u.username} (${u.email})`}));

    // Available to remove = current members
    const removeOptions = currentMembers.map((r) => ({
        value: r.member_id?._id || r.member_id,
        label: `${r.member_id?.username || 'Unknown'} (${r.member_id?.email || ''})`,
    }));

    // ── Add members ───────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!selectedTeam) return setError('Please select a team first.');
        if (selectedToAdd.length === 0) return setError('Please select at least one member to add.');
        setError('');
        setSuccess('');
        setAddingMembers(true);
        try {
            const member_ids = selectedToAdd.map((o) => o.value);
            const {data} = await api.post('/roster', {team_id: selectedTeam.value, member_ids});
            setSuccess(`Added ${data.added.length} member(s).${data.skipped.length > 0 ? ` (${data.skipped.length} already on team, skipped)` : ''}`);
            // Refresh roster
            const updated = await api.get(`/roster/${selectedTeam.value}`);
            setCurrentMembers(updated.data);
            setSelectedToAdd([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add members.');
        } finally {
            setAddingMembers(false);
        }
    };

    // ── Remove members ────────────────────────────────────────────────────
    const handleRemove = async () => {
        if (!selectedTeam) return setError('Please select a team first.');
        if (selectedToRemove.length === 0) return setError('Please select at least one member to remove.');
        setError('');
        setSuccess('');
        setRemovingMembers(true);
        try {
            const member_ids = selectedToRemove.map((o) => o.value);
            const {data} = await api.delete('/roster', {data: {team_id: selectedTeam.value, member_ids}});
            setSuccess(data.message || 'Members removed.');
            const updated = await api.get(`/roster/${selectedTeam.value}`);
            setCurrentMembers(updated.data);
            setSelectedToRemove([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove members.');
        } finally {
            setRemovingMembers(false);
        }
    };

    // ── Team options for react-select ──────────────────────────────────────
    const teamOptions = teams.map((t) => ({value: t._id, label: t.name}));

    return (
        <div style={styles.page}>
            <Navbar/>
            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={styles.title}>👥 Team Roster Management</h1>
                    <p style={styles.subtitle}>Add or remove members from a team. You can select multiple members at
                        once.</p>
                </div>

                {/* ── Feedback ── */}
                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.successBox}>{success}</div>}

                {/* ── Team Selector ── */}
                <div style={styles.card}>
                    <label style={styles.label}>Select a Team</label>
                    {loadingTeams ? (
                        <p style={styles.muted}>Loading teams…</p>
                    ) : teams.length === 0 ? (
                        <p style={styles.muted}>No teams found. Create one first.</p>
                    ) : (
                        <Select
                            options={teamOptions}
                            value={selectedTeam}
                            onChange={(opt) => {
                                setSelectedTeam(opt);
                                setError('');
                                setSuccess('');
                            }}
                            placeholder="-- Choose a team --"
                            isClearable
                            styles={selectStyles}
                        />
                    )}
                </div>

                {/* ── Current Roster ── */}
                {selectedTeam && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>
                            Current Members
                            <span style={styles.badge}>{currentMembers.length}</span>
                        </h2>
                        {loadingRoster ? (
                            <p style={styles.muted}>Loading roster…</p>
                        ) : currentMembers.length === 0 ? (
                            <p style={styles.muted}>This team has no members yet.</p>
                        ) : (
                            <ul style={styles.memberList}>
                                {currentMembers.map((r) => (
                                    <li key={r._id} style={styles.memberItem}>
                    <span style={styles.memberAvatar}>
                      {(r.member_id?.username || '?')[0].toUpperCase()}
                    </span>
                                        <div>
                                            <div style={styles.memberName}>{r.member_id?.username || 'Unknown'}</div>
                                            <div style={styles.memberEmail}>{r.member_id?.email || ''}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* ── Add Members ── */}
                {selectedTeam && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Add Members</h2>
                        <label style={styles.label}>
                            Select users to add to <strong>{selectedTeam.label}</strong>
                        </label>
                        <Select
                            isMulti
                            options={addOptions}
                            value={selectedToAdd}
                            onChange={setSelectedToAdd}
                            placeholder={addOptions.length === 0 ? 'All users are already on this team' : 'Search and select users…'}
                            isDisabled={addOptions.length === 0}
                            closeMenuOnSelect={false}
                            styles={selectStyles}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={addingMembers || selectedToAdd.length === 0}
                            style={{...styles.btn, ...styles.btnAdd}}
                        >
                            {addingMembers ? 'Adding…' : `Add ${selectedToAdd.length > 0 ? selectedToAdd.length : ''} Member(s)`}
                        </button>
                    </div>
                )}

                {/* ── Remove Members ── */}
                {selectedTeam && currentMembers.length > 0 && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Remove Members</h2>
                        <label style={styles.label}>
                            Select members to remove from <strong>{selectedTeam.label}</strong>
                        </label>
                        <Select
                            isMulti
                            options={removeOptions}
                            value={selectedToRemove}
                            onChange={setSelectedToRemove}
                            placeholder="Search and select members to remove…"
                            closeMenuOnSelect={false}
                            styles={selectStyles}
                        />
                        <button
                            onClick={handleRemove}
                            disabled={removingMembers || selectedToRemove.length === 0}
                            style={{...styles.btn, ...styles.btnRemove}}
                        >
                            {removingMembers ? 'Removing…' : `Remove ${selectedToRemove.length > 0 ? selectedToRemove.length : ''} Member(s)`}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    page: {minHeight: '100vh', backgroundColor: '#f7fafc'},
    main: {maxWidth: 760, margin: '0 auto', padding: '32px 24px'},
    header: {marginBottom: 28},
    title: {margin: 0, fontSize: 26, fontWeight: 700, color: '#1a365d'},
    subtitle: {margin: '6px 0 0', color: '#718096', fontSize: 14},
    card: {
        background: '#fff', borderRadius: 10,
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '22px 24px', marginBottom: 20,
    },
    cardTitle: {
        margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#2d3748',
        display: 'flex', alignItems: 'center', gap: 8,
    },
    badge: {
        background: '#ebf8ff', color: '#2b6cb0',
        fontSize: 12, fontWeight: 700,
        padding: '2px 10px', borderRadius: 12,
    },
    label: {display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 8},
    muted: {color: '#a0aec0', fontSize: 13, margin: 0},
    error: {
        background: '#fff5f5', border: '1px solid #feb2b2',
        color: '#c53030', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14,
    },
    successBox: {
        background: '#f0fff4', border: '1px solid #9ae6b4',
        color: '#276749', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14,
    },
    memberList: {margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8},
    memberItem: {display: 'flex', alignItems: 'center', gap: 12},
    memberAvatar: {
        width: 34, height: 34, borderRadius: '50%',
        background: '#2b6cb0', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14, flexShrink: 0,
    },
    memberName: {fontWeight: 600, fontSize: 14, color: '#2d3748'},
    memberEmail: {fontSize: 12, color: '#718096'},
    btn: {
        marginTop: 14, padding: '10px 22px',
        border: 'none', borderRadius: 8,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    btnAdd: {backgroundColor: '#2b6cb0', color: '#fff'},
    btnRemove: {backgroundColor: '#e53e3e', color: '#fff'},
};

const selectStyles = {
    control: (base) => ({
        ...base, borderRadius: 8, borderColor: '#cbd5e0', minHeight: 42,
        boxShadow: 'none', '&:hover': {borderColor: '#90cdf4'},
    }),
    multiValue: (base) => ({...base, backgroundColor: '#ebf8ff', borderRadius: 6}),
    multiValueLabel: (base) => ({...base, color: '#2b6cb0', fontWeight: 600}),
    multiValueRemove: (base) => ({...base, color: '#2b6cb0', '&:hover': {background: '#bee3f8'}}),
};
