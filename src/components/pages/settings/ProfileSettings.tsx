'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/profile/profileSettings.module.css';
import { Sun, Moon } from 'lucide-react';
import ProfilePictureUpload from '@/components/common/ProfilePictureUpload';
import { profileEvents } from '@/lib/profileEvents';

interface ProfileData {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    company: string;
    profile_picture: string;
    bio: string;
    website: string;
    linkedin: string;
}

interface DisplayData {
    theme: 'light' | 'dark';
}

export default function ProfileSettings() {
    const { data: session } = useSession();
    const [profileData, setProfileData] = useState<ProfileData>({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        company: '',
        profile_picture: '',
        bio: '',
        website: '',
        linkedin: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'display'>('profile');
    const [displayData, setDisplayData] = useState<DisplayData>({
        theme: 'light'
    });

    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const windowBackground = theme === "light" ? styles.lightPage : styles.darkPage;
    const titleText = theme === "light" ? styles.lightText : styles.darkText;


    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            setIsFetching(true);
            const response = await fetch('/api/users/profile');
            if (response.ok) {
                const userData = await response.json();
                // Update profile data with fetched user data
                setProfileData(prev => ({
                    ...prev,
                    first_name: userData.first_name || session?.user?.name?.split(' ')[0] || '',
                    last_name: userData.last_name || session?.user?.name?.split(' ').slice(1).join(' ') || '',
                    company: userData.company || session?.user?.company || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    profile_picture: userData.profile_picture || '',
                    bio: userData.bio || '',
                    website: userData.website || '',
                    linkedin: userData.linkedin || ''
                }));
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to session data if API call fails
            setProfileData(prev => ({
                ...prev,
                first_name: session?.user?.name?.split(' ')[0] || '',
                last_name: session?.user?.name?.split(' ').slice(1).join(' ') || '',
                company: session?.user?.company || ''
            }));
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (session?.user) {
            // Load user data from session and fetch additional profile data
            setProfileData(prev => ({
                ...prev,
                first_name: session.user.name?.split(' ')[0] || '',
                last_name: session.user.name?.split(' ').slice(1).join(' ') || '',
                company: session.user.company || ''
            }));

            // Fetch additional profile data from API
            fetchUserProfile();
            fetchUserDisplaySettings();
        }
    }, [session]);

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

    //Fetch the Theme
    const fetchUserDisplaySettings = async () => {
        try {
            const res = await fetch('/api/users/theme');
            if (res.ok) {
                const data = await res.json();
                setDisplayData({
                    theme: data.theme.theme || 'dark',
                });
            }
        } catch (err) {
            console.error('Failed to fetch display settings', err);
        }
    };

    const handleDisplayChange = (field: keyof DisplayData, value: any) => {
        setDisplayData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleProfileChange = (field: keyof ProfileData, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Add confirmation dialog before saving
        if (!confirm('Are you sure you want to save these changes to your profile?')) {
            return;
        }
        
        setIsLoading(true);
        setMessage(null);

        try {
            if (activeTab === 'profile') {
                const response = await fetch('/api/users/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(profileData),
                });

                if (response.ok) {
                    setMessage({
                        type: 'success',
                        text: 'Profile updated successfully!'
                    });
                    profileEvents.emit();
                } else {
                    const error = await response.json();
                    setMessage({
                        type: 'error',
                        text: error.error || 'Failed to update profile'
                    });
                }
            } else if (activeTab === 'display') {
                const response = await fetch('/api/users/theme', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(displayData),
                });
                if (response.ok) {
                    setMessage({
                        type: 'success',
                        text: 'Display settings updated!'
                    });
                } else {
                    const error = await response.json();
                    setMessage({ type: 'error', text: error.error || 'Failed to update display settings' });
                }
            }

        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!session?.user) {
        return <div>Loading...</div>;
    }

    if (isFetching) {
        return (
            <div className={styles.profileSettingsContainer}>
                <h1 className={styles.title}>Profile Settings</h1>
                <div className={styles.loadingMessage}>Loading your profile...</div>
            </div>
        );
    }

    return (
        <div className={windowBackground}>
            <div className={styles.profileSettingsContainer}>
                <h1 className={styles.title}>Profile Settings</h1>

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'display' ? styles.active : ''}`}
                        onClick={() => setActiveTab('display')}
                    >
                        Display Options
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {activeTab === 'display' && (
                        <div className={styles.tabContent}>
                            <div className={styles.section}>
                                <h3>Display Information</h3>
                                <div className={styles.formRow}>
                                    <input
                                        type="radio"
                                        id="theme-light"
                                        name="theme"
                                        value="light"
                                        checked={displayData.theme === 'light'}
                                        onChange={(e) => handleDisplayChange('theme', e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <label htmlFor="theme-light" className={styles.radioLabel}>
                                        <Sun size={18} style={{ marginRight: '6px', color: '#f6c23e' }} />
                                        Light Mode
                                    </label>
                                    <input
                                        type="radio"
                                        id="theme-dark"
                                        name="theme"
                                        value="dark"
                                        checked={displayData.theme === 'dark'}
                                        onChange={(e) => handleDisplayChange('theme', e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <label htmlFor="theme-dark" className={styles.radioLabel}>
                                        <Moon size={18} style={{ marginRight: '6px', color: '#6c63ff' }} />
                                        Dark Mode
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className={styles.tabContent}>
                            <div className={styles.section}>
                                <h3>Basic Information</h3>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="first_name">First Name</label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            value={profileData.first_name}
                                            onChange={(e) => handleProfileChange('first_name', e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="last_name">Last Name</label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            value={profileData.last_name}
                                            onChange={(e) => handleProfileChange('last_name', e.target.value)}
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="company">Company/Organization</label>
                                    <input
                                        type="text"
                                        id="company"
                                        value={profileData.company}
                                        onChange={(e) => handleProfileChange('company', e.target.value)}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={profileData.phone}
                                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        value={profileData.address}
                                        onChange={(e) => handleProfileChange('address', e.target.value)}
                                        className={styles.textarea}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3>Profile Picture</h3>
                                <ProfilePictureUpload
                                    currentImageUrl={profileData.profile_picture}
                                    onImageUpload={(imageUrl) => handleProfileChange('profile_picture', imageUrl)}
                                    size="large"
                                    className={styles.profilePictureUpload}
                                    userName={`${profileData.first_name} ${profileData.last_name}`}
                                />
                            </div>

                            <div className={styles.section}>
                                <h3>Bio & Social Links</h3>
                                <div className={styles.formGroup}>
                                    <label htmlFor="bio">Bio</label>
                                    <textarea
                                        id="bio"
                                        value={profileData.bio}
                                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                                        className={styles.textarea}
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="website">Website</label>
                                    <input
                                        type="url"
                                        id="website"
                                        value={profileData.website}
                                        onChange={(e) => handleProfileChange('website', e.target.value)}
                                        className={styles.input}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="linkedin">LinkedIn</label>
                                        <input
                                            type="url"
                                            id="linkedin"
                                            value={profileData.linkedin}
                                            onChange={(e) => handleProfileChange('linkedin', e.target.value)}
                                            className={styles.input}
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
