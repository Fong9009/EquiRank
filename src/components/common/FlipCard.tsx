"use client";
import {useState, ReactNode, useEffect} from 'react';
import clsx from 'clsx';
import styles from "@/styles/components/flipCard.module.css";
import {useSession} from "next-auth/react";

interface FlipCardProps {
    imageContent: ReactNode;
    titleText: ReactNode;
    paraText: ReactNode;
    readMore: ReactNode;
    backTitleText: ReactNode;
    backText: ReactNode;
}

export default function FlipCard({imageContent, titleText, paraText, readMore, backTitleText, backText}: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

    const frontFlipCard = theme === "light" ? styles.lightFlipCardFront : styles.darkFlipCardFront;
    const backFlipCard = theme === "light" ? styles.lightFlipCardBack : styles.darkFlipCardBack;
    const frontFlipTitleText  = theme === "light" ? styles.lightFrontTitleText : styles.darkFrontTitleText;
    const backFlipTitleText  = theme === "light" ? styles.lightCardBackTitleText : styles.darkCardBackTitleText;
    const paragraphText = theme === "light" ? styles.lightFlipCardText : styles.darkFlipCardText;

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

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    }
    return (
        <div className={styles.flipCard} onClick={handleFlip}>
            <div className={styles.flipCardInner} style={{transform: isFlipped ? 'rotateY(180deg)' : 'none'}}>
                <div className={frontFlipCard}>
                    <div className={styles.imageContainer}>
                        {imageContent}
                    </div>
                    <div className={frontFlipTitleText}>
                        {titleText}
                    </div>
                    <div className={paragraphText}>
                        {paraText}
                    </div>
                    <div className={styles.readMoreButton}>
                        {readMore}
                    </div>
                </div>
                <div className={backFlipCard}>
                    <div className={backFlipTitleText}>
                        {backTitleText}
                    </div>
                    <div className={paragraphText}>
                        {backText}
                    </div>
                </div>
            </div>
        </div>
    )
}