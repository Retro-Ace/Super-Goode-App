#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const defaultFile = path.join(cwd, 'src/data/seed/locations.json');
const [,, fileArg, compareArg] = process.argv;
const targetFile = fileArg ? path.resolve(cwd, fileArg) : defaultFile;
const compareFile = compareArg ? path.resolve(cwd, compareArg) : null;

const expectedKeys = [
  'name',
  'score',
  'subtitle',
  'address',
  'city',
  'state',
  'lat',
  'lng',
  'googlePlaceUrl',
  'directionsUrl',
  'reviewUrl',
  'sourceType',
  'confidence',
  'notes',
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeName(name) {
  return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

function validateEntry(entry, index, issues) {
  if (!isPlainObject(entry)) {
    issues.push(`Entry ${index}: expected an object.`);
    return;
  }

  for (const key of expectedKeys) {
    if (!(key in entry)) {
      issues.push(`Entry ${index}: missing required field "${key}".`);
    }
  }

  for (const key of Object.keys(entry)) {
    if (!expectedKeys.includes(key)) {
      issues.push(`Entry ${index}: unexpected field "${key}".`);
    }
  }

  if (typeof entry.name !== 'string' || !entry.name.trim()) {
    issues.push(`Entry ${index}: "name" must be a non-empty string.`);
  }

  if (typeof entry.score !== 'number' || !Number.isFinite(entry.score) || entry.score < 0 || entry.score > 10) {
    issues.push(`Entry ${index}: "score" must be a finite number between 0 and 10.`);
  }

  if (typeof entry.subtitle !== 'string') {
    issues.push(`Entry ${index}: "subtitle" must be a string.`);
  }

  if (typeof entry.address !== 'string') {
    issues.push(`Entry ${index}: "address" must be a string.`);
  }

  if (typeof entry.city !== 'string') {
    issues.push(`Entry ${index}: "city" must be a string.`);
  }

  if (typeof entry.state !== 'string') {
    issues.push(`Entry ${index}: "state" must be a string.`);
  }

  if (typeof entry.googlePlaceUrl !== 'string') {
    issues.push(`Entry ${index}: "googlePlaceUrl" must be a string.`);
  }

  if (typeof entry.lat !== 'number' || !Number.isFinite(entry.lat) || entry.lat < -90 || entry.lat > 90) {
    issues.push(`Entry ${index}: "lat" must be a finite latitude.`);
  }

  if (typeof entry.lng !== 'number' || !Number.isFinite(entry.lng) || entry.lng < -180 || entry.lng > 180) {
    issues.push(`Entry ${index}: "lng" must be a finite longitude.`);
  }

  if (typeof entry.directionsUrl !== 'string') {
    issues.push(`Entry ${index}: "directionsUrl" must be a string.`);
  }

  if (typeof entry.reviewUrl !== 'string' || !entry.reviewUrl.trim()) {
    issues.push(`Entry ${index}: "reviewUrl" must be a non-empty string.`);
  }

  if (typeof entry.sourceType !== 'string' || !entry.sourceType.trim()) {
    issues.push(`Entry ${index}: "sourceType" must be a non-empty string.`);
  }

  if (typeof entry.confidence !== 'string' || !entry.confidence.trim()) {
    issues.push(`Entry ${index}: "confidence" must be a non-empty string.`);
  }

  if (typeof entry.notes !== 'string') {
    issues.push(`Entry ${index}: "notes" must be a string.`);
  }
}

function summarize(data) {
  const scores = data.map((entry) => entry.score);
  const notesCount = data.filter((entry) => typeof entry.notes === 'string' && entry.notes.trim()).length;
  const lowConfidence = data.filter((entry) => entry.confidence === 'low').map((entry) => entry.name);
  const duplicateNames = data
    .map((entry) => normalizeName(entry.name))
    .filter((name, index, all) => all.indexOf(name) !== index);

  return {
    count: data.length,
    scoreMin: Math.min(...scores),
    scoreMax: Math.max(...scores),
    notesCount,
    lowConfidence,
    duplicateNameCount: duplicateNames.length,
  };
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

const issues = [];
const targetData = readJson(targetFile);

if (!Array.isArray(targetData)) {
  issues.push(`Target file ${targetFile} must contain a JSON array.`);
} else {
  targetData.forEach((entry, index) => validateEntry(entry, index, issues));

  const duplicateGroups = new Map();
  for (const entry of targetData) {
    if (!isPlainObject(entry) || typeof entry.name !== 'string') {
      continue;
    }

    const key = normalizeName(entry.name);
    const items = duplicateGroups.get(key) || [];
    items.push(entry.name);
    duplicateGroups.set(key, items);
  }

  for (const [name, items] of duplicateGroups) {
    if (items.length > 1) {
      issues.push(`Duplicate normalized name "${name}" appears ${items.length} times.`);
    }
  }
}

console.log(`Validated: ${path.relative(cwd, targetFile)}`);
if (Array.isArray(targetData)) {
  console.log(JSON.stringify(summarize(targetData), null, 2));
}

if (compareFile) {
  const compareData = readJson(compareFile);
  const compatible = Array.isArray(targetData) && Array.isArray(compareData);

  if (!compatible) {
    issues.push(`Comparison requires both files to contain JSON arrays.`);
  } else if (deepEqual(targetData, compareData)) {
    console.log(`Compare: identical to ${path.relative(cwd, compareFile)}`);
  } else {
    issues.push(`Compare file ${compareFile} does not match ${targetFile}.`);
    console.log(`Compare: differs from ${path.relative(cwd, compareFile)}`);
    console.log(`Target count: ${targetData.length}`);
    console.log(`Compare count: ${compareData.length}`);
  }
}

if (issues.length) {
  console.error('Validation issues:');
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log('Validation passed.');
}
