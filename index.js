#!/usr/bin/env node

/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const kgPath = path.resolve('.', 'kg');
const websitePath = path.resolve('.', 'website');
const csvPath = path.resolve(kgPath, 'csv');
const downloadGithub = require('download-git-repo');
const parseAuthor = require('parse-author');
const validator = require('validator');

console.log(fs.readFileSync(path.resolve(__dirname, 'intro.txt'), 'utf-8'));

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
        return validator.isEmail(data) ? true : 'Please provide a valid email or leave empty.';
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
  .then(answers => {
    //console.log(answers);
    console.log('\nDownloading required files...');

    downloadGithub('kgb-workshop/sad-generator', process.cwd(), function (err) {
      //console.log(err ? 'Error' : 'Success');
      if (err) {
        console.error(err);
      } else {
        console.log('Download complete.');
        console.log('Updating CSV files...');
        writeGeneralInfo(answers);
        writeTopics(answers);
        writeOrganizers(answers);

        // create empty CSV files
        fs.writeFileSync(path.resolve(csvPath, 'important-dates.csv'), 'event,date,description');
        fs.writeFileSync(path.resolve(csvPath, 'important-dates.csv'), 'event,date,description');
        fs.writeFileSync(path.resolve(csvPath, 'subtopics.csv'), 'id,subtopic');

        // remove files
        fs.removeSync(path.resolve(kgPath, 'data.nt'));
        fs.removeSync(path.resolve(websitePath, 'docs'));

        console.log('Update complete.');
      }
    })
    //download('https://raw.githubusercontent.com/kgb-workshop/sad-generator/master/kg/mapping.yml', path.resolve(kgPath, 'mapping.yml'));
  });


function writeGeneralInfo(answers) {
  let csv = 'id,title,duration,startDate,endDate,location,superEvent,twitter,email\n';

  //id
  csv += answers.name.replace(/ /g, '-').toLowerCase() + ',';

  //rest
  csv += `${answers.name},,${answers.startdate},${answers.enddate},${answers.superevent},${answers.twitter},${answers.email}`;

  fs.writeFileSync(path.resolve(csvPath, 'general-info.csv'), csv);
}

function writeOrganizers(answers) {
  const organizers = answers.organizers.split(',');
  let csv = 'id,name,organization,email,photo,twitter,webpage,biography,role,linkedin\n';

  organizers.forEach(organizer => {
    if (organizer !== '') {
      organizer = parseAuthor(organizer);

      if (organizer.name) {
        csv += organizer.name.replace(/ /g, '-').toLowerCase() + ',';
        csv += `${organizer.name},,${organizer.email},,,${organizer.url},,,\n`;
      } else {
        console.error('An organizer should at least have a name.');
      }
    }
  });

  fs.writeFileSync(path.resolve(csvPath, 'organizers.csv'), csv);
}

function writeTopics(answers) {
  const topics = answers.topics.split(',');
  let csv = 'id,name\n';

  topics.forEach(topic => {
    topic = topic.trim();
    csv += topic.replace(/ /g, '-').toLowerCase() + ',' + topic + '\n';
  });

  fs.writeFileSync(path.resolve(csvPath, 'topics.csv'), csv);
}
