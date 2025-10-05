'use client';

import { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/pages/admin/adminActiveUser.module.css';
import { useSession } from "next-auth/react";
import ProfilePictureUpload from '@/components/common/ProfilePictureUpload';
import CustomConfirmation from '@/components/common/CustomConfirmation';
import clsx from 'clsx';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: 'borrower' | 'lender' | 'admin';
    company?: string;
    phone?: string;
    address?: string;
    profile_picture?: string;
    is_super_admin?: boolean;
    created_at: string;
}

function validateName(name: string) {
    const nameRegex = /^[A-Za-z]+([A-Za-z\s']*[A-Za-z])?$/;
    if (!name || name.trim() === "") {
        return "Name cannot be blank";
    }
    if (name.trim().length < 2) {
        return "Name must be at least 2 characters long";
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
    const { data: session } = useSession();
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
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

    //Colour Mode Editing
    const textColour = theme === "light" ? styles.lightTextColour : styles.darkTextColour;
    const backgroundColour = theme === "light" ? styles.lightBackground : styles.darkBackground;
    const loadColor = theme === "light" ? styles.lightLoadColour : styles.darkLoadColour;

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

    // Custom confirmation dialog state
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationData, setConfirmationData] = useState<{
        action: 'archive' | 'delete' | 'edit' | 'removePicture';
        userName: string;
        userId: number;
        message: string;
        title: string;
    } | null>(null);

    // Toggle section expansion
    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Custom confirmation handlers
    const showArchiveConfirmation = (user: User) => {
        setConfirmationData({
            action: 'archive',
            userName: `${user.first_name} ${user.last_name}`,
            userId: user.id,
            title: 'Deactivate User',
            message: 'Are you sure you want to deactivate this user? They will no longer be able to access the system.'
        });
        setShowConfirmation(true);
    };

    const showEditConfirmation = (user: User) => {
        setConfirmationData({
            action: 'edit',
            userName: `${user.first_name} ${user.last_name}`,
            userId: user.id,
            title: 'Save Changes',
            message: 'Are you sure you want to save these changes to this user\'s profile?'
        });
        setShowConfirmation(true);
    };

    const showRemovePictureConfirmation = (user: User) => {
        setConfirmationData({
            action: 'removePicture',
            userName: `${user.first_name} ${user.last_name}`,
            userId: user.id,
            title: 'Remove Profile Picture',
            message: 'Are you sure you want to remove this user\'s profile picture?'
        });
        setShowConfirmation(true);
    };

    const handleConfirmation = async () => {
        if (!confirmationData) return;

        switch (confirmationData.action) {
            case 'archive':
                await archiveUser(confirmationData.userId);
                break;
            case 'edit':
                if (showEditModal) {
                    handleUserUpdate(showEditModal, editFormData[showEditModal]);
                }
                break;
            case 'removePicture':
                if (showEditModal) {
                    handleEditChange(showEditModal, 'profile_picture', '');
                }
                break;
        }
        setShowConfirmation(false);
        setConfirmationData(null);
    };

    const archiveUser = async (userId: number) => {
        try {
            const res = await fetch('/api/admin/users/archive', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, archived: true })
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

    useEffect(() => {
        if (!session) return;
        fetch("/api/users/theme")
            .then(res => res.json())
            .then(data => {
                if (data.theme) {
                    setTheme(data.theme.theme);
                } else {
                    setTheme("auto");
                }
            });
    }, [session]);

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

    // Helper function to check if current user can edit a specific user
    const canEditUser = (user: User): boolean => {
        const currentUserId = session?.user?.id;
        const targetUserId = user.id;
        const targetUserType = user.user_type;
        const targetIsSuperAdmin = Boolean(user.is_super_admin);
        const currentUserIsSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin);
        
        // Cannot edit own account
        if (String(currentUserId) === String(targetUserId)) {
            return false;
        }
        
        // Regular admins can only edit borrowers and lenders
        if (!currentUserIsSuperAdmin && targetUserType === 'admin') {
            return false;
        }
        
        // Super admins cannot edit other super admins
        if (currentUserIsSuperAdmin && targetIsSuperAdmin && String(currentUserId) !== String(targetUserId)) {
            return false;
        }
        
        return true;
    };

    const openEditModal = (user: User) => {
        // Check if current user can edit this user
        const currentUserId = session?.user?.id;
        const targetUserId = user.id;
        const targetUserType = user.user_type;
        const targetIsSuperAdmin = Boolean(user.is_super_admin);
        const currentUserIsSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin);
        
        // Prevent editing own account
        if (String(currentUserId) === String(targetUserId)) {
            alert('You cannot edit your own account through the admin interface. Use your profile settings instead.');
            return;
        }
        
        // Regular admins can only edit borrowers and lenders
        if (!currentUserIsSuperAdmin && targetUserType === 'admin') {
            alert('Regular admins can only edit borrower and lender accounts. Super admin access required to edit admin accounts.');
            return;
        }
        
        // Super admins cannot edit other super admins
        if (currentUserIsSuperAdmin && targetIsSuperAdmin && String(currentUserId) !== String(targetUserId)) {
            alert('Super admins cannot edit other super admin accounts.');
            return;
        }
        
        // If all checks pass, open the edit modal
        setShowEditModal(user.id);
        setEditFormData({
            [user.id]: {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone || '',
                address: user.address || '',
                profile_picture: user.profile_picture || ''
            }
        });
        setEmail(user.email);
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setErrors({
            first_name: '',
            last_name: '',
            address: '',
        });
        setEmailError(null);
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
                <div className={loadColor}>Loading Active Users...</div>
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
                        <h2 className={textColour}>Active Users</h2>
                        <p className={textColour}>Manage Active Users who use your system</p>
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

            <div className={clsx(styles.sectionHeader, backgroundColour)} onClick={() => toggleSection('borrowers')}>
                <h2 className={styles.sectionTitleBorrower}>Borrowers ({borrowers.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.borrowers ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.borrowers ? styles.expanded : styles.collapsed}`}>
                {borrowers.length === 0 ? (
                    <div className={clsx(styles.noUsers, textColour)}>
                        <p>No Active Borrowers</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredBorrowers.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            return (
                            <div key={user.id} className={`${clsx(styles.userCard,backgroundColour)} ${styles.borrowerCard}`}>
                                <div className={styles.userInfo}>
                                    <div className={styles.userHeader}>
                                        {user.profile_picture && (
                                            <img 
                                                src={user.profile_picture} 
                                                alt={`${user.first_name} ${user.last_name}`}
                                                className={styles.userProfilePicture}
                                            />
                                        )}
                                        <div className={styles.userNameAndType}>
                                            <h3>{user.first_name} {user.last_name}</h3>
                                            <span className={`${styles.userTypeBadge} ${styles.borrowerBadge}`}>
                                                Borrower
                                            </span>
                                        </div>
                                    </div>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p style={{maxWidth:'200px', whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word'}}><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p style={{maxWidth:'200px', whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word'}}><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    {canEditUser(user) ? (
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <span className={styles.helperText}>
                                            {String(user.id) === String(session?.user?.id) 
                                                ? 'Use profile settings to edit your own account' 
                                                : 'Insufficient permissions to edit this account'
                                            }
                                        </span>
                                    )}
                                    {isSelf ? (
                                        <span className={styles.helperText}>You cannot deactivate your own account</span>
                                    ) : (
                                        <button
                                            onClick={() => showArchiveConfirmation(user)}
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

            <div className={clsx(styles.sectionHeader, backgroundColour)} onClick={() => toggleSection('lenders')}>
                <h2 className={styles.sectionTitleLender}>Lenders ({lenders.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.lenders ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.lenders ? styles.expanded : styles.collapsed}`}>
                {lenders.length === 0 ? (
                    <div className={clsx(styles.noUsers, textColour)}>
                        <p>No Active Lenders</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredLenders.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            return (
                            <div key={user.id} className={`${clsx(styles.userCard, backgroundColour)} ${styles.lenderCard}`}>
                                <div className={styles.userInfo}>
                                    <div className={styles.userHeader}>
                                        {user.profile_picture && (
                                            <img 
                                                src={user.profile_picture} 
                                                alt={`${user.first_name} ${user.last_name}`}
                                                className={styles.userProfilePicture}
                                            />
                                        )}
                                        <div className={styles.userNameAndType}>
                                            <h3>{user.first_name} {user.last_name}</h3>
                                            <span className={`${styles.userTypeBadge} ${styles.lenderBadge}`}>
                                                Lender
                                            </span>
                                        </div>
                                    </div>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p style={{maxWidth:'200px', whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word'}}><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p style={{maxWidth:'200px', whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word'}}><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    {canEditUser(user) ? (
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <span className={styles.helperText}>
                                            {String(user.id) === String(session?.user?.id) 
                                                ? 'Use profile settings to edit your own account' 
                                                : 'Insufficient permissions to edit this account'
                                            }
                                        </span>
                                    )}
                                    {isSelf ? (
                                        <span className={styles.helperText}>You cannot deactivate your own account</span>
                                    ) : (
                                        <button
                                            onClick={() => showArchiveConfirmation(user)}
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

            <div className={clsx(styles.sectionHeader, backgroundColour)} onClick={() => toggleSection('admins')}>
                <h2 className={styles.sectionTitleAdmin}>Admins ({adminUsers.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.admins ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.admins ? styles.expanded : styles.collapsed}`}>
                {adminUsers.length === 0 ? (
                    <div className={clsx(styles.noUsers, textColour)}>
                        <p>No Active Admins</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredAdmins.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            const targetIsSuper = Boolean(user.is_super_admin);
                            const canArchive = isSuperAdmin && !isSelf && !targetIsSuper; // only super admin can archive admins (not super admin) and not self
                            return (
                            <div key={user.id} className={`${clsx(styles.userCard, backgroundColour)} ${styles.adminCard}`}>
                                <div className={styles.userInfo}>
                                    <div className={styles.userHeader}>
                                        {user.profile_picture && (
                                            <img 
                                                src={user.profile_picture} 
                                                alt={`${user.first_name} ${user.last_name}`}
                                                className={styles.userProfilePicture}
                                            />
                                        )}
                                        <div className={styles.userNameAndType}>
                                            <h3>{user.first_name} {user.last_name}</h3>
                                            <span className={`${styles.userTypeBadge} ${styles.adminBadge}`}>
                                                Admin
                                            </span>
                                        </div>
                                    </div>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    {user.company && <p style={{maxWidth:'200px', whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word'}}><strong>Company:</strong> {user.company}</p>}
                                    {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                    {user.address && <p style={{maxWidth:'200px', whiteSpace:'pre-wrap', wordBreak:'break-word', overflowWrap:'break-word'}}><strong>Address:</strong> {user.address}</p>}
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.viewButton}
                                        onClick={() => openViewModal(user)}
                                    >
                                        View
                                    </button>
                                    {canEditUser(user) ? (
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <span className={String(user.id) === String(session?.user?.id) 
                                            ? `${styles.helperText} ${styles.ownAccount}` 
                                            : styles.helperText
                                        }>
                                            {String(user.id) === String(session?.user?.id) 
                                                ? 'Use profile settings to edit your own account' 
                                                : 'Only Super Admin can deactivate or edit other admins'
                                            }
                                        </span>
                                    )}
                                    {canArchive ? (
                                    <button
                                        onClick={() => showArchiveConfirmation(user)}
                                        className={styles.deleteButton}
                                    >
                                        Deactivate
                                    </button>
                                    ) : (
                                        String(user.id) === String(session?.user?.id) && (
                                            <span className={styles.helperText}>
                                                You cannot deactivate your own account
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </div>

            <div className={clsx(styles.sectionHeader, backgroundColour)} onClick={() => toggleSection('superAdmins')}>
                <h2 className={styles.sectionTitleSuper}>Super Admin ({superAdmins.length})</h2>
                <span className={`${styles.dropdownArrow} ${expandedSections.superAdmins ? styles.expanded : ''}`}>
                    ▼
                </span>
            </div>
            <div className={`${styles.userListContainer} ${expandedSections.superAdmins ? styles.expanded : styles.collapsed}`}>
                {superAdmins.length === 0 ? (
                    <div className={clsx(styles.noUsers, textColour)}>
                        <p>No Super Admins Found</p>
                    </div>
                ) : (
                    <div className={styles.userList}>
                        {filteredSuperAdmins.map((user) => {
                            const isSelf = String(user.id) === String(session?.user?.id);
                            return (
                            <div key={user.id} className={`${clsx(styles.userCard, backgroundColour)} ${styles.superAdminCard}`}>
                                <div className={styles.userInfo}>
                                    <div className={styles.userHeader}>
                                        {user.profile_picture && (
                                            <img 
                                                src={user.profile_picture} 
                                                alt={`${user.first_name} ${user.last_name}`}
                                                className={styles.userProfilePicture}
                                            />
                                        )}
                                        <div className={styles.userNameAndType}>
                                            <h3>{user.first_name} {user.last_name}</h3>
                                            <span className={`${styles.userTypeBadge} ${styles.superAdminBadge}`}>
                                                Super Admin
                                            </span>
                                        </div>
                                    </div>
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
                                    {canEditUser(user) ? (
                                        <button
                                            onClick={() => openEditModal(user)}
                                            className={styles.editButton}
                                        >
                                            Edit
                                        </button>
                                    ) : (
                                        <span className={styles.helperText}>
                                            {String(user.id) === String(session?.user?.id) 
                                                ? 'Use profile settings to edit your own account' 
                                                : 'Super Admin cannot be edited or deactivated by other admins'
                                            }
                                        </span>
                                    )}
                                    
                                    {/* Deactivate restriction for super admins */}
                                    {String(user.id) === String(session?.user?.id) && (
                                        <span className={styles.helperText}>You cannot deactivate your own account</span>
                                    )}
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
                                    
                                    // Show custom confirmation dialog
                                    const user = editFormData[showEditModal];
                                    if (user) {
                                        showEditConfirmation(user);
                                    }
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

                                <label>Profile Picture</label>
                                <div className={styles.profilePictureSection}>
                                    <ProfilePictureUpload
                                        currentImageUrl={editFormData[showEditModal]?.profile_picture}
                                        onImageUpload={(imageUrl) => {
                                            handleEditChange(showEditModal, 'profile_picture', imageUrl);
                                        }}
                                        size="medium"
                                        userName={`${editFormData[showEditModal]?.first_name} ${editFormData[showEditModal]?.last_name}`}
                                    />
                                    {editFormData[showEditModal]?.profile_picture && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const allUsers = [...borrowers, ...lenders, ...adminUsers, ...superAdmins];
                                                const user = allUsers.find(u => u.id === showEditModal);
                                                if (user) {
                                                    showRemovePictureConfirmation(user);
                                                }
                                            }}
                                            className={styles.removePictureButton}
                                        >
                                            Remove Picture
                                        </button>
                                    )}
                                </div>

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
                <div className={styles.modalOverlay} onClick={closeViewModal}>
                    <div className={styles.viewModal}>
                        <div className={styles.viewContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.viewHeader}>
                                <div className={styles.viewTitleSection}>
                                    <h4 className={styles.viewTitle}>User Profile</h4>
                                </div>
                                <div className={styles.userNameDisplay}>
                                    {(() => {
                                        const allUsers = [...borrowers, ...lenders, ...adminUsers, ...superAdmins];
                                        const viewedUser = allUsers.find(u => u.id === showViewModal);
                                        return viewedUser ? `${viewedUser.first_name} ${viewedUser.last_name}` : 'Unknown User';
                                    })()}
                                </div>
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
                                                {viewedUser.profile_picture && (
                                                    <div className={styles.profilePictureDisplay}>
                                                        <img 
                                                            src={viewedUser.profile_picture} 
                                                            alt={`${viewedUser.first_name} ${viewedUser.last_name}`}
                                                            className={styles.viewProfilePicture}
                                                        />
                                                    </div>
                                                )}
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
            
            {/* Custom Confirmation Dialog */}
            {showConfirmation && confirmationData && (
                <CustomConfirmation
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={handleConfirmation}
                    title={confirmationData.title}
                    message={confirmationData.message}
                    userName={confirmationData.userName}
                    action={confirmationData.action === 'archive' ? 'archive' : 'approve'}
                    confirmText={confirmationData.action === 'archive' ? 'Deactivate' : 'Save Changes'}
                    cancelText="Cancel"
                />
            )}
            </div>
        </div>
    );
}
