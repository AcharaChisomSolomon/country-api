const Jimp = require('jimp');
const path = require('path');
const moment = require('moment');

async function generateSummaryImage(countries, total, timestamp) {
  const top5 = countries
    .sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0))
    .slice(0, 5);

  const image = new Jimp(800, 600, '#f8f9fa');
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

  let y = 40;
  image.print(font, 50, y, `Total Countries: ${total}`);
  y += 60;
  image.print(font, 50, y, `Last Refresh: ${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')} UTC`);
  y += 80;
  image.print(font, 50, y, 'Top 5 by Estimated GDP:');
  y += 50;

  for (const country of top5) {
    const gdp = country.estimated_gdp ? country.estimated_gdp.toFixed(2) : 'N/A';
    image.print(fontSmall, 70, y, `${country.name}: $${gdp}`);
    y += 35;
  }

  const filePath = path.join(process.cwd(), 'cache', 'summary.png');
  await image.writeAsync(filePath);
}

module.exports = { generateSummaryImage };