/**
 * Indian Rupee Number Formatter (e.g., ₹8,50,000)
 */
export const formatRupee = (amount: number, compact: boolean = false): string => {
  if (isNaN(amount) || amount === null) return '₹0';
  
  if (compact) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} Lakh`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }

  // Standard Indian Currency Format regex
  const parts = amount.toFixed(0).toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `₹${formatted}`;
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatPercent = (val: number): string => {
  return `${val.toFixed(1)}%`;
};
