'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/pages/profile/profileSettings.module.css';
import { Sun, Moon } from 'lucide-react';
import ProfilePictureUpload from '@/components/common/ProfilePictureUpload';
import PasswordReset from '@/components/pages/settings/PasswordReset';
import EmailChanger from '@/components/pages/settings/EmailChanger';
import { profileEvents } from '@/lib/profileEvents';
import CustomConfirmation from "@/components/common/CustomConfirmation";
import { useEffectiveTheme, type Theme } from '@/lib/theme';

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
    
    // Borrower-specific fields
    industry?: string;
    location?: string;
    capabilities?: string;
    years_in_business?: number;
    employee_count?: number;
    revenue_range?: string;
    company_description?: string;
    qa_rating?: number;
    company_logo?: string;
    
    // Lender-specific fields
    institution_type?: string;
    risk_appetite?: string;
    target_industries?: string[];
    target_markets?: string[];
    min_loan_amount?: number;
    max_loan_amount?: number;
    
}

interface DisplayData {
    theme: 'light' | 'dark' | 'auto';
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
        linkedin: '',
        
        // Borrower-specific fields
        industry: '',
        location: '',
        capabilities: '',
        years_in_business: undefined,
        employee_count: undefined,
        revenue_range: '',
        company_description: '',
        qa_rating: undefined,
        company_logo: '',
        
        // Lender-specific fields
        institution_type: '',
        risk_appetite: '',
        target_industries: [],
        target_markets: [],
        min_loan_amount: undefined,
        max_loan_amount: undefined,
        
        // Admin-specific fields (none currently exposed)
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'display' | 'security'>('profile');
    const [displayData, setDisplayData] = useState<DisplayData>({
        theme: 'auto'
    });

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userTheme, setUserTheme] = useState<Theme>('auto');
    const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
    
    // Use the effective theme hook to handle 'auto' theme
    const effectiveTheme = useEffectiveTheme(userTheme);
    
    const windowBackground = effectiveTheme === "light" ? styles.lightPage : styles.darkPage;
    const titleText = effectiveTheme === "light" ? styles.lightText : styles.darkText;

    // Calculate profile completion via API
    const calculateProfileCompletionAPI = async (userType: string, profileData: ProfileData) => {
        try {
            const response = await fetch('/api/users/profile-completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userType, profileData }),
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.completionPercentage;
            }
            return 0;
        } catch (error) {
            console.error('Error calculating profile completion:', error);
            return 0;
        }
    };


    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            setIsFetching(true);
            const response = await fetch('/api/users/profile');
            if (response.ok) {
                const userData = await response.json();
                // Update profile data with fetched user data
                const updatedProfileData = {
                    first_name: userData.first_name || session?.user?.name?.split(' ')[0] || '',
                    last_name: userData.last_name || session?.user?.name?.split(' ').slice(1).join(' ') || '',
                    company: userData.company || session?.user?.company || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    profile_picture: userData.profile_picture || '',
                    bio: userData.bio || '',
                    website: userData.website || '',
                    linkedin: userData.linkedin || '',
                    
                    // Borrower-specific fields
                    industry: userData.industry || '',
                    location: userData.location || '',
                    capabilities: userData.capabilities || '',
                    years_in_business: userData.years_in_business || undefined,
                    employee_count: userData.employee_count || undefined,
                    revenue_range: userData.revenue_range || '',
                    company_description: userData.company_description || '',
                    qa_rating: userData.qa_rating || undefined,
                    company_logo: userData.company_logo || '',
                    
                    // Lender-specific fields
                    institution_type: userData.institution_type || '',
                    risk_appetite: userData.risk_appetite || '',
                    target_industries: userData.target_industries || [],
                    target_markets: userData.target_markets || [],
                    min_loan_amount: userData.min_loan_amount || undefined,
                    max_loan_amount: userData.max_loan_amount || undefined,
                    
                    // Admin-specific fields (none currently exposed)
                };
                setProfileData(updatedProfileData);
                
                // Use the stored profile completion percentage from database
                setProfileCompletionPercentage(userData.profile_completion_percentage || 0);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback to session data if API call fails
            const fallbackProfileData = {
                first_name: session?.user?.name?.split(' ')[0] || '',
                last_name: session?.user?.name?.split(' ').slice(1).join(' ') || '',
                company: session?.user?.company || '',
                phone: '',
                address: '',
                profile_picture: '',
                bio: '',
                website: '',
                linkedin: '',
                
                // Borrower-specific fields
                industry: '',
                location: '',
                capabilities: '',
                years_in_business: undefined,
                employee_count: undefined,
                revenue_range: '',
                company_description: '',
                qa_rating: undefined,
                company_logo: '',
                
                // Lender-specific fields
                institution_type: '',
                risk_appetite: '',
                target_industries: [],
                target_markets: [],
                min_loan_amount: undefined,
                max_loan_amount: undefined,
                
                // Admin-specific fields (none currently exposed)
            };
            setProfileData(fallbackProfileData);
            
            // Set completion percentage to 0 for fallback data
            setProfileCompletionPercentage(0);
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
                    setUserTheme(data.theme.theme);
                } else {
                    setUserTheme("auto");
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
                    theme: data.theme.theme || 'auto',
                });
            }
        } catch (err) {
            console.error('Failed to fetch display settings', err);
        }
    };

    const [confirmationData, setConfirmationData] = useState<{
        action: 'approve';
        message: string;
        title: string;
        onConfirm: () => void;
    } | null>(null);


    const showThemeConfirmation = () => {
        setConfirmationData({
            action: 'approve',
            title: 'Save Theme Change',
            message: 'Are you sure you want to change your Theme?',
            onConfirm: submitThemeChange,
        });
        setShowConfirmation(true);
    };

    const handleDisplayChange = (field: keyof DisplayData, value: any) => {
        setDisplayData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleProfileChange = async (field: keyof ProfileData, value: string | number | string[] | undefined) => {
        setProfileData(prev => {
            const updated = {
                ...prev,
                [field]: value
            };
            return updated;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            if (activeTab === 'profile') {
                if (!confirm('Are you sure you want to save these changes to your profile?')) {
                    return;
                }
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
                    
                    // Refresh profile completion percentage from database after successful save
                    const refreshResponse = await fetch("/api/users/profile");
                    if (refreshResponse.ok) {
                        const refreshData = await refreshResponse.json();
                        setProfileCompletionPercentage(refreshData.profile_completion_percentage || 0);
                    }
                } else {
                    const error = await response.json();
                    setMessage({
                        type: 'error',
                        text: error.error || 'Failed to update profile'
                    });
                }
            } else if (activeTab === 'display') {
                setConfirmationData({
                    action: 'approve',
                    title: 'Save Theme Change',
                    message: 'Are you sure you want to change your theme?',
                    onConfirm: submitThemeChange // callback to actually submit
                });
                setShowConfirmation(true);
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

    const submitThemeChange = async () => {
        try {
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
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.'
            });
        }
    }


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
                        className={`${styles.tabButton} ${activeTab === 'security' ? styles.active : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'display' ? styles.active : ''}`}
                        onClick={() => setActiveTab('display')}
                    >
                        Display Options
                    </button>
                </div>

                {/*Security Tab*/}
                {activeTab === 'security' && (
                    <>
                        <PasswordReset/>
                        <EmailChanger/>
                    </>
                )}

                {/*Display Tab*/}
                {activeTab === 'display' && (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.tabContent}>
                            <div className={styles.section}>
                                <h3>Display Information</h3>
                                <div className={styles.formRow}>
                                    <input
                                        type="radio"
                                        id="theme-auto"
                                        name="theme"
                                        value="auto"
                                        checked={displayData.theme === 'auto'}
                                        onChange={(e) => handleDisplayChange('theme', e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <label htmlFor="theme-auto" className={styles.radioLabel}>
                                        <div style={{ marginRight: '6px', width: '18px', height: '18px', display: 'inline-block', background: 'linear-gradient(45deg, #f6c23e 50%, #6c63ff 50%)', borderRadius: '50%' }} />
                                        Auto (System)
                                    </label>
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
                        <div className={styles.formActions}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={styles.submitButton}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
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
                )}

                {/*Profile Tab*/}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className={styles.form}>
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

                            {/* Borrower-specific fields */}
                            {session?.user && (session.user as any).userType === 'borrower' && (
                                <div className={styles.section}>
                                    <h3>Business Information</h3>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="industry">Industry</label>
                                            <input
                                                type="text"
                                                id="industry"
                                                value={profileData.industry || ''}
                                                onChange={(e) => handleProfileChange('industry', e.target.value)}
                                                className={styles.input}
                                                placeholder="e.g., Technology, Healthcare, Manufacturing"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="location">Location</label>
                                            <input
                                                type="text"
                                                id="location"
                                                value={profileData.location || ''}
                                                onChange={(e) => handleProfileChange('location', e.target.value)}
                                                className={styles.input}
                                                placeholder="e.g., New York, NY"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="capabilities">Company Capabilities</label>
                                        <textarea
                                            id="capabilities"
                                            value={profileData.capabilities || ''}
                                            onChange={(e) => handleProfileChange('capabilities', e.target.value)}
                                            className={styles.textarea}
                                            rows={3}
                                            placeholder="Describe your company's capabilities and expertise..."
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

                                    <div className={styles.formGroup}>
                                        <label htmlFor="company_description">Company Description</label>
                                        <textarea
                                            id="company_description"
                                            value={profileData.company_description || ''}
                                            onChange={(e) => handleProfileChange('company_description', e.target.value)}
                                            className={styles.textarea}
                                            rows={4}
                                            placeholder="Provide a detailed description of your company, its mission, and what it does..."
                                        />
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="years_in_business">Years in Business</label>
                                            <input
                                                type="number"
                                                id="years_in_business"
                                                value={profileData.years_in_business || ''}
                                                onChange={(e) => handleProfileChange('years_in_business', parseInt(e.target.value) || undefined)}
                                                className={styles.input}
                                                min="0"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="employee_count">Number of Employees</label>
                                            <input
                                                type="number"
                                                id="employee_count"
                                                value={profileData.employee_count || ''}
                                                onChange={(e) => handleProfileChange('employee_count', parseInt(e.target.value) || undefined)}
                                                className={styles.input}
                                                min="0"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="revenue_range">Annual Revenue Range</label>
                                        <select
                                            id="revenue_range"
                                            value={profileData.revenue_range || ''}
                                            onChange={(e) => handleProfileChange('revenue_range', e.target.value)}
                                            className={styles.input}
                                        >
                                            <option value="">Select revenue range</option>
                                            <option value="0-50k">$0 - $50,000</option>
                                            <option value="50k-100k">$50,000 - $100,000</option>
                                            <option value="100k-500k">$100,000 - $500,000</option>
                                            <option value="500k-1m">$500,000 - $1,000,000</option>
                                            <option value="1m-5m">$1,000,000 - $5,000,000</option>
                                            <option value="5m-10m">$5,000,000 - $10,000,000</option>
                                            <option value="10m-50m">$10,000,000 - $50,000,000</option>
                                            <option value="50m+">$50,000,000+</option>
                                        </select>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="qa_rating">QA Rating</label>
                                            <input
                                                type="number"
                                                id="qa_rating"
                                                value={profileData.qa_rating || ''}
                                                onChange={(e) => handleProfileChange('qa_rating', parseFloat(e.target.value) || undefined)}
                                                className={styles.input}
                                                min="0"
                                                max="5"
                                                step="0.01"
                                                placeholder="0.00 - 5.00"
                                            />
                                            <small className={styles.helpText}>Quality assurance rating (0.00 - 5.00)</small>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="company_logo">Company Logo URL</label>
                                            <input
                                                type="url"
                                                id="company_logo"
                                                value={profileData.company_logo || ''}
                                                onChange={(e) => handleProfileChange('company_logo', e.target.value)}
                                                className={styles.input}
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lender-specific fields */}
                            {session?.user && (session.user as any).userType === 'lender' && (
                                <div className={styles.section}>
                                    <h3>Lending Information</h3>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="institution_type">Institution Type</label>
                                            <select
                                                id="institution_type"
                                                value={profileData.institution_type || ''}
                                                onChange={(e) => handleProfileChange('institution_type', e.target.value)}
                                                className={styles.input}
                                            >
                                                <option value="">Select institution type</option>
                                                <option value="bank">Bank</option>
                                                <option value="credit_union">Credit Union</option>
                                                <option value="investment_firm">Investment Firm</option>
                                                <option value="private_lender">Private Lender</option>
                                                <option value="peer_to_peer">Peer-to-Peer</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="risk_appetite">Risk Appetite</label>
                                            <select
                                                id="risk_appetite"
                                                value={profileData.risk_appetite || ''}
                                                onChange={(e) => handleProfileChange('risk_appetite', e.target.value)}
                                                className={styles.input}
                                            >
                                                <option value="">Select risk appetite</option>
                                                <option value="conservative">Conservative</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="aggressive">Aggressive</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="min_loan_amount">Minimum Loan Amount</label>
                                            <input
                                                type="number"
                                                id="min_loan_amount"
                                                value={profileData.min_loan_amount || ''}
                                                onChange={(e) => handleProfileChange('min_loan_amount', parseFloat(e.target.value) || undefined)}
                                                className={styles.input}
                                                min="0"
                                                step="1000"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="max_loan_amount">Maximum Loan Amount</label>
                                            <input
                                                type="number"
                                                id="max_loan_amount"
                                                value={profileData.max_loan_amount || ''}
                                                onChange={(e) => handleProfileChange('max_loan_amount', parseFloat(e.target.value) || undefined)}
                                                className={styles.input}
                                                min="0"
                                                step="1000"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin-specific fields: none (admin_level removed) */}
                        </div>

                        {/* Profile Completion Progress Indicator: only for borrowers */}
                        {session?.user && (session.user as any).userType === 'borrower' && (
                            <div className={styles.progressSection}>
                                <div className={styles.progressHeader}>
                                    <h3>Profile Completion</h3>
                                    <span className={styles.progressPercentage}>{profileCompletionPercentage}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div 
                                        className={styles.progressFill}
                                        style={{ width: `${profileCompletionPercentage}%` }}
                                    />
                                </div>
                                <p className={styles.progressMessage}>
                                    {profileCompletionPercentage === 100 
                                        ? 'Your profile is complete! 🎉' 
                                        : `Complete ${100 - profileCompletionPercentage}% more to finish your profile`}
                                </p>
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
                )}
            </div>
        </div>
    );
}
