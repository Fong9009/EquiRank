import { NextRequest, NextResponse } from 'next/server';
import { updateUserByIDAdmin } from '@/database/user';
import { auth } from '@/lib/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if ((session.user as any).userType !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.id, 10);
        const body = await request.json();

        // Server-side access control validation
        const currentUserId = parseInt(session.user.id, 10);
        const currentUserIsSuperAdmin = Boolean((session.user as any).isSuperAdmin);
        
        // Prevent editing own account
        if (currentUserId === userId) {
            return NextResponse.json(
                { error: 'Forbidden: Cannot edit your own account through admin interface' },
                { status: 403 }
            );
        }

        // Get target user to check their permissions
        try {
            const { getUserById } = await import('@/database/user');
            const targetUser = await getUserById(userId);
            
            if (!targetUser) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            const targetUserType = targetUser.user_type;
            const targetIsSuperAdmin = Boolean(targetUser.is_super_admin);

            // Regular admins can only edit borrowers and lenders
            if (!currentUserIsSuperAdmin && targetUserType === 'admin') {
                return NextResponse.json(
                    { error: 'Forbidden: Regular admins can only edit borrower and lender accounts' },
                    { status: 403 }
                );
            }

            // Super admins cannot edit other super admins
            if (currentUserIsSuperAdmin && targetIsSuperAdmin) {
                return NextResponse.json(
                    { error: 'Forbidden: Super admins cannot edit other super admin accounts' },
                    { status: 403 }
                );
            }

        } catch (error) {
            console.error('Error validating user access:', error);
            return NextResponse.json(
                { error: 'Failed to validate user access' },
                { status: 500 }
            );
        }

        // Log the update request for debugging
        console.log(`Admin updating user ${userId}:`, {
            fields: Object.keys(body).filter(key => body[key] !== undefined),
            hasProfilePictureUpdate: body.profile_picture !== undefined,
            adminId: currentUserId,
            adminIsSuper: currentUserIsSuperAdmin
        });

        // Use the comprehensive admin update function
        const updatedUser = await updateUserByIDAdmin(userId, body);

        if (updatedUser) {
            console.log(`Admin successfully updated user ${userId}`);
            return NextResponse.json({ 
                success: true, 
                message: 'User updated successfully',
                userId: userId
            }, { status: 200 });
        } else {
            console.error(`Admin failed to update user ${userId}`);
            return NextResponse.json({ 
                error: 'Failed to update user' 
            }, { status: 500 });
        }
    } catch (err) {
        console.error('Error updating user:', err);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
