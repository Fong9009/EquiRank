'use client';

import { useState, useEffect } from 'react';
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
    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const { data: session } = useSession()
    const [showEditModal, setShowEditModal] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<{ [key: string]: any }>({});
    const [errors, setErrors] = useState({
        first_name: '',
        last_name: '',
    });

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


    // Fetch all active users
    const fetchActiveUsers = async () => {
        try {
            const response = await fetch('/api/admin/users/active');
            if (response.ok) {
                const users = await response.json();
                setActiveUsers(users);
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
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const cancelEdit = () => {
        setShowEditModal(null);
        setEmailError(null);
        setEmail('');
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

    return (
        <div className={styles.container}>
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

            {activeUsers.length === 0 ? (
                <div className={styles.noUsers}>
                    <p>No Active Users Currently</p>
                </div>
            ) : (
                <div className={styles.userList}>
                    {activeUsers.map((user) => (
                        <div key={user.id} className={styles.userCard}>
                            <div className={styles.userInfo}>
                                <h3>{user.first_name} {user.last_name}</h3>
                                <p><strong>Email:</strong> {user.email}</p>
                                {user.company && <p><strong>Company:</strong> {user.company}</p>}
                                {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
                                {user.address && <p><strong>Address:</strong> {user.address}</p>}
                            </div>

                            <div className={styles.actions}>
                                <button className={styles.viewButton}>View</button>
                                <button
                                    onClick={() => openEditModal(user)}
                                    className={styles.editButton}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Global Edit Modal */}
            {showEditModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.editModal}>
                        <div className={styles.editContent}>
                            <h4>Edit User</h4>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
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

                                <label>First Name</label>
                                <input
                                    type="text"
                                    value={editFormData[showEditModal]?.first_name || ''}
                                    onChange={(e) => {
                                        handleEditChange(showEditModal, 'first_name', e.target.value)
                                    }}
                                    className={styles.editInput}
                                />
                                {errors.first_name && <p className={styles.errorText}>{errors.first_name}</p>}

                                <label>Last Name</label>
                                <input
                                    type="text"
                                    value={editFormData[showEditModal]?.last_name || ''}
                                    onChange={(e) =>
                                        handleEditChange(showEditModal, 'last_name', e.target.value)
                                    }
                                    className={styles.editInput}
                                />
                                {errors.last_name && <p className={styles.errorText}>{errors.last_name}</p>}

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
                                    onChange={(e) =>
                                        handleEditChange(showEditModal, 'address', e.target.value)
                                    }
                                    rows={3}
                                    className={styles.editTextarea}
                                />

                                <div className={styles.editActions}>
                                    <button type="submit" className={styles.saveButton}>
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
        </div>
    );
}
