#!/usr/bin/env node

/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const validator = require('validator');
const generate = require('../index');

if (process.argv.length > 2 && (process.argv[2] === '-h' || process.argv[2] === '--help')) {
  console.log(fs.readFileSync(path.resolve(__dirname, '../help.txt'), 'utf-8'));
} else {
  console.log(fs.readFileSync(path.resolve(__dirname, '../intro.txt'), 'utf-8'));

  start();
}

async function start() {
  const answers = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name',
        default: 'My Acadamic Event'
      },
      {
        type: 'input',
        name: 'baseurl',
        message: 'KG\'s base URL',
        default: 'http://example.com/',
        validate: (data) => {
          return validator.isURL(data) ? true : 'Please provide a valid URL.';
        }
      },
      {
        type: 'input',
        name: 'organizers',
        message: 'Organizers (name <email> (website))'
      },
      {
        type: 'input',
        name: 'topics',
        message: 'Topics'
      },
      {
        type: 'input',
        name: 'twitter',
        message: 'Twitter'
      },
      {
        type: 'input',
        name: 'email',
        message: 'Email',
        validate: (data) => {
          return (validator.isEmail(data) || data === '') ? true : 'Please provide a valid email or leave empty.';
        }
      },
      {
        type: 'input',
        name: 'startdate',
        message: 'Start date'
      }
    ]);

  const answers2 = await inquirer.prompt([{
    type: 'input',
    name: 'enddate',
    message: 'End date',
    default: answers.startdate === '' ? undefined : answers.startdate
  },
  {
    type: 'input',
    name: 'location',
    message: 'Location'
  },
  {
    type: 'input',
    name: 'superevent',
    message: 'Super event'
  }]);

  generate(extend(answers, answers2), process.cwd());
}

function extend(obj, src) {
  Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
  return obj;
}
