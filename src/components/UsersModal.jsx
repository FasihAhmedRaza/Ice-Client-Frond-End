import React, { useState, useEffect } from 'react';
import { X, Search, User, Mail, Calendar, Clock, ChevronDown } from 'lucide-react';
import api from '../api';
import './UsersModal.css';
import { API_BASE_URL } from '../config';

const getAvatarColor = (userId) => {
    if (!userId) return '#ccc';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
};

const UserAvatar = ({ user }) => {
    const avatarUrl = user.avatar_url;
    const displayName = user.display_name;
    const email = user.email;
    const identifier = displayName || email || '?';
    const initial = (displayName || email || '?')[0].toUpperCase();
    const bgColor = getAvatarColor(user.id || email || 'default');

    if (avatarUrl) {
        return (
            <div className="user-avatar-small" title={identifier}>
                <img src={avatarUrl} alt="User" />
            </div>
        );
    }

    return (
        <div
            className="user-avatar-small"
            style={{ backgroundColor: bgColor }}
            title={identifier}
        >
            {initial}
        </div>
    );
};

const UsersModal = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const ITEMS_PER_PAGE = 50;

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setPage(0);
            setHasMore(true);

            const response = await api.post(`${API_BASE_URL}/api/admin/get_users`, {
                page: 0,
                limit: ITEMS_PER_PAGE
            });

            const data = response.data.data;
            setUsers(data || []);
            if (data.length < ITEMS_PER_PAGE) setHasMore(false);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreUsers = async () => {
        if (loadingMore) return;

        try {
            setLoadingMore(true);
            const nextPage = page + 1;

            const response = await api.post(`${API_BASE_URL}/api/admin/get_users`, {
                page: nextPage,
                limit: ITEMS_PER_PAGE
            });

            const data = response.data.data;

            if (data && data.length > 0) {
                setUsers(prev => [...prev, ...data]);
                setPage(nextPage);
                if (data.length < ITEMS_PER_PAGE) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error loading more users:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (user.email && user.email.toLowerCase().includes(searchLower)) ||
            (user.display_name && user.display_name.toLowerCase().includes(searchLower))
        );
    });

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content users-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-top">
                        <h2>Registered Users</h2>
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="users-search-container">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="users-search-input"
                    />
                </div>

                <div className="modal-body">
                    <div className="users-table-container">
                        {loading ? (
                            <div className="loading-state">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="empty-state">No users found.</div>
                        ) : (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Images</th>
                                        <th>Joined</th>
                                        <th>Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <UserAvatar user={user} />
                                                    <span className="user-name">{user.display_name || 'No Name'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="user-email">{user.email}</span>
                                            </td>
                                            <td>
                                                {user.image_count || 0}
                                            </td>
                                            <td>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {hasMore && !loading && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                <button
                                    onClick={loadMoreUsers}
                                    disabled={loadingMore}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#333',
                                        color: 'white',
                                        border: '1px solid #555',
                                        borderRadius: '6px',
                                        cursor: loadingMore ? 'wait' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                    {!loadingMore && <ChevronDown size={16} />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersModal;
