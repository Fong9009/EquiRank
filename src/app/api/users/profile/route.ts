import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile, getUserById } from '@/database/user';
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
        const profileData = await request.json();

        // Validate required fields
        if (!profileData) {
            return NextResponse.json(
                { error: 'Profile data is required' },
                { status: 400 }
            );
        }

        // Update profile
        console.log('Updating user profile:', {
            userId,
            profileData,
            hasProfilePicture: !!profileData.profile_picture
        });
        
        const success = await updateUserProfile(userId, profileData);
        
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

        // Return full user profile data
        return NextResponse.json({
            id: userProfile.id,
            email: userProfile.email,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            user_type: userProfile.user_type,
            entity_type: userProfile.entity_type,
            company: userProfile.company,
            phone: userProfile.phone,
            address: userProfile.address,
            profile_picture: userProfile.profile_picture,
            bio: userProfile.bio,
            website: userProfile.website,
            linkedin: userProfile.linkedin,
            is_approved: userProfile.is_approved,
            is_active: userProfile.is_active,
            is_super_admin: userProfile.is_super_admin
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
