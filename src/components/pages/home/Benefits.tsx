"use client";
import clsx from 'clsx';
import styles from '@/styles/pages/home/benefits.module.css'
import FlipCard from "@/components/common/FlipCard";
import TitleText from "@/components/common/TitleText";
import React, {useEffect, useState} from "react";
import {useSession} from "next-auth/react";

export default function Benefits() {
    const { data: session} = useSession();
    const [theme,setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
    const boxClass = theme === "light" ? styles.lightFeatureBox : styles.darkFeatureBox;
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

    return (
        <div className={boxClass}>
            <div className={styles.titleTextSection}>
                <TitleText
                    titleText={<p>Benefits of Using EquiRank</p>}
                />
            </div>
            <div className={styles.cardGrid}>
                <FlipCard
                    imageContent={<img src="/images/books.png" alt="A Shelf Of Books Icon"/>}
                    titleText={<h1>Knowledge</h1>}
                    paraText={
                        <p>With our Engine, you have a plethra of information at your fingertips to make
                            informed decisions on your investments
                        </p>}
                    readMore={<p className={styles.readMoreText}>
                        Flip To Read More <img src="/icons/arrow_forward.png" alt="Forward Arrow" className={styles.arrowIcon} />
                    </p>}
                    backTitleText={<h1>Knowledge</h1>}
                    backText={
                    <>
                        <p>EquiRank's Engine is designed to provide as much information
                                as you need to make an informed decision when it comes to investing.
                                You will be able to see company statistics such as:
                        </p>
                            <ul className={styles.dotList}>
                                <li>Annual Turnover</li>
                                <li>Industry Type</li>
                                <li>Number of Employees</li>
                            </ul>
                    </>}
                />

                <FlipCard
                    imageContent={<img className={styles.imageContainer} src="/images/graph.png" alt="A Stock Graph" />}
                    titleText={<h1>Data Analysis</h1>}
                    paraText={<p>With our Data Analysis engine you will be able to make better informed decisions on investments
                    </p>}
                    readMore={<p className={styles.readMoreText}>
                        Flip To Read More <img src="/icons/arrow_forward.png" alt="Forward Arrow" className={styles.arrowIcon} />
                    </p>}
                    backTitleText={<h1>Data Analysis</h1>}
                    backText={
                    <>
                        <p>
                            With data Driven Statistics, you will be able to make a more informed decision on your
                            investments. It is only a guide, not an advisor on your investments but a great way to broaden your vision.
                        </p>
                        <ul className={styles.dotList}>
                            <li>Provides warnings about Companies</li>
                            <li>Provides insight on their business operations</li>
                            <li>Provides the Health of the Business</li>
                        </ul>
                    </>}
                />

                <FlipCard
                    imageContent={<img className={styles.imageContainer} src="/images/lightBulb.png" alt="A Light Bulb" />}
                    titleText={<h1>Give Initiative</h1>}
                    paraText={<p>With our engine you will be able to take the initiative when an opportunity in investments arrives
                        ,you can take a leap knowing you have the knowledge.
                    </p>}
                    readMore={<p className={styles.readMoreText}>
                        Flip To Read More <img src="/icons/arrow_forward.png" alt="Forward Arrow" className={styles.arrowIcon} />
                    </p>}
                    backTitleText={<h1>Give Initiative</h1>}
                    backText={
                        <>
                            <p>
                                This engine is one of a kind. With it's enhanced search capabilities and filtering
                                you will be able to observe The state of Australian businesses in the market.
                            </p>
                            <ul className={styles.dotList}>
                                <li>See the earnings of the company</li>
                                <li>See the debt of the company</li>
                                <li>You have the control of what to search</li>
                            </ul>
                        </>}
                />
                <FlipCard
                    imageContent={<img className={styles.imageContainer} src="/images/download.png" alt="Download Symbol" />}
                    titleText={<h1>Import Data?</h1>}
                    paraText={<p>With our Data Analysis engine you can import your company data to see how your company is fairing and give it a public image in the investment market.
                    </p>}
                    readMore={<p className={styles.readMoreText}>
                        Flip To Read More <img src="/icons/arrow_forward.png" alt="Forward Arrow" className={styles.arrowIcon} />
                    </p>}
                    backTitleText={<h1>Import Data</h1>}
                    backText={
                        <>
                            <p>
                                This engine does not only allow you to observe data, you can also add your own business in.
                                Allowing you to have a public presence in the market
                            </p>
                            <ul className={styles.dotList}>
                                <li>See the health of your company</li>
                                <li>See what your company is worth</li>
                                <li>Mark Areas of Improvement</li>
                            </ul>
                        </>}
                />
            </div>
        </div>
    )
}