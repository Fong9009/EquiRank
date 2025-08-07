"use client";
import styles from "@/styles/pages/contact/contactForm.module.css";
import TitleText from "@/components/common/TitleText";
import { useState } from "react";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log('Form submitted:', formData);
    };

    return (
        <div className={styles.contactBox}>
            <div className={styles.titleSection}>
                <TitleText
                    titleText={<h1>Let's Start a Conversation</h1>}
                />
            </div>
            
            <div className={styles.splitBox}>
                <div className={styles.formBox}>
                    <h2 className={styles.formTitle}>Send Us a Message</h2>
                    <hr className={styles.textDivider}></hr>
                    
                    <form onSubmit={handleSubmit} className={styles.contactForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={styles.formInput}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={styles.formInput}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="subject" className={styles.formLabel}>Subject</label>
                            <select
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className={styles.formSelect}
                                required
                            >
                                <option value="">Select a subject</option>
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="partnership">Partnership</option>
                                <option value="feedback">Feedback</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.formLabel}>Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className={styles.formTextarea}
                                rows={6}
                                required
                            />
                        </div>
                        
                        <button type="submit" className={styles.submitBtn}>
                            Send Message
                        </button>
                    </form>
                </div>
                
                <div className={styles.infoBox}>
                    <h2 className={styles.infoTitle}>Get In Touch</h2>
                    <hr className={styles.textDivider}></hr>
                    
                    <div className={styles.contactInfo}>
                        <div className={styles.infoItem}>
                            <h3 className={styles.infoItemTitle}>Email</h3>
                            <p className={styles.infoItemText}>contact@equirank.com</p>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <h3 className={styles.infoItemTitle}>Phone</h3>
                            <p className={styles.infoItemText}>+61 (0) 3 1234 5678</p>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <h3 className={styles.infoItemTitle}>Address</h3>
                            <p className={styles.infoItemText}>
                                Melbourne, Victoria<br/>
                                Australia
                            </p>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <h3 className={styles.infoItemTitle}>Business Hours</h3>
                            <p className={styles.infoItemText}>
                                Monday - Friday: 9:00 AM - 6:00 PM<br/>
                                Saturday: 10:00 AM - 4:00 PM<br/>
                                Sunday: Closed
                            </p>
                        </div>
                    </div>
                    
                    <div className={styles.wavePattern}>
                        <svg viewBox="0 0 500 150" preserveAspectRatio="none">
                            <path d="M0.00,49.98 C150.00,150.00 349.72,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
