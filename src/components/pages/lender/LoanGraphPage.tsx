"use client";
import React, {useEffect, useState} from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import styles from "@/styles/pages/lender/loanGraphPage.module.css";

interface LoanAnalysisProps {
    loanId: string;
}

interface FinancialStatement {
    currentAssets: number;
}

interface FinancialSummary {
    financialStatements: Record<string, FinancialStatement>;
}

export default function LoanGraphPage({ loanId }: LoanAnalysisProps){
    const [radarWithDescriptions, setDataWithDescriptions] = useState<any[]>([]);
    const [absStatistics, setAbsStatistics] = useState<any[]>([]);
    const [currentAssetsGraph, setCurrentAssetsGraph] = useState<any>();
    const [testData, setData] = useState<any>(null);

    //Used to Obtain the Covenant Statistics
    useEffect(() => {
        if (!loanId) return;

        const fetchAllData = async () => {
            try {
                const [covenantRes, absRes, financeRes] = await Promise.all([
                    fetch(`/api/loan-statistics/loan-covenant-graph/${loanId}`),
                    fetch(`/api/loan-statistics/loan-abs-graph/${loanId}`),
                    fetch(`/api/loan-statistics/loan-current-assets/${loanId}`)
                ]);

                if (!covenantRes.ok) throw new Error("Failed to fetch covenant data");
                if (!absRes.ok) throw new Error("Failed to fetch ABS data");
                if (!financeRes.ok) throw new Error("Failed to fetch financial asset data");

                const [covenantData, absData, financeData] = await Promise.all([
                    covenantRes.json(),
                    absRes.json(),
                    financeRes.json()
                ]);


                setDataWithDescriptions(covenantData);
                setAbsStatistics(absData.abs_benchmark);
                setCurrentAssetsGraph(financeData);
            } catch (err) {
                console.error("Data fetching error:", err);
                // Handle error state appropriately
            }
        };

        fetchAllData();
    }, [loanId]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{ backgroundColor: 'white' , color: 'black', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <strong>{dataPoint.category}</strong>
                    <p>{dataPoint.description}</p>
                </div>
            );
        }
        return null;
    };

    const formatTooltip = (value: number, name: string) => {
        return [formatWithUnits(value), name];
    };

    const formatYAxis = (value: number) => {
        return formatWithUnits(value);
    };

    return(
        <div>
            <div className={styles.ribbon}>
                <h1 className={styles.titleSection}>Core Investor Graphs</h1>
            </div>
            <div className={styles.graphRow}>
                <div className={styles.container}>
                    <h1 className={styles.titleText}>High Level Investor View</h1>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarWithDescriptions}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar name="Company A" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className={styles.container}>
                    <h1 className={styles.titleText}>ABS Benchmark</h1>
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            layout="vertical"
                            data={absStatistics}
                            className={styles.barChart}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={150}
                                tick={{ fontSize: 16 }}
                                tickFormatter={(value) => {
                                    // Shorten long names
                                    const shortNames: any = {
                                        "Wages and Salaries/Revenue": "Wages/Revenue",
                                        "Total Expenses/Total Income": "Total Exp/Total Inc",
                                        "Total Expenses/Revenue": "Total Exp/Revenue",
                                        "Operating Profit Before Tax/Total Income": "Op Profit/Total Inc",
                                        "Net Profit/Loss (-) Margin": "Net Profit Margin",
                                        "EBITDA/Net Revenue": "EBITDA/Revenue",
                                        "Total Other Income/Revenue": "Other Inc/Revenue",
                                        "Total Other Income/Net Profit/Loss Before Tax": "Other Inc/Net Profit",
                                        "Depreciation and Amortisation/Net Revenue": "Depreciation/Revenue"
                                    };
                                    return shortNames[value] || value;
                                }}
                            />
                            <Tooltip
                                labelStyle={{ color: 'black', fontWeight: 'bold' }}
                                formatter={(value: number, name: string) => {
                                    const displayName = name === 'benchmarkValue' ? 'Benchmark Value' :
                                        name === 'calculatedValue' ? 'Calculated Value' : name;
                                    return [`${value}%`, displayName];
                                }}
                            />

                            <Bar
                                dataKey="calculatedValue"
                                barSize={20}
                                shape={(props: any) => {
                                    const { x, y, width, height, payload } = props;
                                    const color = "#4CAF50"
                                    return <rect x={x} y={y} width={width} height={height} fill={color} rx={5} />;
                                }}
                            >
                                <LabelList dataKey="calculatedValue" position="right" formatter={(val: any) => `${val}%`} />
                            </Bar>
                            <Bar
                                dataKey="benchmarkValue"
                                barSize={20}
                                shape={(props: any) => {
                                    const { x, y, width, height, payload } = props;
                                    const color =  "#fdb523"
                                    return <rect x={x} y={y} width={width} height={height} fill={color} rx={5} />;
                                }}
                            >
                                <LabelList dataKey="benchmarkValue" position="right" formatter={(val: any) => `${val}%`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className={styles.ribbon}>
                <h1 className={styles.titleSection}>Financial Summary</h1>
            </div>
            <div className={styles.graphRow}>
                <div className={styles.barContainer}>
                    <h1 className={styles.titleText}>Current Assets Past 3 Years</h1>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={currentAssetsGraph}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="year"
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <YAxis
                                tickFormatter={formatYAxis}
                                tick={{ fontSize: 12 }}
                                axisLine={{ stroke: '#e0e0e0' }}
                            />
                            <Tooltip
                                formatter={formatTooltip}
                                labelStyle={{ color: 'black', fontWeight: 'bold' }}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="currentAssets"
                                fill="#4CAF50"
                                radius={[4, 4, 0, 0]}
                                stroke="#45a049"
                                strokeWidth={1}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function formatWithUnits(value: number): string {
    if (value === null || value === undefined) return "-";

    const absVal = Math.abs(value);

    if (absVal >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
    if (absVal >= 1_000_000_000)     return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (absVal >= 1_000_000)         return `$${(value / 1_000_000).toFixed(1)}M`;
    if (absVal >= 1_000)             return `$${(value / 1_000).toFixed(1)}K`;

    return `$${value}`;
}
