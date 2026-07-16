'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SCHEMA_DIR = path.join(REPO_ROOT, 'packages/contracts/schemas');
const schemaCache = new Map();

function loadSchema(name) {
  if (!schemaCache.has(name)) {
    schemaCache.set(name, JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, name), 'utf8')));
  }
  return schemaCache.get(name);
}

function validateSchema(name, value) {
  const errors = [];
  validateValue(loadSchema(name), value, '$', errors);
  return errors;
}

function validateValue(schema, value, location, errors) {
  if (schema.$ref) {
    validateValue(loadSchema(path.basename(schema.$ref)), value, location, errors);
    return;
  }

  if (schema.type === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      errors.push(`${location} must be an object`);
      return;
    }

    for (const required of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, required)) {
        errors.push(`${location}.${required} is required`);
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(schema.properties || {}, key)) {
          errors.push(`${location}.${key} is not allowed`);
        }
      }
    }

    for (const [key, childSchema] of Object.entries(schema.properties || {})) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateValue(childSchema, value[key], `${location}.${key}`, errors);
      }
    }
    return;
  }

  if (schema.type === 'string') {
    if (typeof value !== 'string') {
      errors.push(`${location} must be a string`);
      return;
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${location} is shorter than ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(`${location} is longer than ${schema.maxLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${location} does not match ${schema.pattern}`);
    }
    if (schema.format === 'uuid' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
      errors.push(`${location} must be a UUID`);
    }
    if (schema.format === 'date-time' && Number.isNaN(Date.parse(value))) {
      errors.push(`${location} must be an ISO date-time`);
    }
  }

  if (schema.type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${location} must be a boolean`);
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    errors.push(`${location} must be a number`);
  }
  if (schema.type === 'integer' && !Number.isInteger(value)) {
    errors.push(`${location} must be an integer`);
  }
  if (Object.prototype.hasOwnProperty.call(schema, 'const') && value !== schema.const) {
    errors.push(`${location} must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${location} is not in the allowed enum`);
  }
}

module.exports = { validateSchema };
