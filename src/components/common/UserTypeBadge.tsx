'use client';

interface UserTypeBadgeProps {
    userType: 'borrower' | 'lender' | 'admin';
    isSuperAdmin?: boolean;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export default function UserTypeBadge({ 
    userType, 
    isSuperAdmin = false, 
    size = 'medium',
    className = '' 
}: UserTypeBadgeProps) {
    // Determine the actual display type
    const displayType = isSuperAdmin ? 'super_admin' : userType;
    
    // Get badge text
    const getBadgeText = () => {
        switch (displayType) {
            case 'super_admin':
                return 'Super Admin';
            case 'admin':
                return 'Admin';
            case 'borrower':
                return 'Borrower';
            case 'lender':
                return 'Lender';
            default:
                return 'User';
        }
    };

    // Get badge styling based on type
    const getBadgeStyles = () => {
        switch (displayType) {
            case 'super_admin':
                return 'superAdminBadge';
            case 'admin':
                return 'adminBadge';
            case 'borrower':
                return 'borrowerBadge';
            case 'lender':
                return 'lenderBadge';
            default:
                return 'userBadge';
        }
    };

    return (
        <span className={`userTypeBadge ${getBadgeStyles()} ${size} ${className}`}>
            {getBadgeText()}
        </span>
    );
}
