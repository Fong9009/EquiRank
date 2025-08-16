import ArchivedMessages from '@/components/pages/admin/ArchivedMessages';
import { Suspense } from 'react';

export default function ArchivePage() {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <ArchivedMessages />
            </ Suspense>
        </div>
    );
}
