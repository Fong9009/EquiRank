"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "@/styles/components/customDropdown.module.css";

interface Option {
    value: string;
    label: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
}

export default function CustomDropdown({ options, value, onChange }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
        }
        setIsOpen(!isOpen);
    }

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || "Select";

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <div className={styles.selected} onClick={toggleDropdown}>
                {selectedLabel} <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
            </div>

            {isOpen &&
                createPortal(
                    <div
                        className={styles.options}
                        style={{
                            top: position.top,
                            left: position.left,
                            width: position.width,
                        }}
                    >
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                className={styles.option}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
}