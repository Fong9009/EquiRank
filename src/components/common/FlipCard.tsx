import {useState} from 'react';
import styles from "@/styles/components/flipCard.module.css";

export default function FlipCard({imageContent, titleText, paraText, readMore}) {
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
                    <h2>Back</h2>
                </div>
            </div>
        </div>
    )
}