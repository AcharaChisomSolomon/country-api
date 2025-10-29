const axios = require('axios');

const COUNTRIES_API = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_API = 'https://open.er-api.com/v6/latest/USD';

async function fetchCountries() {
  const res = await axios.get(COUNTRIES_API, { timeout: 10000 });
  return res.data;
}

async function fetchExchangeRates() {
  const res = await axios.get(EXCHANGE_API, { timeout: 10000 });
  if (!res.data.result === 'success') throw new Error('Exchange API failed');
  return res.data.rates;
}

module.exports = { fetchCountries, fetchExchangeRates };