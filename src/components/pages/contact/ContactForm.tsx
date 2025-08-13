"use client";
import ReCAPTCHA from "react-google-recaptcha";
import styles from "@/styles/pages/contact/contactForm.module.css";
import TitleText from "@/components/common/TitleText";
import { useState, useRef} from "react";

export default function ContactForm() {
    const recaptchaRef = useRef<any>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear any existing message when user starts typing
        if (message) {
            setMessage(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        if (!captchaToken) {
            setMessage({ type: 'error', text: 'Please Complete the reCAPTCHA' });
        }

        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...formData, captchaToken}),
            });

            if (response.ok) {
                const result = await response.json();
                setMessage({ 
                    type: 'success', 
                    text: 'Message sent successfully! We\'ll get back to you soon.' 
                });
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                setText('');
                recaptchaRef.current.reset();
                setCaptchaToken(null);
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: `Error: ${error.error}` });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setMessage({ type: 'error', text: 'Error sending message. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    {/*Name Verifier*/}
    const [name, setName] = useState<string>('');
    const [nameError, setNameError] = useState<string | null>(null);
    const validateName = (value: string) => {
        if(!value.trim()) {
            return "Name can't be blank";

        }
        if (!/^[a-zA-Z' ]+$/.test(value)) {
            return "Name can only contain letters, spaces, and apostrophes";
        }
        return null;
    };
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        const error = validateName(value);
        setNameError(error);
    };

    const isFormValid = !nameError && name.trim() !== '';

    {/*Textbox Character Counter*/}
    const maxChars = 600;
    const [text, setText] = useState<string>('');
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
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
                    
                    {message && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className={styles.contactForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={(e) => {
                                    handleChange(e);
                                    handleNameChange(e);
                                }}
                                className={styles.formInput}
                                required
                            />
                            {nameError && <p style={{ color: 'red' }}>{nameError}</p>}
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
                                maxLength={maxChars}
                                value={formData.message}
                                onChange={(e) => {
                                    handleChange(e);
                                    handleTextChange(e);
                                }}
                                className={styles.formTextarea}
                                rows={6}
                                required
                            />
                            <div>
                                {text.length} / {maxChars} characters
                            </div>
                        </div>
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                            ref={recaptchaRef}
                            onChange={(token) => setCaptchaToken(token)}
                        />
                        <button 
                            type="submit" 
                            className={styles.submitBtn}
                            disabled={isSubmitting || !isFormValid}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
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
