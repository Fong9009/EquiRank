import { NextRequest, NextResponse } from 'next/server';
import { calculateProfileCompletion } from '@/database/profile';

export async function POST(request: NextRequest) {
    try {
        const { userType, profileData } = await request.json();
        
        const completionPercentage = calculateProfileCompletion(userType, profileData);
        
        return NextResponse.json({ 
            completionPercentage 
        });
    } catch (error) {
        console.error('Error calculating profile completion:', error);
        return NextResponse.json(
            { error: 'Failed to calculate profile completion' },
            { status: 500 }
        );
    }
}
