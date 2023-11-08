# DynamoDBDocumentClient

A lightweight and flexible Node.js client for AWS DynamoDB, providing a simplified API for common operations such as getting, putting, deleting, and scanning items in a DynamoDB table.

## Features

- Simplified item operations (get, put, delete, scan).
- Optional conditional expressions for put and delete operations.
- Pagination support for scanning large tables.
- Easy integration with DynamoDB Local for development and testing.

## Installation

```bash
npm install dynamodb-helper
```

## Usage

```
const DynamoDBDocumentClient = require('dynamodb-helper');
const client = new DynamoDBDocumentClient('your-region', 'optional-endpoint');


// Getting an item
client.getItem('YourTableName', { primaryKey: 'value' })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Putting an Item
client.putItem('YourTableName', { primaryKey: 'value', attribute: 'data' })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Deleting an Item
client.deleteItem('YourTableName', { primaryKey: 'value' })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Scanning a Table
client.scanTable('YourTableName', true) // set true for pagination
  .then(data => console.log(data))
  .catch(err => console.error(err));

```
