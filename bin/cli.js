#!/usr/bin/env node

/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const kgPath = path.resolve('.', 'kg');
const validator = require('validator');
const generate = require('../index');

console.log(fs.readFileSync(path.resolve(__dirname, '../intro.txt'), 'utf-8'));

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Event name',
      default: 'My Acadamic Event'
    },
    {
      type: 'input',
      name: 'baseurl',
      message: 'Base URL',
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
        return (validator.isEmail(data) || data === '')? true : 'Please provide a valid email or leave empty.';
      }
    },
    {
      type: 'input',
      name: 'startdate',
      message: 'Start date'
    },
    {
      type: 'input',
      name: 'enddate',
      message: 'End date'
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
    }
  ])
  .then((answers) => {
    generate(answers, process.cwd());
  });
