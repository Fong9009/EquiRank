"use client";
import clsx from 'clsx';
import styles from '@/styles/pages/home/benefits.module.css'
import FlipCard from "@/components/common/FlipCard";
import React from "react";

export default function Benefits() {
    return (
        <div className={styles.featureBox}>
            <p className={styles.titleText}>Benefits of Using EquiRank</p>

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
                    backText={
                    <>
                        <></>
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
                    backText={<p>This is a test</p>}
                />

                <FlipCard
                    imageContent={<img className={styles.imageContainer} src="/images/lightBulb.png" alt="A Light Bulb" />}
                    titleText={<h1>Give Initiative</h1>}
                    paraText={<p>With our Data Analysis engine you will be able to make better informed decisions on investments
                    </p>}
                    readMore={<p className={styles.readMoreText}>
                        Flip To Read More <img src="/icons/arrow_forward.png" alt="Forward Arrow" className={styles.arrowIcon} />
                    </p>}
                    backText={<p>This is a test</p>}
                />
                <FlipCard
                    imageContent={<img className={styles.imageContainer} src="/images/download.png" alt="Download Symbol" />}
                    titleText={<h1>Import Data?</h1>}
                    paraText={<p>With our Data Analysis engine you will be able to make better informed decisions on investments
                    </p>}
                    readMore={<p className={styles.readMoreText}>
                        Flip To Read More <img src="/icons/arrow_forward.png" alt="Forward Arrow" className={styles.arrowIcon} />
                    </p>}
                    backText={<p>This is a test</p>}
                />
            </div>
        </div>
    )
}