'use client';
import { useState } from "react";
import styles from '@/styles/pages/profile/emailChanger.module.css';
import CustomConfirmation from "@/components/common/CustomConfirmation";
import {useSession} from "next-auth/react";

export default function EmailChanger() {
    const [currentEmail, setCurrentEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const { data: session } = useSession();
    const [error, setError] = useState("");
    const [disabled, setDisabled] = useState(true);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const [confirmationData, setConfirmationData] = useState<{
        action: 'approve';
        message: string;
        title: string;
        onConfirm: () => void;
    } | null>(null);


    const showPasswordConfirmation = () => {
        setConfirmationData({
            action: 'approve',
            title: 'Save Email Change',
            message: 'Are you sure you want to change your Email?',
            onConfirm: submitEmailChange,
        });
        setShowConfirmation(true);
    };

    const validateCurrentEmail = (value: string) => {
        if (!value.trim()) {
            setEmailError('Current email is required');
            setDisabled(true);
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Current email format is invalid');
            setDisabled(true);
            return false;
        }
        
        setEmailError(null);
        return true;
    };

    const validateEmail = async (value: string) => {
        const currentUserEmail = session?.user?.email ?? ''
        const editUserID = session?.user?.id
        
        // Check if current email is provided and valid
        if (!validateCurrentEmail(currentEmail)) {
            return false;
        }
        
        if (!value.trim()) {
            setEmailError('New email cannot be blank');
            setDisabled(true);
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError('Email format is invalid');
            setDisabled(true);
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
                    setDisabled(true);
                    return false;
                }
            } catch (err) {
                setEmailError('Error checking email');
                setDisabled(true);
                return false;
            }
        }

        setEmailError(null);
        setDisabled(false);
        return true;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); // clear previous errors
        setConfirmationData({
            action: 'approve',
            title: 'Save Email Change',
            message: 'Are you sure you want to change your email?',
            onConfirm: submitEmailChange // callback to actually submit
        });
        setShowConfirmation(true);
    };

    const submitEmailChange = async () => {
        setShowConfirmation(false);
        try {
            setLoading(true);
            const response = await fetch("/api/users/change-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentEmail: currentEmail,
                    newEmail: newEmail,
                }),
            });
            if(response.ok) {
                setMessage({ type: 'success', text: 'Email Changed' });
            }

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || "Failed to update Email.");
                return;
            }

            const data = await response.json();
            console.log("Email updated successfully:", data);

            // Optionally reset fields
            setCurrentEmail("");
            setNewEmail("");
        } catch (err) {
            console.error("Error updating email:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}
            <div className={styles.tabContent}>
                <div className={styles.section}>
                    <h3>
                        Change Email
                        {loading && <span className={styles.spinner}>⏳</span>}
                    </h3>

                    <div className={styles.row}>
                        <div className={styles.inputColumn}>
                            <div className={styles.formGroup}>
                                <label>Current Email</label>
                                <input
                                    type="email"
                                    value={currentEmail}
                                    onChange={(e) => {
                                        setCurrentEmail(e.target.value);
                                        validateCurrentEmail(e.target.value);
                                    }}
                                    className={styles.input}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>New Email</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => {
                                        validateEmail(e.target.value);
                                        setNewEmail(e.target.value);
                                        }
                                    }
                                    className={styles.input}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    required
                                />
                            </div>
                            {focused ? (emailError && <p className={styles.error}>{emailError}</p>): <div></div>}

                            <button type="submit" className={styles.submitButtonDesk} disabled = {disabled}>
                                Update Email
                            </button>
                        </div>
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.submitButtonPhone} disabled = {disabled}>
                            Update Email
                        </button>

                    </div>
                </div>
            {/* Custom Confirmation Dialog */}
            {showConfirmation && confirmationData && (
                <CustomConfirmation
                    isOpen={showConfirmation}
                    onClose={() => setShowConfirmation(false)}
                    onConfirm={confirmationData.onConfirm}
                    title={confirmationData.title}
                    message={confirmationData.message}
                    action={confirmationData.action = 'approve'}
                    confirmText={confirmationData.action = 'approve'}
                    cancelText="Cancel"
                />
            )}
        </form>
    );
}
