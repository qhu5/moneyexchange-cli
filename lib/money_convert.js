module.exports = (number, options) => {
  const rates = options.rates;
  const exchangeRate = 1 / rates[options.from] * rates[options.to];

  return number * exchangeRate;
};
