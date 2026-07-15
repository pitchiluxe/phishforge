export interface DashboardStats {
    total_campaigns: number;
    active_campaigns: number;
    total_simulations: number;
    simulations_this_month: number;
    average_click_rate: number;
    average_report_rate: number;
    highest_risk_department?: string;
    improvement_rate: number;
}
export interface CampaignMetrics {
    campaign_id: string;
    campaign_name: string;
    total_targets: number;
    open_rate: number;
    click_rate: number;
    submission_rate: number;
    report_rate: number;
    risk_score: number;
}
export interface DepartmentRiskScore {
    department: string;
    employee_count: number;
    click_rate: number;
    risk_score: number;
    trend: 'improving' | 'worsening' | 'stable';
}
export interface TimeSeriesDataPoint {
    date: string;
    value: number;
    label?: string;
}
export interface AnalyticsSummary {
    period: '7d' | '30d' | '90d' | '365d';
    click_rate_trend: TimeSeriesDataPoint[];
    campaigns_launched: TimeSeriesDataPoint[];
    department_scores: DepartmentRiskScore[];
    top_risky_employees: {
        email: string;
        department?: string;
        click_count: number;
        risk_score: number;
    }[];
}
export interface ThreatIntelligence {
    id: string;
    title: string;
    description?: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    industries: string[];
    published_at?: string;
    is_active: boolean;
    created_at: string;
}
