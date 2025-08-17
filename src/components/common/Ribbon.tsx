"use client";
import styles from '@/styles/components/ribbon.module.css';
import { useEffect, useState } from 'react';

export default function Ribbon({username, imageUrl, quote}: { username: React.ReactNode, imageUrl: string, quote: string }) {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 0 && hour < 12) {
            setGreeting('Good Morning');
        } else if (hour >= 12 && hour <= 23) {
            setGreeting('Good Afternoon');
        }
    }, []);

    return (
        <div className={styles.splashImage} style={{ backgroundImage: `url(${imageUrl})`}}>
            <h2 className={styles.titleText}>{greeting}, {username}</h2>
            <p className={styles.quoteText}>{quote}</p>
        </div>
    )
}