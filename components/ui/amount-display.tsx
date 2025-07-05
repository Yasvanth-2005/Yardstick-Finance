interface AmountDisplayProps {
  amount: number;
  className?: string;
}

export function AmountDisplay({ amount, className = "" }: AmountDisplayProps) {
  const formatAmount = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  return <span className={className}>{formatAmount(amount)}</span>;
}
