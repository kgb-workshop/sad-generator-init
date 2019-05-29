/**
 * author: Pieter Heyvaert (pheyvaer.heyvaert@ugent.be)
 * Ghent University - imec - IDLab
 */

const fs = require('fs-extra');
const path = require('path');
const assert = require('assert');
const generate = require('../index');

it('Basic test', async function() {
  this.timeout(10000);

  const actualPath = path.resolve(__dirname, 'actualoutput');
  const expectedPath = path.resolve(__dirname, 'expectedoutput');

  fs.ensureDirSync(actualPath);

  await generate({
    name: 'New Unicorn Event',
    baseurl: 'https//uni.corn/',
    organizers: 'John Doe <john@doe.com> (http://johndoe.com), Jane Doe <jane@doe.com>',
    topics: 'Semantic Web, Knowledge Graphs',
    email: 'info@uni.corn',
    startdate: '2019-05-27',
    enddate: '2019-05-29',
    twitter: 'uni_corn',
    location: 'London',
    superevent: ''
  }, actualPath);

  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'csv', 'general-info.csv'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'general-info.csv'), 'utf-8').replace(/\n$/, ''));
  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'csv', 'important-dates.csv'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'important-dates.csv'), 'utf-8'));
  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'csv', 'organizers.csv'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'organizers.csv'), 'utf-8'));
  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'csv', 'pc.csv'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'pc.csv'), 'utf-8').replace(/\r\n$/, ''));
  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'csv', 'subtopics.csv'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'subtopics.csv'), 'utf-8'));
  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'csv', 'topics.csv'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'topics.csv'), 'utf-8'));
  assert.deepStrictEqual(fs.readFileSync(path.resolve(actualPath, 'kg', 'mapping.yml'), 'utf-8'), fs.readFileSync(path.resolve(expectedPath, 'mapping.yml'), 'utf-8'));

  fs.removeSync(actualPath);
});
