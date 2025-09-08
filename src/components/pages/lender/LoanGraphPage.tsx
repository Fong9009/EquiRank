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

export default function LoanGraphPage({ loanId }: LoanAnalysisProps){
    const [radarWithDescriptions, setDataWithDescriptions] = useState<any[]>([]);
    const [testData, setData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`/api/loan-statistics/loan-covenant-graph/${loanId}`);
                if (!res.ok) throw new Error("Failed to fetch data");

                const json = await res.json();
                // JSON already contains description & color
                setDataWithDescriptions(json);
                console.log("Fetched data with descriptions:", json);
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
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

    const Graphdata = [
        {
            name: "Wages/Revenue",
            value: 26.84,
            benchmark: 11,
            comparison: ">",
        },
        {
            name: "Total Exp/Total Inc",
            value: 62.16,
            benchmark: 61,
            comparison: ">",
        },
        {
            name: "Total Exp/Total Inc",
            value: 62.16,
            benchmark: 61,
            comparison: ">",
        },
        {
            name: "Net Profit Margin",
            value: 36.53,
            benchmark: 48,
            comparison: "<",
        },
        {
            name: "EBITDA/Revenue",
            value: 37.12,
            benchmark: 43,
            comparison: "<",
        },
    ];

    const getStatusColor = (value: number, benchmark: number, comparison: string) => {
        if (comparison === "<") {
            return value < benchmark ? "#4CAF50" : "#F44336"; // green if less, red if more
        }
        if (comparison === ">") {
            return value > benchmark ? "#4CAF50" : "#F44336"; // green if greater, red if less
        }
        return "#9E9E9E";
    };


    return(
        <div>
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
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            layout="vertical"
                            data={Graphdata}
                            margin={{ top: 20, right: 10, left: 80, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip formatter={(val: number) => `${val}%`} />

                            <Bar
                                dataKey="value"
                                barSize={20}
                                shape={(props: any) => {
                                    const { x, y, width, height, payload } = props;
                                    const color = getStatusColor(payload.value, payload.benchmark, payload.comparison);
                                    return <rect x={x} y={y} width={width} height={height} fill={color} rx={5} />;
                                }}
                            >
                                <LabelList dataKey="value" position="right" formatter={(val: any) => `${val}%`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}


