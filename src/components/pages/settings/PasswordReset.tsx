import { useState } from "react";
import styles from '@/styles/pages/profile/passwordReset.module.css';
import CustomConfirmation from "@/components/common/CustomConfirmation";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [focused, setFocused] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const rules = {
        currentPassword: currentPassword.length > 0,
        length: newPassword.length >= 12,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /\d/.test(newPassword),
        special: /[\W_]/.test(newPassword),
        match: newPassword === confirmPassword && newPassword.length > 0,
    };

    const [confirmationData, setConfirmationData] = useState<{
        action: 'approve';
        message: string;
        title: string;
        onConfirm: () => void;
    } | null>(null);


    const showPasswordConfirmation = () => {
        setConfirmationData({
            action: 'approve',
            title: 'Save Password Change',
            message: 'Are you sure you want to change your password?',
            onConfirm: submitPasswordChange,
        });
        setShowConfirmation(true);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check password rules
        if (Object.values(rules).some((v) => v === false)) {
            setError("Password does not meet all requirements.");
            return;
        }

        setError(""); // clear previous errors
        setConfirmationData({
            action: 'approve',
            title: 'Save Password Change',
            message: 'Are you sure you want to change your password?',
            onConfirm: submitPasswordChange // callback to actually submit
        });
        setShowConfirmation(true);
    };

    const submitPasswordChange = async () => {
        setShowConfirmation(false);
        try {
            setLoading(true);
            const response = await fetch("/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                }),
            });
            if(response.ok) {
                setMessage({ type: 'success', text: 'Password Changed' });
            }

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || "Failed to update password.");
                return;
            }

            const data = await response.json();
            console.log("Password updated successfully:", data);

            // Optionally reset fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            console.error("Error updating password:", err);
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
                        Change Password
                        {loading && <span className={styles.spinner}>⏳</span>}
                    </h3>

                    <div className={styles.row}>
                        {/* Left: Inputs */}
                        <div className={styles.inputColumn}>
                            <div className={styles.formGroup}>
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={styles.input}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={styles.input}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={styles.input}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    required
                                />
                            </div>
                            {error && <p className={styles.error}>{error}</p>}

                            <button type="submit" className={styles.submitButtonDesk} disabled={!Object.values(rules).every(Boolean)}>
                                Update Password
                            </button>
                        </div>

                        <div className={styles.validationColumn}>
                            <p className={styles.validationTitle}>Validation Requirements</p>
                            <p>Click "Current Password", "New Password" or "Confirm Password" To see them</p>
                            {focused ? (
                                Object.entries(rules).map(([key, passed]) => (
                                    <p key={key} className={passed ? styles.valid : styles.invalid}>
                                        {passed ? "✔" : "✖"}{" "}
                                        {key === "currentPassword"
                                            ? "Current password entered"
                                            : key === "length"
                                                ? "At least 12 characters"
                                                : key === "uppercase"
                                                    ? "Contains uppercase letter"
                                                    : key === "lowercase"
                                                        ? "Contains lowercase letter"
                                                        : key === "number"
                                                            ? "Contains number"
                                                            : key === "special"
                                                                ? "Contains special character"
                                                                : "Matches confirmation"}
                                    </p>
                                ))
                            ) : (
                                <div className={styles.spacer}></div> // Reserve space
                            )}
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit" className={styles.submitButtonPhone} disabled={!Object.values(rules).every(Boolean)}>
                            Update Password
                        </button>

                    </div>
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
