'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/pages/admin/adminActiveUser.module.css';
import { useSession } from "next-auth/react";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: 'borrower' | 'lender' | 'admin';
    entity_type: 'company' | 'individual';
    company?: string;
    phone?: string;
    address?: string;
    is_super_admin?: boolean;
    created_at: string;
}

function validateName(name: string) {
    const nameRegex = /^[A-Za-z]+([A-Za-z\s']*[A-Za-z])?$/;
    if (!name || name.trim() === "") {
        return "Name cannot be blank";
    }
    if (!nameRegex.test(name)) {
        return "Name can only contain letters, spaces, and apostrophes";
    }
    return null; // valid
}

export default function ActiveUsers() {
    const [activeUsers, setActiveUsers] = useState<User[]>([]); // kept for backward compatibility, now unused in UI
    const [borrowers, setBorrowers] = useState<User[]>([]);
    const [lenders, setLenders] = useState<User[]>([]);
    const [adminUsers, setAdminUsers] = useState<User[]>([]);
    const [superAdmins, setSuperAdmins] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const { data: session } = useSession()
    const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin);
    const [showEditModal, setShowEditModal] = useState<number | null>(null);
    const [showViewModal, setShowViewModal] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<{ [key: string]: any }>({});
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [errors, setErrors] = useState({
        first_name: '',
        last_name: '',
        address: '',
    });
    
    // State for dropdown sections
    const [expandedSections, setExpandedSections] = useState({
        borrowers: true,
        lenders: true,
        admins: true,
        superAdmins: true
    });

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'borrower' | 'lender' | 'admin' | 'super_admin'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'company' | 'created_at'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    useEffect(() => {
        fetchActiveUsers();
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (email && showEditModal) {
                validateEmail(email, showEditModal);
            }
        }, 2000);

        return () => clearTimeout(handler);
    }, [email, showEditModal]);


    // Search and filter functions
    const filterAndSortUsers = (users: User[]) => {
        let filtered = users;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            if (filterType === 'super_admin') {
                filtered = filtered.filter(user => Boolean(user.is_super_admin));
            } else {
                filtered = filtered.filter(user => user.user_type === filterType);
            }
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: string | Date;
            let bValue: string | Date;

            switch (sortBy) {
                case 'name':
                    aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
                    bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
                    break;
                case 'company':
                    aValue = (a.company || '').toLowerCase();
                    bValue = (b.company || '').toLowerCase();
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                default:
                    aValue = a.first_name.toLowerCase();
                    bValue = b.first_name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    };

    // Get filtered and sorted users for each category
    const filteredBorrowers = useMemo(() => filterAndSortUsers(borrowers), [borrowers, searchTerm, filterType, sortBy, sortOrder]);
    const filteredLenders = useMemo(() => filterAndSortUsers(lenders), [lenders, searchTerm, filterType, sortBy, sortOrder]);
    const filteredAdmins = useMemo(() => filterAndSortUsers(adminUsers), [adminUsers, searchTerm, filterType, sortBy, sortOrder]);
    const filteredSuperAdmins = useMemo(() => filterAndSortUsers(superAdmins), [superAdmins, searchTerm, filterType, sortBy, sortOrder]);

    // Fetch all active users
    const fetchActiveUsers = async () => {
        try {
            const response = await fetch('/api/admin/users/active');
            if (response.ok) {
                const users = await response.json();
                const adminsAll = users.filter((u: User) => u.user_type === 'admin');
                const superA = adminsAll.filter((u: User) => Boolean((u as any).is_super_admin));
                const admins = adminsAll.filter((u: User) => !Boolean((u as any).is_super_admin));
                const normals = users.filter((u: User) => u.user_type !== 'admin');
                const b = normals.filter((u: User) => u.user_type === 'borrower');
                const l = normals.filter((u: User) => u.user_type === 'lender');
                setAdminUsers(admins);
                setSuperAdmins(superA);
                setActiveUsers(normals);
                setBorrowers(b);
                setLenders(l);
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch active users' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error fetching active users' });
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user: User) => {
        setEditFormData((prev) => ({
            ...prev,
            [user.id]: {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                address: user.address,
            },
        }));
        setShowEditModal(user.id);
    };

    const openViewModal = (user: User) => {
        setShowViewModal(user.id);
    };

    const handleEditChange = (userId: number, field: string, value: string) => {
        setEditFormData((prev) => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: value,
            },
        }));

        if (field === 'first_name' || field === 'last_name') {
            const error = validateName(value);
            setErrors((prev) => ({ ...prev, [field]: error }));
        }
    };

    const handleUserUpdate = async (userId: number, updatedData: any) => {
        try {
            await fetch(`/api/admin/users/edit/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            // refresh users or optimistically update state
            fetchActiveUsers();

            setShowEditModal(null);
            setEmailError(null);
            setEmail('');
            setFirstName('');
            setLastName('');
            setErrors({
                first_name: '',
                last_name: '',
                address: '',
            });
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const cancelEdit = () => {
        setShowEditModal(null);
        setEmailError(null);
        setEmail('');
        setFirstName('');
        setLastName('');
        setErrors({
            first_name: '',
            last_name: '',
            address: '',
        });
    };

    const closeViewModal = () => {
        setShowViewModal(null);
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading Active Users...</div>
            </div>
        );
    }

    {/*Form Verification*/}
    {/*Email Verification*/}
    const validateEmail = async (value: string , userId: number) => {
        const currentUserEmail = session?.user?.email ?? ''
        const editUserID = showEditModal;
        if (!value.trim()) {
            setEmailError('Email cannot be blank');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Email format is invalid');
            return false;
        }

        if (value !== currentUserEmail) {
            try {
                const res = await fetch(
                    `/api/users/check-email?email=${encodeURIComponent(value)}&editUserId=${editUserID}`
                );
                const data = await res.json();

                if (!data.available) {
                    setEmailError('Email is already in use');
                    return false;
                }
            } catch (err) {
                setEmailError('Error checking email');
                return false;
            }
        }

        setEmailError(null);
        return true;
    };
    const hasAnyExpanded = Object.values(expandedSections).some(expanded => expanded);
    
    return (
        <div className={`${styles.container} ${hasAnyExpanded ? styles.hasExpandedSection : ''}`}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h2>Active Users</h2>
                        <p>Manage Active Users who use your system</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className={styles.searchFilterContainer}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search users by name, email, or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                
                <div className={styles.filterControls}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Types</option>
                        <option value="borrower">Borrowers</option>
                        <option value="lender">Lenders</option>
                        <option value="admin">Admins</option>
                        <option value="super_admin">Super Admins</option>
                    </select>
                    
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className={styles.filterSelect}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                        <option value="company">Sort by Company</option>
                        <option value="created_at">Sort by Date</option>
                    </select>
                    
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className={styles.sortButton}
                    >
                        {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                    </button>
                </div>
            </div>

            <div className={styles.contentWrapper}>

            <div className={styles.sectionHeader} onClick={() => toggleSection('borrowers')}>
                <h2 className={styles.sectionTitleBorrower}>Borrowers ({borrowers.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.borrowers ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.borrowers ? styles.expanded : styles.collapsed}`}>
                {borrowers.length === 0 ? (
                    <div className={styles.noUsers}>
                        <p>No Active Borrowers</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredBorrowers.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            return (
                            <div key={user.id} className={`${styles.userCard} ${styles.borrowerCard}`}>
                                <div className={styles.userInfo}>
                                    <h3>{user.first_name} {user.last_name}</h3>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className={styles.editButton}
                                    >
                                        Edit
                                    </button>
                                    {isSelf ? (
                                        <span className={styles.helperText}>You cannot deactivate your own account</span>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Deactivate this user? They will lose access until restored.')) return;
                                                try {
                                                    const res = await fetch('/api/admin/users/archive', {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: user.id, archived: true })
                                                    });
                                                    if (res.ok) {
                                                        setMessage({ type: 'success', text: 'User archived' });
                                                        fetchActiveUsers();
                                                    } else {
                                                        const e = await res.json();
                                                        setMessage({ type: 'error', text: e.error || 'Failed to deactivate user' });
                                                    }
                                                } catch (_) {
                                                    setMessage({ type: 'error', text: 'Network error while deactivating user' });
                                                }
                                            }}
                                            className={styles.deleteButton}
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            <div className={styles.sectionHeader} onClick={() => toggleSection('lenders')}>
                <h2 className={styles.sectionTitleLender}>Lenders ({lenders.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.lenders ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.lenders ? styles.expanded : styles.collapsed}`}>
                {lenders.length === 0 ? (
                    <div className={styles.noUsers}>
                        <p>No Active Lenders</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredLenders.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            return (
                            <div key={user.id} className={`${styles.userCard} ${styles.lenderCard}`}>
                                <div className={styles.userInfo}>
                                    <h3>{user.first_name} {user.last_name}</h3>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className={styles.editButton}
                                    >
                                        Edit
                                    </button>
                                    {isSelf ? (
                                        <span className={styles.helperText}>You cannot deactivate your own account</span>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Deactivate this user? They will lose access until restored.')) return;
                                                try {
                                                    const res = await fetch('/api/admin/users/archive', {
                                                        method: 'PATCH',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ userId: user.id, archived: true })
                                                    });
                                                    if (res.ok) {
                                                        setMessage({ type: 'success', text: 'User deactivated' });
                                                        fetchActiveUsers();
                                                    } else {
                                                        const e = await res.json();
                                                        setMessage({ type: 'error', text: e.error || 'Failed to deactivate user' });
                                                    }
                                                } catch (_) {
                                                    setMessage({ type: 'error', text: 'Network error while deactivating user' });
                                                }
                                            }}
                                            className={styles.deleteButton}
                                        >
                                            Deactivate
                                        </button>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            <div className={styles.sectionHeader} onClick={() => toggleSection('admins')}>
                <h2 className={styles.sectionTitleAdmin}>Admins ({adminUsers.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.admins ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.admins ? styles.expanded : styles.collapsed}`}>
                {adminUsers.length === 0 ? (
                    <div className={styles.noUsers}>
                        <p>No Active Admins</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredAdmins.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            const targetIsSuper = Boolean(user.is_super_admin);
                            const canArchive = isSuperAdmin && !isSelf && !targetIsSuper; // only super admin can archive admins (not super admin) and not self
                            return (
                            <div key={user.id} className={`${styles.userCard} ${styles.adminCard}`}>
                                <div className={styles.userInfo}>
                                    <h3>{user.first_name} {user.last_name}</h3>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className={styles.editButton}
                                    >
                                        Edit
                                    </button>
                                    {canArchive ? (
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Deactivate this admin? Only Super Admin can reverse this. Proceed?')) return;
                                            try {
                                                const res = await fetch('/api/admin/users/archive', {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ userId: user.id, archived: true })
                                                });
                                                if (res.ok) {
                                                    setMessage({ type: 'success', text: 'User deactivated' });
                                                    fetchActiveUsers();
                                                } else {
                                                    const e = await res.json();
                                                    setMessage({ type: 'error', text: e.error || 'Failed to deactivate user' });
                                                }
                                            } catch (_) {
                                                setMessage({ type: 'error', text: 'Network error while deactivating user' });
                                            }
                                        }}
                                        className={styles.deleteButton}
                                    >
                                        Deactivate
                                    </button>
                                    ) : (
                                        (() => {
                                            let reasonText = '';
                                            if (isSelf) {
                                                reasonText = 'You cannot deactivate your own account';
                                            } else if (targetIsSuper) {
                                                reasonText = 'You cannot deactivate a Super Admin';
                                            } else if (!isSuperAdmin) {
                                                reasonText = 'Only Super Admin can deactivate other admins';
                                            }
                                            return <span className={styles.helperText}>{reasonText}</span>;
                                        })()
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            <div className={styles.sectionHeader} onClick={() => toggleSection('superAdmins')}>
                <h2 className={styles.sectionTitleSuper}>Super Admin ({superAdmins.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.superAdmins ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.superAdmins ? styles.expanded : styles.collapsed}`}>
                {superAdmins.length === 0 ? (
                    <div className={styles.noUsers}>
                        <p>No Super Admins Found</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredSuperAdmins.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            return (
                            <div key={user.id} className={`${styles.userCard} ${styles.superAdminCard}`}>
                                <div className={styles.userInfo}>
                                    <h3>{user.first_name} {user.last_name}</h3>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className={styles.editButton}
                                    >
                                        Edit
                                    </button>
                                    <span className={styles.helperText}>
                                        {isSelf ? 'You cannot deactivate your own account' : 'You cannot deactivate a Super Admin'}
                                    </span>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            {/* Global Edit Modal */}
            {showEditModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.editModal}>
                        <div className={styles.editContent}>
                            <div className={styles.editHeader}>
                                <h4 className={styles.editTitle}>Edit User</h4>
                                <div className={styles.userNameDisplay}>
                                    {editFormData[showEditModal]?.first_name} {editFormData[showEditModal]?.last_name}
                                </div>
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    
                                    // Add confirmation dialog before saving changes
                                    const userName = `${editFormData[showEditModal]?.first_name} ${editFormData[showEditModal]?.last_name}`;
                                    if (!confirm(`Are you sure you want to save these changes to ${userName}'s profile?`)) {
                                        return;
                                    }
                                    
                                    handleUserUpdate(showEditModal, editFormData[showEditModal]);
                                }}
                                className={styles.editForm}
                            >
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={editFormData[showEditModal]?.email || ''}
                                    onChange={(e) => {
                                        handleEditChange(showEditModal, 'email', e.target.value)
                                            const value = e.target.value;
                                            setEmail(value);
                                            if (showEditModal) {
                                                validateEmail(value, showEditModal);
                                            }
                                        }
                                    }
                                    className={styles.editInput}
                                />
                                {emailError && <p className={styles.errorText}>{emailError}</p>}

                                <div className={styles.nameRow}>
                                    <div className={styles.nameField}>
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={editFormData[showEditModal]?.first_name || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                handleEditChange(showEditModal, 'first_name',  value)
                                                const error = validateName(value);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    first_name: error || "",
                                                }));
                                            }}
                                            className={styles.editInput}
                                        />
                                        {errors.first_name && <p className={styles.errorText}>{errors.first_name}</p>}
                                    </div>
                                    <div className={styles.nameField}>
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={editFormData[showEditModal]?.last_name || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                handleEditChange(showEditModal, 'last_name', e.target.value)
                                                const error = validateName(value);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    last_name: error || "",
                                                }));
                                            }

                                            }
                                            className={styles.editInput}
                                        />
                                        {errors.last_name && <p className={styles.errorText}>{errors.last_name}</p>}
                                    </div>
                                </div>
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={editFormData[showEditModal]?.phone || ''}
                                    onChange={(e) =>
                                        handleEditChange(showEditModal, 'phone', e.target.value)
                                    }
                                    className={styles.editInput}
                                />

                                <label>Address</label>
                                <textarea
                                    value={editFormData[showEditModal]?.address || ''}
                                    onChange={(e) =>{
                                        const value = e.target.value;
                                        handleEditChange(showEditModal, 'address', e.target.value);
                                        if (!value.trim()) {
                                            setErrors((prev) => ({ ...prev, address: 'Address cannot be blank' }));
                                        } else {
                                            setErrors((prev) => ({ ...prev, address: '' }));
                                        }
                                    }
                                    }
                                    rows={3}
                                    className={styles.editTextarea}
                                />
                                {errors.address && <p className={styles.errorText}>{errors.address}</p>}

                                <div className={styles.editActions}>
                                    <button
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={Boolean(errors.first_name || errors.address ||errors.last_name || emailError)}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className={styles.cancelButton}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {showViewModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.viewModal}>
                        <div className={styles.viewContent}>
                            <div className={styles.viewHeader}>
                                <div className={styles.viewTitleSection}>
                                    <h4 className={styles.viewTitle}>User Profile</h4>
                                    <div className={styles.viewUserNameDisplay}>
                                        {(() => {
                                            const allUsers = [...borrowers, ...lenders, ...adminUsers, ...superAdmins];
                                            const viewedUser = allUsers.find(u => u.id === showViewModal);
                                            return viewedUser ? `${viewedUser.first_name} ${viewedUser.last_name}` : 'Unknown User';
                                        })()}
                                    </div>
                                </div>
                                <button 
                                    onClick={closeViewModal}
                                    className={styles.closeButton}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className={styles.userProfileInfo}>
                                {(() => {
                                    // Find the user being viewed
                                    const allUsers = [...borrowers, ...lenders, ...adminUsers, ...superAdmins];
                                    const viewedUser = allUsers.find(u => u.id === showViewModal);
                                    
                                    if (!viewedUser) return <div>User not found</div>;
                                    
                                    return (
                                        <>
                                            <div className={styles.profileSection}>
                                                <h5>Personal Information</h5>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Email:</span>
                                                    <span className={styles.value}>{viewedUser.email}</span>
                                                </div>
                                                {viewedUser.company && (
                                                    <div className={styles.infoRow}>
                                                        <span className={styles.label}>Company:</span>
                                                        <span className={styles.value}>{viewedUser.company}</span>
                                                    </div>
                                                )}
                                                {viewedUser.phone && (
                                                    <div className={styles.infoRow}>
                                                        <span className={styles.label}>Phone:</span>
                                                        <span className={styles.value}>{viewedUser.phone}</span>
                                                    </div>
                                                )}
                                                {viewedUser.address && (
                                                    <div className={styles.infoRow}>
                                                        <span className={styles.label}>Address:</span>
                                                        <span className={styles.value}>{viewedUser.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className={styles.profileSection}>
                                                <h5>Account Information</h5>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>User Type:</span>
                                                    <span className={styles.value}>
                                                        {viewedUser.user_type === 'admin' && viewedUser.is_super_admin ? 'Super Admin' : 
                                                         viewedUser.user_type === 'admin' ? 'Admin' : 
                                                         viewedUser.user_type === 'borrower' ? 'Borrower' : 
                                                         viewedUser.user_type === 'lender' ? 'Lender' : 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Account Status:</span>
                                                    <span className={styles.value}>
                                                        <span className={styles.statusActive}>Active</span>
                                                    </span>
                                                </div>
                                                <div className={styles.infoRow}>
                                                    <span className={styles.label}>Approval Status:</span>
                                                    <span className={styles.value}>
                                                        <span className={styles.statusApproved}>Approved</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
