'use strict';
const http = require('http');
const inquirer = require("inquirer");
const moneyConvert = require('./money_convert');
const currencies = require('./currencies');
const chalk = require("chalk");

const openexchangeratesId = 'de4bcff847e949ebaf3c91a0c7c91be5';

const loader = {
  show: () => {
    const loader = [
      '/ Calculating',
      '| Calculating',
      '\\ Calculating',
      '- Calculating'
    ];
    let i = 4;
    this.ui = new inquirer.ui.BottomBar({
      bottomBar: loader[i % 4]
    });
    this.timer = setInterval(() => {
      this.ui.updateBottomBar(loader[++i % 4]);
    }, 300);
  },
  close: () => {
    clearInterval(this.timer);
    this.ui.updateBottomBar('');
    this.ui.close();
  }
};

module.exports = (answers) => {
  const number = answers.number;
  const base = answers.base;
  const convert = answers.convert;

  loader.show();
  const req = http.get(`http://openexchangerates.org/api/latest.json?app_id=${openexchangeratesId}`, (res) => {
    res.setEncoding('utf8');
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      loader.close();
      const parsed = JSON.parse(body);
      const convertOptions = {
        from: base,
        to: convert,
        rates: parsed.rates
      };
      if (parsed.error) {
        console.error(parsed);
        process.exit(1);
      }
      const convertedVal = moneyConvert(number, convertOptions);
      const unitBase = moneyConvert(1, convertOptions);
      const unitConvert = moneyConvert(1, {
        from: convert,
        to: base,
        rates: parsed.rates
      });
      const apiTime = new Date(parsed.timestamp * 1000).toLocaleString();
      console.log(`${number} ${chalk.cyan(base)} = ${convertedVal} ${chalk.cyan(convert)}`);
      console.log(`${currencies[base]} ↔ ${currencies[convert]}`);
      console.log(`1 ${chalk.cyan(base)} = ${unitBase} ${chalk.cyan(convert)}    1 ${chalk.cyan(convert)} = ${unitConvert} ${chalk.cyan(base)}`);
      console.log(`Api update time: ${apiTime}`);
    });
  });
  req.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
};
