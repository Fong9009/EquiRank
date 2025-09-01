import { useState } from "react";
import styles from '@/styles/pages/profile/passwordReset.module.css';

export default function ChangePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [focused, setFocused] = useState(false);

    const rules = {
        length: newPassword.length >= 12,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /\d/.test(newPassword),
        special: /[\W_]/.test(newPassword),
        match: newPassword === confirmPassword && newPassword.length > 0,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check password rules
        if (Object.values(rules).some((v) => v === false)) {
            setError("Password does not meet all requirements.");
            return;
        }

        setError(""); // clear previous errors

        try {
            const response = await fetch("/api/users/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword: newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || "Failed to update password.");
                return;
            }

            const data = await response.json();
            console.log("Password updated successfully:", data);

            // Optionally reset fields
            setNewPassword("");
            setConfirmPassword("");
            alert("Password updated successfully!");
        } catch (err) {
            console.error("Error updating password:", err);
            setError("Something went wrong. Please try again.");
        }
    };


    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.tabContent}>
                <div className={styles.section}>
                    <h3>Change Password</h3>

                    <div className={styles.row}>
                        {/* Left: Inputs */}
                        <div className={styles.inputColumn}>
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
                        </div>

                        <div className={styles.validationColumn}>
                            {focused ? (
                                Object.entries(rules).map(([key, passed]) => (
                                    <p key={key} className={passed ? styles.valid : styles.invalid}>
                                        {passed ? "✔" : "✖"}{" "}
                                        {key === "length"
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
                                <div style={{ minHeight: "10px" }}></div> // Reserve space
                            )}
                        </div>

                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.submitButton} disabled={!Object.values(rules).every(Boolean)}>
                        Update Password
                    </button>
                </div>
            </div>
        </form>
    );
}
