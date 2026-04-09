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

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getRequiredString(value) {
  const normalized = getTrimmedString(value);
  return normalized.length > 0 ? normalized : null;
}

function getFiniteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getCoordinateValue(value) {
  if (value === null || value === undefined) {
    return {
      value: null,
      isValid: true,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      value: null,
      isValid: true,
    };
  }

  const parsed = getFiniteNumber(value);

  return {
    value: parsed,
    isValid: parsed !== null,
  };
}

function normalizeEntry(value) {
  if (!isPlainObject(value)) {
    return null;
  }

  const name = getRequiredString(value.name);
  const city = getRequiredString(value.city);
  const state = getRequiredString(value.state);
  const reviewUrl = getRequiredString(value.reviewUrl);
  const score = getFiniteNumber(value.score);
  const latResult = getCoordinateValue(value.lat);
  const lngResult = getCoordinateValue(value.lng);
  const lat = latResult.value;
  const lng = lngResult.value;

  if (!name || !city || !state || !reviewUrl || score === null || !latResult.isValid || !lngResult.isValid) {
    return null;
  }

  const hasLat = lat !== null;
  const hasLng = lng !== null;

  if (hasLat !== hasLng) {
    return null;
  }

  if (
    score < 0 ||
    score > 10 ||
    (lat !== null && (lat < -90 || lat > 90)) ||
    (lng !== null && (lng < -180 || lng > 180))
  ) {
    return null;
  }

  return {
    name,
    score,
    subtitle: getTrimmedString(value.subtitle),
    address: getTrimmedString(value.address),
    city,
    state,
    lat,
    lng,
    googlePlaceUrl: getTrimmedString(value.googlePlaceUrl),
    directionsUrl: getTrimmedString(value.directionsUrl),
    reviewUrl,
    sourceType: getRequiredString(value.sourceType) ?? 'unknown',
    confidence: getRequiredString(value.confidence) ?? 'medium',
    notes: getTrimmedString(value.notes),
  };
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

  const lat = entry.lat;
  const lng = entry.lng;
  const hasLat = typeof lat === 'number' && Number.isFinite(lat);
  const hasLng = typeof lng === 'number' && Number.isFinite(lng);
  const missingLat = lat === null;
  const missingLng = lng === null;

  if (!(hasLat || missingLat)) {
    issues.push(`Entry ${index}: "lat" must be a finite latitude or null.`);
  }

  if (!(hasLng || missingLng)) {
    issues.push(`Entry ${index}: "lng" must be a finite longitude or null.`);
  }

  if ((missingLat && !missingLng) || (!missingLat && missingLng)) {
    issues.push(`Entry ${index}: "lat" and "lng" must both be finite numbers or both be null.`);
  }

  if (hasLat && (lat < -90 || lat > 90)) {
    issues.push(`Entry ${index}: "lat" must be within -90 to 90.`);
  }

  if (hasLng && (lng < -180 || lng > 180)) {
    issues.push(`Entry ${index}: "lng" must be within -180 to 180.`);
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
  const mappedCount = data.filter((entry) => entry.lat !== null && entry.lng !== null).length;
  const googlePlaceCount = data.filter((entry) => typeof entry.googlePlaceUrl === 'string' && entry.googlePlaceUrl.trim()).length;

  return {
    count: data.length,
    mappedCount,
    unmappedCount: data.length - mappedCount,
    googlePlaceCount,
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

function normalizeEntriesForCompare(data) {
  if (!Array.isArray(data)) {
    return null;
  }

  return data
    .map(normalizeEntry)
    .filter((entry) => entry !== null);
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
  const normalizedTarget = normalizeEntriesForCompare(targetData);
  const normalizedCompare = normalizeEntriesForCompare(compareData);

  if (!normalizedTarget || !normalizedCompare) {
    issues.push('Comparison requires both files to contain JSON arrays.');
  } else if (deepEqual(normalizedTarget, normalizedCompare)) {
    console.log(`Compare: normalized content matches ${path.relative(cwd, compareFile)}`);
  } else {
    issues.push(`Compare file ${compareFile} does not match ${targetFile} after normalization.`);
    console.log(`Compare: normalized content differs from ${path.relative(cwd, compareFile)}`);
    console.log(`Target count: ${normalizedTarget.length}`);
    console.log(`Compare count: ${normalizedCompare.length}`);
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
