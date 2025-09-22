import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    BarChart, CartesianGrid, XAxis, YAxis, Bar, LabelList
} from "recharts";
import styles from "@/styles/components/companyCard.module.css";

interface CompanyCardProps {
    company: {
        id: number;
        company_name: string;
        industry: string;
        revenue_range: string;
        borrower_name: string;
    };
    onRemove: (id: number) => void;
}

export default function CompanyCard({ company, onRemove }: CompanyCardProps) {
    const [radarWithDescriptions, setDataWithDescriptions] = useState<any[]>([]);
    const [absStatistics, setAbsStatistics] = useState<any[]>([]);
    const [financialSummaryData, setFinancialSummaryData] =  useState<any>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRadarData = async () => {
            setLoading(true);
            try {
                const [covenantRes, absRes, financeSumRes] = await Promise.all([
                    fetch(`/api/company-statistics/company-covenant-graph/${company.id}`),
                    fetch(`/api/company-statistics/company-abs-graph/${company.id}`),
                    fetch(`/api/company-statistics/company-financial-summary/${company.id}`),
                ]);

                // Parse data or use empty defaults if failed
                const covenantData = covenantRes.ok ? await covenantRes.json() : null;
                const absData = absRes.ok ? await absRes.json() : null;
                const financeSumData = financeSumRes.ok ? await financeSumRes.json() : null;

                // Set data with fallbacks - your components should handle null/empty data
                setDataWithDescriptions(covenantData || []);
                setAbsStatistics(absData || []);
                setFinancialSummaryData(financeSumData || {})
            } catch (error) {
                console.error("Failed to fetch radar data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRadarData();
    }, [company.id]);

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


    return (
        <div className={styles.card}>
            <button onClick={() => onRemove(company.id)} className={styles.removeButton}>
                X
            </button>
            <div className={styles.ribbon}>
                <h1 className={styles.titleCompanySection}>{company.company_name}</h1>
            </div>
            {loading ? (
                <p>Loading chart...</p>
            ) : (
                <div>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Covenant Graph</h1>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarWithDescriptions}>
                            <PolarGrid/>
                            <PolarAngleAxis dataKey="category"/>
                            <PolarRadiusAxis domain={[0, 100]}/>
                            <Radar name={company.company_name} dataKey="value" stroke="#8884d8" fill="#8884d8"
                                   fillOpacity={0.6}/>
                            <Tooltip content={<CustomTooltip/>}/>
                        </RadarChart>
                    </ResponsiveContainer>
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>ABS Benchmark</h1>
                    </div>
                    <ResponsiveContainer width="100%" height={500}>
                        <BarChart
                            layout="vertical"
                            data={absStatistics}
                            className={styles.barChart}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`}/>
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={150}
                                tick={{fontSize: 16}}
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
                                labelStyle={{color: 'black', fontWeight: 'bold'}}
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
                                    const {x, y, width, height, payload} = props;
                                    const color = "#4CAF50"
                                    return <rect x={x} y={y} width={width} height={height} fill={color} rx={5}/>;
                                }}
                            >
                                <LabelList dataKey="calculatedValue" position="right"
                                           formatter={(val: any) => `${val}%`}/>
                            </Bar>
                            <Bar
                                dataKey="benchmarkValue"
                                barSize={20}
                                shape={(props: any) => {
                                    const {x, y, width, height, payload} = props;
                                    const color = "#fdb523"
                                    return <rect x={x} y={y} width={width} height={height} fill={color} rx={5}/>;
                                }}
                            >
                                <LabelList dataKey="benchmarkValue" position="right"
                                           formatter={(val: any) => `${val}%`}/>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
