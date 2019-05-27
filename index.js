/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const fs = require('fs-extra');
const path = require('path');
const downloadGithub = require('download-git-repo');
const parseAuthor = require('parse-author');
const replaceInFile = require('replace');
const yarrrml2rml = require('@rmlio/yarrrml-parser/lib/yarrrml2rml');
const N3 = require('n3');
const namespaces = require('prefix-ns').asMap();

namespaces.ql = 'http://semweb.mmlab.be/ns/ql#';
namespaces.fnml = 'http://semweb.mmlab.be/ns/fnml#';
namespaces.fno = 'http://w3id.org/function/ontology#';
namespaces.ql = 'http://semweb.mmlab.be/ns/ql#';

let csvPath;

function generate(answers, directory) {
  const kgPath = path.resolve(directory, 'kg');
  const websitePath = path.resolve(directory, 'website');
  csvPath = path.resolve(kgPath, 'csv');

  return new Promise( (resolve, reject) => {
    console.log('\nDownloading required files...');

    downloadGithub('kgb-workshop/sad-generator', directory, function (err) {
      //console.log(err ? 'Error' : 'Success');
      if (err) {
        console.error(err);
        reject(err);
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

        // update YARRRML and RML rules
        replaceBaseURLRules(path.resolve(kgPath, 'mapping.yml'), path.resolve(kgPath, 'mapping.rml.ttl'), answers.baseurl);

        // remove files
        fs.removeSync(path.resolve(kgPath, 'data.nt'));
        fs.removeSync(path.resolve(websitePath, 'docs'));

        console.log('Update complete.');
        resolve();
      }
    });
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

        if (!organizer.email) {
          organizer.email = ''
        }

        if (!organizer.url) {
          organizer.url = ''
        }

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

function replaceBaseURLRules(yarrrmlFilePath, rmlFilePath, baseURL) {
  return new Promise((resolve, reject) => {
    replaceInFile({
      regex: "http://example.com/resources/",
      replacement: baseURL,
      paths: [yarrrmlFilePath],
      recursive: false,
      silent: true,
    });

    const yaml = fs.readFileSync(yarrrmlFilePath, 'utf-8');
    const y2r = new yarrrml2rml();
    const quads = y2r.convert(yaml);
    const writer = new N3.Writer({
      prefixes: {
        rr: namespaces.rr,
        rdf: namespaces.rdf,
        rdfs: namespaces.rdfs,
        fnml: namespaces.fnml,
        fno: namespaces.fno,
        rml: namespaces.rml,
        ql: namespaces.ql
      }
    });

    writer.addQuads(quads);
    writer.end((error, result) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        fs.writeFileSync(rmlFilePath, result);
        resolve();
      }
    });
  });
}

module.exports = generate;
