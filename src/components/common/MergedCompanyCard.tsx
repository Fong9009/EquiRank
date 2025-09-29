import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
    Legend,
    BarChart, CartesianGrid, XAxis, YAxis, Bar
} from "recharts";
import styles from "@/styles/components/mergedCompanyCard.module.css";

interface Company {
    id: number;
    company_name: string;
}

interface MergedCompanyCardProps {
    companies: Company[];
    onUnmerge: () => void;
}

interface CompanyData {
    covenantData: any[] | null;
    absData: any[] | null;
    financialSummaryData: any | null;
}

interface CompanyDataWithName {
    id: number;
    name: string;
    data: CompanyData;
}

interface CovenantMetric {
    category: string;
    value: number;
    description: string;
    color: string;
}

interface CompanyRadarData {
    id: number;
    name: string;
    data: {
        covenantData: CovenantMetric[];
        absData: any[];
        financialSummaryData: any;
    };
}

interface RadarRow {
    category: string;
    [key: string]: string | number;
}

//Financial Summary Data Interface
interface FinancialSummary {
    year: string;
    totalAssets: number;
    [key: string]: any;
}

export default function MergedCompanyCard({ companies, onUnmerge }: MergedCompanyCardProps) {
    const [companyData, setCompanyData] = useState<Record<number, CompanyDataWithName>>({});
    const [radarData, setRadarData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mergedFinancialData, setMergedFinancialData] = useState<Record<string, any[]>>({});
    const metrics = [
        "totalAssets",
        "totalLiabilities",
        "equity",
        "grossProfit",
        "ebitda",
        "profitLoss",
        "otherExpenses",
        "depreciation",
    ];


    useEffect(() => {
        const fetchCompanyData = async () => {
            setLoading(true);
            setError(null);

            try {
                const dataPromises = companies.map(async (company) => {
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

                        return {
                            id: company.id,
                            name: company.company_name,
                            data: {
                                covenantData: covenantData || [],
                                absData: absData || [],
                                financialSummaryData: financeSumData || [] // Keep as array based on your CompanyCard
                            }
                        };
                    } catch (companyError) {
                        console.error(`Failed to fetch data for ${company.company_name}:`, companyError);
                        return {
                            id: company.id,
                            name: company.company_name,
                            data: {
                                covenantData: [],
                                absData: [],
                                financialSummaryData: [] // Keep as array
                            }
                        };
                    }
                });

                const results = await Promise.all(dataPromises);
                const dataMap: Record<number, CompanyDataWithName> = {};

                results.forEach(({ id, name, data }) => {
                    dataMap[id] = { id, name, data };
                });

                console.log('Merged company data:', dataMap);

                setCompanyData(dataMap);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch company data');
            } finally {
                setLoading(false);
            }
        };

        if (companies.length > 0) {
            fetchCompanyData();
        }
    }, [companies]);

    useEffect(() => {
        if (Object.keys(companyData).length === 0) return;

        const companies: CompanyRadarData[] = Object.values(companyData) as CompanyRadarData[];

        const categories: string[] = companies[0].data.covenantData.map(
            (item: CovenantMetric) => item.category
        );

        //Form Radar Data
        const newRadarData: RadarRow[] = categories.map((category: string) => {
            const row: RadarRow = { category };
            companies.forEach((company: CompanyRadarData) => {
                const metric = company.data.covenantData.find(
                    (c: CovenantMetric) => c.category === category
                );
                row[company.name] = metric?.value ?? 0;
                row[`${company.name}_description`] = metric?.description ?? "";
            });

            return row;
        });
        setRadarData(newRadarData);
    }, [companyData]);

    //Used for Bar Chart
    useEffect(() => {
        if (!companyData || Object.keys(companyData).length === 0) {
            setMergedFinancialData({});
            return;
        }

        const companies = Object.values(companyData);

        if (companies.length === 0) {
            setMergedFinancialData({});
            return;
        }

        const result: Record<string, any[]> = {};

        metrics.forEach((metric) => {
            const mergedData: any[] = [];
            const years = companies[0].data.financialSummaryData.map((item: any) => item.year);

            years.forEach((year: string) => {
                const row: any = { year };

                companies.forEach((company: any) => {
                    const item = company.data.financialSummaryData.find((f: any) => f.year === year);
                    row[company.name] = item?.[metric] ?? 0;
                });

                mergedData.push(row);
            });

            result[metric] = mergedData;
        });

        console.log("Merged financial data per metric", result);
        setMergedFinancialData(result);
    }, [companyData]);




    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const { category } = payload[0].payload;

            return (
                <div className={styles.customTooltip}>
                    <p className={styles.tooltipLabel}>{category}</p>
                    {payload.map((entry: any, index: number) => {
                        const description = entry.payload[`${entry.name}_description`];
                        return (
                            <div key={index} style={{ color: entry.color }}>
                                <p>{`${entry.name}: ${entry.value}`}</p>
                                <p className={styles.tooltipDescription}>{description}</p>
                            </div>
                        );
                    })}
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

    const formatMetricName = (metric: string) => {
        return metric
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    return (
        <div>
            <div className={styles.ribbon}>
                <h3 className={styles.title}>
                    {companies.map(c => c.company_name).join(' vs ')}
                </h3>
            </div>

            <div className={styles.ribbon}>
                <h1 className={styles.titleSection}>Covenant Graph</h1>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 100]} />

                    {Object.values(companyData).map((company, idx) => (
                        <Radar
                            key={company.id}
                            name={company.name}
                            dataKey={company.name}
                            stroke={["#8884d8", "#82ca9d", "#ffc658"][idx % 3]}
                            fill={["#8884d8", "#82ca9d", "#ffc658"][idx % 3]}
                            fillOpacity={0.6}
                        />
                    ))}

                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
            {metrics.map((metric, idx) => (
                <div key={metric}>
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>{formatMetricName(metric)} Between {companies.map(c => c.company_name).join(' And ')}</h1>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={mergedFinancialData[metric]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={{ stroke: '#e0e0e0' }} />
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
                            {companies.map((company, idx2) => (
                                <Bar
                                    key={company.id}
                                    dataKey={company.company_name}
                                    fill={["#297bae", "#82ca9d", "#ffc658"][idx2 % 3]}
                                    radius={[4, 4, 0, 0]}
                                    stroke={["#297bae", "#82ca9d", "#ffc658"][idx2 % 3]}
                                    strokeWidth={1}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ))}

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