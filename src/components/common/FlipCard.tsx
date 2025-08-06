"use client";
import {useState, ReactNode} from 'react';
import clsx from 'clsx';
import styles from "@/styles/components/flipCard.module.css";

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

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    }
    return (
        <div className={styles.flipCard} onClick={handleFlip}>
            <div className={styles.flipCardInner} style={{transform: isFlipped ? 'rotateY(180deg)' : 'none'}}>
                <div className={styles.flipCardFront}>
                    <div className={styles.imageContainer}>
                        {imageContent}
                    </div>
                    <div className={styles.flipCardTitleText}>
                        {titleText}
                    </div>
                    <div className={styles.flipCardText}>
                        {paraText}
                    </div>
                    <div className={styles.readMoreButton}>
                        {readMore}
                    </div>
                </div>
                <div className={styles.flipCardBack}>
                    <div className={styles.flipCardBackTitleText}>
                        {backTitleText}
                    </div>
                    <div className={styles.backText}>
                        {backText}
                    </div>
                </div>
            </div>
        </div>
    )
}