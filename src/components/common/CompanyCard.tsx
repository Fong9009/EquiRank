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

    const formatTooltip = (value: number, name: string) => {
        return [formatWithUnits(value), name];
    };

    const formatYAxis = (value: number) => {
        return formatWithUnits(value);
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
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Total Assets</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="totalAssets"
                                    fill="#297bae"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#297bae"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Total Liabilities</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="totalLiabilities"
                                    fill="#d79656"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#d79656"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Equity of Company</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="equity"
                                    fill="#4CAF50"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#45a049"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Gross Profit</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="grossProfit"
                                    fill="#FFD700"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#FFD700"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>EBITDA</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="ebitda"
                                    fill="#8329ae"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#8329ae"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Profit/Loss</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="profitLoss"
                                    fill="#B5D99C"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#B5D99C"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Other Expenses</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="otherExpenses"
                                    fill="#03f0fc"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#03f0fc"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                    <hr className="divider"/>
                    <div className={styles.ribbon}>
                        <h1 className={styles.titleSection}>Depreciation</h1>
                    </div>
                    {Array.isArray(financialSummaryData) && financialSummaryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={financialSummaryData}
                                margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
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
                                    dataKey="depreciation"
                                    fill="#F46036"
                                    radius={[4, 4, 0, 0]}
                                    stroke="#F46036"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.errorContainer}>
                            <p className={styles.errorText}>Data not available</p>
                        </div>
                    )}
                </div>
            )}
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