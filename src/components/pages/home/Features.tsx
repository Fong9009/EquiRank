"use client";
import styles from "@/styles/pages/home/features.module.css";
import clsx from "clsx";
import TitleText from "@/components/common/TitleText"
import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination, Autoplay } from 'swiper/modules';

export default function Features() {
    return (
        <div className={styles.featureBox}>
            <div className={styles.titleTextSection}>
                <TitleText
                    titleText={<p>The Future of Investment is Here</p>}
                />
            </div>
            <div className={styles.carousel}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation={{
                    nextEl: ".custom-next",
                    prevEl: ".custom-prev",
                }}
                pagination={{clickable:true}}
                autoplay={{ delay: 5000 }}
                spaceBetween={30}
                slidesPerView={1}
                className={styles.carousel}
            >
                <div className="custom-prev">◀</div>
                <div className="custom-next">▶</div>
                {/* Slide 1 */}
                <SwiperSlide>
                    <div className={styles.listBox} style={{ backgroundImage: "url('/images/pic1.jpg')" }}>
                        <div className={styles.backgroundBox}>
                            <div className={styles.listBoxTitle}>
                                <p>Make Comparisons Easier</p>
                            </div>
                            <div className={styles.listBodyText}>
                                <p>
                                    Here at EquiRank, we know how hard it is to get an inside view into companies to
                                    make a trustworthy investment without having a safety net.
                                    With our state of the art comparison system,
                                    you can rest assured that you can get accurate information and compare between other companies.
                                </p>
                            </div>
                            <ul className={styles.dotList}>
                                <li>Data Driven Statistics</li>
                                <li>Efficient Search</li>
                                <li>Multiple Comparisons</li>
                            </ul>
                            <img className={styles.imageContainer} src="/images/search.png" alt="Search Icon" />
                        </div>
                    </div>
                </SwiperSlide>

                {/* Slide 2 */}
                <SwiperSlide>
                    <div className={styles.listBox} style={{ backgroundImage: "url('/images/pic2.jpg')" }}>
                        <div className={styles.backgroundBox}>
                            <div className={styles.listBoxTitle}>
                                <p>State Of The Art</p>
                            </div>
                            <div className={styles.listBodyText}>
                                <p>
                                    Our State of the Art Comparison Engine will be able to cater to your company comparison
                                    needs, ensuring that you can make a clear, informed decision in your investments
                                    through data driven investment decisions. Compare companies with critical financial metrics.
                                </p>
                            </div>
                            <ul className={styles.dotList}>
                                <li>Critical Financial Metrics</li>
                                <li>Efficient Filtering</li>
                                <li>Saves Recent Searches</li>
                            </ul>
                            <img className={styles.imageContainer} src="/images/stocks.png" alt="Picture of Stock Graph" />
                        </div>
                    </div>
                </SwiperSlide>

                {/* Slide 3 */}
                <SwiperSlide>
                    <div className={styles.listBox} style={{ backgroundImage: "url('/images/pic3.jpg')" }}>
                        <div className={styles.backgroundBox}>
                            <div className={styles.listBoxTitle}>
                                <p>One of a Kind</p>
                            </div>
                            <div className={styles.listBodyText}>
                                <p>
                                    Built from the ground up for smarter investing, able to deliver side by side insights
                                    into the companies that you might invest in. Our One of a Kind System gives you a complete
                                    financial snapshot at a glance allowing you to make smarter, faster and more informed decisions.
                                </p>
                            </div>
                            <ul className={styles.dotList}>
                                <li>Built from the Ground Up</li>
                                <li>Comparison Metrics</li>
                                <li>Many Filters to Choose From</li>
                            </ul>
                            <img className={styles.imageContainer} src="/images/cog.png" alt="Picture of Cog" />
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
            </div>
        </div>
    )
}