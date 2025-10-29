const Country = require('../models/Country');
const { fetchCountries, fetchExchangeRates } = require('../services/externalApi');
const { generateSummaryImage } = require('../services/imageGenerator');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { Op } = require('sequelize');

const getRandomMultiplier = () => 1000 + Math.random() * 1000;

const refreshCountries = async (req, res) => {
  let countriesData, exchangeRates;
  try {
    [countriesData, exchangeRates] = await Promise.all([
      fetchCountries(),
      fetchExchangeRates()
    ]);
  } catch (err) {
    const api = err.config?.url.includes('restcountries') ? 'Countries API' : 'Exchange API';
    return res.status(503).json({
      error: 'External data source unavailable',
      details: `Could not fetch data from ${api}`
    });
  }

  const timestamp = new Date();
  const ops = [];

  for (const c of countriesData) {
    const currency = c.currencies && c.currencies[0];
    const currencyCode = currency ? currency.code : null;
    const exchangeRate = currencyCode && exchangeRates[currencyCode] ? exchangeRates[currencyCode] : null;

    let estimated_gdp = 0;
    if (c.population && exchangeRate) {
      const multiplier = getRandomMultiplier();
      estimated_gdp = (c.population * multiplier) / exchangeRate;
    } else if (!exchangeRate) {
      estimated_gdp = null;
    }

    const data = {
      name: c.name,
      capital: c.capital || null,
      region: c.region || null,
      population: c.population,
      currency_code: currencyCode,
      exchange_rate: exchangeRate,
      estimated_gdp,
      flag_url: c.flag || null,
      last_refreshed_at: timestamp
    };

    ops.push(
      Country.upsert(data, { conflict: ['name'] })
    );
  }

  try {
    await Promise.all(ops);
    const countries = await Country.findAll({ order: [['estimated_gdp', 'DESC']] });
    await generateSummaryImage(countries, countries.length, timestamp);
    res.json({ message: 'Countries refreshed successfully', total: countries.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCountries = async (req, res) => {
  const { region, currency, sort } = req.query;
  let order = [];
  if (sort === 'gdp_desc') order = [['estimated_gdp', 'DESC']];
  else if (sort === 'gdp_asc') order = [['estimated_gdp', 'ASC']];

  const where = {};
  if (region) where.region = region;
  if (currency) where.currency_code = currency;

  try {
    const countries = await Country.findAll({ where, order });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCountryByName = async (req, res) => {
  const { name } = req.params;
  try {
    const country = await Country.findOne({ where: { name: { [Op.like]: name } } });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json(country);
  } catch (err) {
    console.error('GET /countries/:name ERROR:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCountry = async (req, res) => {
  const { name } = req.params;
  try {
    const deleted = await Country.destroy({ where: { name: { [Op.like]: name } } });
    if (!deleted) return res.status(404).json({ error: 'Country not found' });
    res.status(204).end()
  } catch (err) {
    console.error('DELETE /countries/:name ERROR:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getStatus = async (req, res) => {
  try {
    const total = await Country.count();
    const latest = await Country.findOne({ order: [['last_refreshed_at', 'DESC']] });
    res.json({
      total_countries: total,
      last_refreshed_at: latest ? latest.last_refreshed_at : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSummaryImage = (req, res) => {
  const filePath = path.resolve(process.cwd(), 'cache', 'summary.png');

  console.log('[IMAGE] Requested');
  console.log('[IMAGE] File path:', filePath);
  console.log('[IMAGE] File exists?', fs.existsSync(filePath));

  if (!fs.existsSync(filePath)) {
    console.log('[IMAGE] 404 - File not found');
    return res.status(404).json({ error: 'Summary image not found' });
  }

  res.setHeader('Content-Type', 'image/png');

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('[IMAGE] sendFile FAILED:', err.message);  // ← CRITICAL
      console.error('[IMAGE] Error stack:', err.stack);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to send image' });
      }
    } else {
      console.log('[IMAGE] Image sent successfully');
    }
  });
};

module.exports = {
  refreshCountries,
  getAllCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getSummaryImage
};