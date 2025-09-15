import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, getUserById } from '@/database/user';
import { 
    getBorrowerProfile, 
    getLenderProfile, 
    getAdminProfile, 
    updateBorrowerProfile, 
    updateLenderProfile, 
    updateAdminProfile,
    getProfileCompletionPercentage
} from '@/database/profile';
import { auth } from '@/lib/auth';

export async function PUT(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id);
        const requestData = await request.json();

        // Validate required fields
        if (!requestData) {
            return NextResponse.json(
                { error: 'Profile data is required' },
                { status: 400 }
            );
        }

        // Update profile
        console.log('Updating user profile:', {
            userId,
            profileData: requestData,
            hasProfilePicture: !!requestData.profile_picture
        });
        
        // Get current user to determine user type
        const currentUser = await getUserById(userId);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Separate basic user data from role-specific profile data
        const basicUserFields = ['first_name', 'last_name', 'phone', 'address', 'company', 'profile_picture', 'bio', 'preferences', 'theme', 'language', 'timezone', 'notifications'];
        const profileFields = ['website', 'linkedin', 'industry', 'location', 'capabilities', 'years_in_business', 'employee_count', 'revenue_range', 'company_description', 'qa_rating', 'company_logo', 'institution_type', 'risk_appetite', 'target_industries', 'target_markets', 'min_loan_amount', 'max_loan_amount', 'profile_completion_percentage', 'profile_completed_at', 'profile_completion_required'];
        
        const basicUserData: any = {};
        const roleProfileData: any = {};
        
        Object.entries(requestData).forEach(([key, value]) => {
            if (basicUserFields.includes(key)) {
                basicUserData[key] = value;
            } else if (profileFields.includes(key)) {
                roleProfileData[key] = value;
            }
        });

        // Update basic user data if there are any changes
        let success = true;
        if (Object.keys(basicUserData).length > 0) {
            success = await updateUserProfile(userId, basicUserData);
        }

        // Update role-specific profile data
        if (Object.keys(roleProfileData).length > 0) {
            let profileSuccess = false;
            
            if (currentUser.user_type === 'borrower') {
                profileSuccess = await updateBorrowerProfile(userId, roleProfileData);
            } else if (currentUser.user_type === 'lender') {
                profileSuccess = await updateLenderProfile(userId, roleProfileData);
            } else if (currentUser.user_type === 'admin') {
                profileSuccess = await updateAdminProfile(userId, roleProfileData);
            }
            
            success = success && profileSuccess;
        }

        // Calculate new completion percentage
        const newCompletionPercentage = await getProfileCompletionPercentage(userId, currentUser.user_type);
        
        // Update completion percentage in the appropriate profile table
        if (currentUser.user_type === 'borrower') {
            await updateBorrowerProfile(userId, {
                profile_completion_percentage: newCompletionPercentage,
                profile_completed_at: newCompletionPercentage >= 100 ? new Date().toISOString().slice(0, 19).replace('T', ' ') : undefined
            }); 
        } else if (currentUser.user_type === 'lender') {
            // Lenders don't need profile completion tracking
            // No profile completion update needed
        } else if (currentUser.user_type === 'admin') {
            // Admins don't need profile completion tracking
            // No profile completion update needed
        }
        
        if (success) {
            console.log('Profile updated successfully for user:', userId);
            return NextResponse.json(
                { message: 'Profile updated successfully' },
                { status: 200 }
            );
        } else {
            console.error('Failed to update profile for user:', userId);
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get full user profile from database
        const userId = parseInt(session.user.id);
        const userProfile = await getUserById(userId);
        
        if (!userProfile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 404 }
            );
        }

        // Get role-specific profile data
        let roleProfile: any = {};
        let completionPercentage = 0;
        let profileCompletedAt = null;
        let profileCompletionRequired = true;

        if (userProfile.user_type === 'borrower') {
            const borrowerProfile = await getBorrowerProfile(userId);
            if (borrowerProfile) {
                roleProfile = borrowerProfile;
                completionPercentage = borrowerProfile.profile_completion_percentage;
                profileCompletedAt = borrowerProfile.profile_completed_at;
                profileCompletionRequired = borrowerProfile.profile_completion_required;
            }
        } else if (userProfile.user_type === 'lender') {
            const lenderProfile = await getLenderProfile(userId);
            if (lenderProfile) {
                roleProfile = lenderProfile;
                completionPercentage = 100;
                profileCompletedAt = null;
                profileCompletionRequired = false;
            }
        } else if (userProfile.user_type === 'admin') {
            const adminProfile = await getAdminProfile(userId);
            if (adminProfile) {
                roleProfile = adminProfile;
                completionPercentage = 100;
                profileCompletedAt = null;
                profileCompletionRequired = false;
            }
        }

        // Return full user profile data
        return NextResponse.json({
            id: userProfile.id,
            email: userProfile.email,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            user_type: userProfile.user_type,
            company: userProfile.company,
            phone: userProfile.phone,
            address: userProfile.address,
            profile_picture: userProfile.profile_picture,
            bio: userProfile.bio,
            website: userProfile.website,
            linkedin: userProfile.linkedin,
            is_approved: userProfile.is_approved,
            is_active: userProfile.is_active,
            is_super_admin: userProfile.is_super_admin,
            // Role-specific profile fields
            ...roleProfile,
            // Profile completion
            profile_completion_percentage: completionPercentage,
            profile_completed_at: profileCompletedAt,
            profile_completion_required: profileCompletionRequired
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
