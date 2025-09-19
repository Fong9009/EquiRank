"use client";
import React, {useEffect, useState} from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    PieChart,
    Pie,
    Legend,
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
import styles from "@/styles/pages/lender/companyGraphPage.module.css";
import LoadingPage from "@/components/common/LoadingPage";
import { useRouter } from "next/navigation";

interface CompanyAnalysisProps {
    companyId: string;
}

interface CompanyProps {
    company_name: string;
}

export default function CompanyGraphPage({ companyId }: CompanyAnalysisProps){
    const [radarWithDescriptions, setDataWithDescriptions] = useState<any[]>([]);
    const [absStatistics, setAbsStatistics] = useState<any[]>([]);
    const [financialSummaryData, setFinancialSummaryData] =  useState<any>();
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedLiabilityYear, setSelectedLiabilityYear] = useState<string>('');
    const [companyName, setCompanyName] = useState<CompanyProps | null>(null);
    const router = useRouter();
    const COLORS = ['#4CAF50', '#2E7D32'];
    const LIAB_COLORS = ['#47ace3', '#2076b1'];

    const [isLoading, setIsLoading] = useState(true);

    //Used to Obtain the Covenant Statistics
    useEffect(() => {
        if (!companyId) return;


        const fetchAllData = async () => {
            if (isNaN(Number(companyId))) {
                router.replace("/404");
                return;
            }

            const checkRes = await fetch(`/api/security/company-check/${companyId}`)
            const data = await checkRes.json();
            if (!data) {
                router.replace("/404");
                return;
            }
            setIsLoading(true);
            try {
                const [nameRes, covenantRes, absRes, financeSumRes] = await Promise.all([
                    fetch(`/api/company-statistics/company-details/${companyId}`),
                    fetch(`/api/company-statistics/company-covenant-graph/${companyId}`),
                    fetch(`/api/company-statistics/company-abs-graph/${companyId}`),
                    fetch(`/api/company-statistics/company-financial-summary/${companyId}`),
                ]);

                // Parse data or use empty defaults if failed
                const nameData = nameRes.ok ? await  nameRes.json() : null;
                const covenantData = covenantRes.ok ? await covenantRes.json() : null;
                const absData = absRes.ok ? await absRes.json() : null;
                const financeSumData = financeSumRes.ok ? await financeSumRes.json() : null;

                // Set data with fallbacks - your components should handle null/empty data
                setCompanyName(nameData || "");
                setDataWithDescriptions(covenantData || []);
                setAbsStatistics(absData || []);
                setFinancialSummaryData(financeSumData || {})
            } catch (err) {
                console.error("Data fetching error:", err);
                // Handle error state appropriately
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [companyId]);

    useEffect(() => {
        if (financialSummaryData && financialSummaryData.length > 0) {
            setSelectedYear(financialSummaryData[2].year);
            setSelectedLiabilityYear(financialSummaryData[2].year);
        }
    }, [financialSummaryData]);

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

    //Pie Chart Functions (Assets Pie)
    const getDataForYear = (year: string): any => {
        return Array.isArray(financialSummaryData)
            ? financialSummaryData.find((item: { year: string; }) => item.year === year)
            : null;
    };

    const formatDataForChart = (year: string) => {
        const data = getDataForYear(year);
        if (!data) return [];

        return [
            {
                name: 'Current Assets',
                value: data.currentAssets,
                displayValue: data.currentAssetDisplay
            },
            {
                name: 'Non-Current Assets',
                value: data.nonCurrentAssets,
                displayValue: data.nonCurrentAssetDisplay
            }
        ];
    };

    const renderLabel = (entry: any) => {
        const chartData = formatDataForChart(selectedYear);
        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((entry.value / total) * 100).toFixed(1);
        return `${percentage}%`;
    };

    const PieCustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const chartData = formatDataForChart(selectedYear);
            const total = chartData.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((data.value / total) * 100).toFixed(1);

            return (
                <div className="tooltip">
                    <strong>{data.payload.name}</strong>
                    <p>{data.payload.displayValue}</p>
                    <p>{percentage}% of total assets</p>
                </div>
            );
        }
        return null;
    }

    //Pie Chart Functions (Liabilities Pie)
    const formatDataForLiabilityChart = (year: string) => {
        const data = getDataForYear(year);
        if (!data) return [];

        return [
            {
                name: 'Current Liabilities',
                value: data.currentLiabilities,
                displayValue: data.currentLiabilitiesDisplay,
            },
            {
                name: 'Non-Current Liabilities',
                value: data.nonCurrentLiabilities,
                displayValue: data.nonCurrentLiabilitiesDisplay
            }
        ];
    };

    const renderLiabilityLabel = (entry: any) => {
        const chartData = formatDataForLiabilityChart(selectedYear);
        const total = chartData.reduce((sum, item) => sum + item.value, 0);
        const percentage = ((entry.value / total) * 100).toFixed(1);
        return `${percentage}%`;
    };

    const LiabilityPieCustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const chartData = formatDataForLiabilityChart(selectedYear);
            const total = chartData.reduce((sum, item) => sum + item.value, 0);
            const percentage = ((data.value / total) * 100).toFixed(1);

            return (
                <div className="tooltip">
                    <strong>{data.payload.name}</strong>
                    <p>{data.payload.displayValue}</p>
                    <p>{percentage}% of total Liabilities</p>
                </div>
            );
        }
        return null;
    }

    //END OF PIE FUNCTIONS


    const formatTooltip = (value: number, name: string) => {
        return [formatWithUnits(value), name];
    };

    const formatYAxis = (value: number) => {
        return formatWithUnits(value);
    };

    if (isLoading) {
        return <LoadingPage />;
    }

    return(
        <div>
            <div className={styles.titleRibbon}>
                <h1 className={styles.titleSection}>
                    {companyName && companyName.company_name
                        ? `Company Analysis Of: ${companyName.company_name}`
                        : "Company Analysis"}
                </h1>

            </div>
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
                <h1 className={styles.titleSection}>Financial Summary Past 3 Years</h1>
            </div>

            {/*The Financial Summary Section*/}
            <div className={styles.graphRow}>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Total Assets</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                Total Assets represent the sum of all assets owned by the company,
                                including current assets (cash, inventory, receivables) and
                                non-current assets (property, equipment, investments).
                            </div>
                        </div>
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
                </div>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Total Liabilities</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                Total Liabilities are what the business owes to outsiders such as banks, suppliers
                                ,lenders or anyone it needs to pay back. There are current(Due within 12 months)
                                and non current liabilities(Long term debts due after 12 months).
                            </div>
                        </div>
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
                </div>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Equity of Company</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                This is the owners claim on the business after all debts are paid off
                                Equity = Assets = Liabilities, it is the net worth of the company and shows
                            </div>
                        </div>
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
                </div>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Gross Profit</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                This is the profit a company makes after removing the direct costs of producing
                                and selling the goods or services it has. It is to demonstrate efficiency of the companies
                                production.
                            </div>
                        </div>
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
                </div>
            </div>
            <div className={styles.graphRow}>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>EBITDA</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                This is earnings before interest, taxes, depreciation and Amotisation, It is the companies
                                Operating performance from it's core operations without being affected by other values
                            </div>
                        </div>
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
                </div>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Profit/Loss</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                This is the final result after subtracting all expenses from the company revenue
                            </div>
                        </div>
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
                </div>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Other Expenses</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                These are costs that a company incurs that are not included in the cost of Goods Sold or
                                The interest/ depreciation they only cover the operating and administrative costs that the
                                Business needs to run.
                            </div>
                        </div>
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
                </div>
                <div className={styles.barContainer}>
                    <div className={styles.titleContainer}>
                        <h1 className={styles.titleText}>Depreciation</h1>
                        <div className={styles.tooltipWrapper}>
                            <span className={styles.questionMark}>?</span>
                            <div className={styles.tooltip}>
                                The cost of a long term asset like machinery over time in it's useful life, Instead of
                                recording the full purchase it allows a business to expense a portion each year.
                            </div>
                        </div>
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
            </div>

            <div className={styles.ribbon}>
                <h1 className={styles.titleSection}>Asset and Liability Make Up</h1>
            </div>
            <div className={styles.graphRow}>
                <div className={styles.pieContainer}>
                    <h1 className={styles.titleText}>Assets Breakdown - {selectedYear}</h1>
                    <div>
                        {Array.isArray(financialSummaryData) && financialSummaryData.map((item: any) => (
                            <button
                                key={item.year}
                                className={styles.tab}
                                onClick={() => setSelectedYear(item.year)}
                            >
                                {item.year}
                            </button>
                        ))}
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={formatDataForChart(selectedYear)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderLabel}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {formatDataForChart(selectedYear).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PieCustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value, entry) => `${value}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary cards */}
                    <div className={styles.summaryCards}>
                        {formatDataForChart(selectedYear).map((item) => (
                            <div key={item.name} className={`${styles.summaryCard} ${styles.current}`}>
                                <h3>{item.name}</h3>
                                <p className={styles.amount}>{item.displayValue}</p>
                            </div>
                        ))}
                        <div className={`${styles.summaryCard} ${styles.total}`}>
                            <h3>Total Assets</h3>
                            <p className={styles.amount}>
                                {getDataForYear(selectedYear)?.totalAssetsDisplay || '-'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles.pieContainer}>
                    <h1 className={styles.titleText}>Liabilities Breakdown - {selectedLiabilityYear}</h1>
                    <div>
                        {Array.isArray(financialSummaryData) && financialSummaryData.map((item: any) => (
                            <button
                                key={item.year}
                                className={styles.tabLiability}
                                onClick={() => setSelectedLiabilityYear(item.year)}
                            >
                                {item.year}
                            </button>
                        ))}
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={formatDataForLiabilityChart(selectedLiabilityYear)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderLiabilityLabel}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {formatDataForLiabilityChart(selectedLiabilityYear).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={LIAB_COLORS[index % LIAB_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<LiabilityPieCustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value, entry) => `${value}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary cards */}
                    <div className={styles.summaryCards}>
                        {formatDataForLiabilityChart(selectedLiabilityYear).map((item) => (
                            <div key={item.name} className={`${styles.summaryCard} ${styles.current}`}>
                                <h3>{item.name}</h3>
                                <p className={styles.amount}>{item.displayValue}</p>
                            </div>
                        ))}
                        <div className={`${styles.summaryCard} ${styles.total}`}>
                            <h3>Total Liabilities</h3>
                            <p className={styles.amount}>
                                {getDataForYear(selectedLiabilityYear)?.totalAssetsDisplay || '-'}
                            </p>
                        </div>
                    </div>
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
