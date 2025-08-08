"use client";
import {useInView} from "react-intersection-observer";
import clsx from "clsx";
import styles from "@/styles/components/sliding.module.css";
import {useState, ReactNode} from "react";

interface SlideOnProps {
    children: ReactNode;
    direction?: "left" | "right" | "top" | "bottom";
}

export default function SlideOnView({
    children,
    direction = "left",}: SlideOnProps) {
    const {ref, inView} = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    return (
        <div ref={ref} className={clsx(styles.slide,styles[direction],inView && styles.visible)}>
            {children}
        </div>
    );
}
