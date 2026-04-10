export async function fetchExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    return {
      usdToJpy: data.rates.JPY,
      usdToshs: data.rates.KES,
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}
