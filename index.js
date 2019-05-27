/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const fs = require('fs-extra');
const path = require('path');
const kgPath = path.resolve('.', 'kg');
const websitePath = path.resolve('.', 'website');
const csvPath = path.resolve(kgPath, 'csv');
const downloadGithub = require('download-git-repo');
const parseAuthor = require('parse-author');

function generate(answers, directory) {
  console.log('\nDownloading required files...');

  downloadGithub('kgb-workshop/sad-generator', directory, function (err) {
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
  });
}

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

module.exports = generate;
