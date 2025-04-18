
export const formatDate = (date: Date | string): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateRemainingBalance = (totalAmount: number, paidAmount: number): number => {
  return totalAmount - paidAmount;
};

export const calculateRemainingQuantity = (totalQuantity: number, deliveredQuantity: number): number => {
  return totalQuantity - deliveredQuantity;
};

export const getDeliveryPercentage = (totalQuantity: number, deliveredQuantity: number): number => {
  if (totalQuantity === 0) return 0;
  return Math.round((deliveredQuantity / totalQuantity) * 100);
};

export const getPaymentPercentage = (totalAmount: number, paidAmount: number): number => {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 100);
};
