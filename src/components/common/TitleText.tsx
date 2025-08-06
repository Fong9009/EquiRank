"use client";
import {useInView} from "react-intersection-observer";
import clsx from "clsx";
import styles from "@/styles/components/text.module.css";
import {useState, ReactNode} from "react";

interface TitleTextProps {
    titleText: ReactNode;
}

export default function TitleText({titleText}: TitleTextProps) {
    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div ref={ref} className={clsx(styles.titleText, styles.slideInLeftOnScroll, inView && styles.slideInLeftVisible)}>
            {titleText}
        </div>
    )
}