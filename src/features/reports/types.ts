export type DateRange = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
};

export type GroupBy = 'day' | 'week' | 'month';

export type DailyTrend = {
  date: string;
  orders_count: number;
  usd_amount: number;
  display_amounts: Record<string, number>;
};

export type CurrencyBreakdownType = {
  currency: string;
  amount: number;
  percentage: number;
};

export type OrderVolume = {
  date: string;
  count: number;
};

export type ReportsSummary = {
  merchant_id: string;
  date_range: DateRange;
  summary: {
    total_completed_orders: number;
    total_required_amount_usd: number;
    total_display_amounts: Record<string, number>;
  };
  charts: {
    daily_trends: DailyTrend[];
    currency_breakdown: CurrencyBreakdownType[];
    order_volume: OrderVolume[];
  };
};

export type DateRangePreset = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
