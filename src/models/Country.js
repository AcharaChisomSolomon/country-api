const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Country = sequelize.define('Country', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  capital: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  population: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currency_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  exchange_rate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  estimated_gdp: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  flag_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  last_refreshed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  hooks: {
    beforeUpdate: (country) => {
      country.last_refreshed_at = new Date();
    }
  }
});

module.exports = Country;