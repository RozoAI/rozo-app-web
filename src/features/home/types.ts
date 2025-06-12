// Types for the home feature
export type QuickAmount = {
  value: string;
  label: string;
};

// Currency configuration by currency code
export type CurrencyConfig = {
  code: string;
  symbol: string;
  decimalSeparator: string;
  thousandSeparator: string;
  quickAmounts: QuickAmount[];
};

// Dynamic style types
export type DynamicStyles = {
  fontSize: {
    amount: string;
    label: string;
    quickAmount: string;
    modalTitle: string;
    modalAmount: string;
  };
  spacing: {
    cardPadding: string;
    quickAmountGap: string;
    containerMargin: string;
  };
  size: {
    quickAmountMinWidth: string;
    tapCardImage: string;
    buttonSize: string;
  };
  numpad: {
    height: number;
    fontSize: number;
    margin: number;
  };
};
