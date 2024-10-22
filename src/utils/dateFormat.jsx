export const dateFormat = (date) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const year = dateObj.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
};
export const CurrencyFormatter = ({ amount, locale = 'en-US', currency = 'USD' }) => {
  const floatAmount = parseFloat(amount);
  if (isNaN(floatAmount)) {
    return <span>Invalid amount</span>;
  }
  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(floatAmount);

  return <span>{formattedAmount}</span>;
};

