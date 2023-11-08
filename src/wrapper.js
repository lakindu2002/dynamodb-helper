const AWS = require('aws-sdk');

/**
 * A utility client for interacting with AWS DynamoDB that simplifies operations like
 * getting, deleting, scanning, and putting items into a DynamoDB table.
 */
class DynamoDBDocumentClient {

    /**
    * Initializes a new instance of the document client.
    * @param {string} region - The AWS region to which the client will send requests.
    * @param {string} [endpoint] - The DynamoDB endpoint URL for sending the requests.
    * This is useful for connecting to a local instance of DynamoDB (like DynamoDB Local).
    */
    constructor(region, endpoint) {
        AWS.config.update({
            ...region && { region }, ...endpoint && {
                dynamodb: {
                    endpoint: endpoint
                }
            }
        });
        this.client = new AWS.DynamoDB.DocumentClient();
    }

    /**
    * Retrieves a single item from a DynamoDB table.
    * @param {string} tableName - The name of the table from which to retrieve the item.
    * @param {Object} key - An object representing the primary key of the item to retrieve.
    * @returns {Promise<Object>} A promise that resolves to the retrieved item.
    */
    getItem(tableName, key) {
        const params = {
            TableName: tableName,
            Key: key
        };
        return new Promise((resolve, reject) => {
            this.client.get(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }


    /**
     * Deletes a single item from a DynamoDB table based on the primary key.
     * Optional conditional expressions can be provided.
     * @param {string} tableName - The name of the table from which to delete the item.
     * @param {Object} key - An object representing the primary key of the item to delete.
     * @param {Object} [expression] - An object with keys as DynamoDB attribute names
     * and values as attribute values for the conditional expression.
     * @param {Object} [comparison] - An object with keys as DynamoDB attribute names
     * and values as comparison operators (e.g., '=', '<>', etc.) for the conditional expression.
     * @returns {Promise<Object>} A promise that resolves to the result of the deletion.
     */
    deleteItem(tableName, key, expression = null, comparison = null) {
        const params = {
            TableName: tableName,
            Key: key
        };

        if (expression && comparison) {
            const conditionExpression = this.buildConditionExpression(expression, comparison);
            params.ConditionExpression = conditionExpression.expression;
            params.ExpressionAttributeNames = conditionExpression.names;
            params.ExpressionAttributeValues = conditionExpression.values;
        }

        return new Promise((resolve, reject) => {
            this.client.delete(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Scans a DynamoDB table and retrieves items. Optionally, can paginate to retrieve all items.
     * @param {string} tableName - The name of the table to scan.
     * @param {boolean} [paginate=false] - If true, retrieves all items through pagination.
     * @returns {Promise<Array>} A promise that resolves to an array of items.
     */
    scanTable(tableName, paginate = false) {
        const params = {
            TableName: tableName
        };

        if (!paginate) {
            return new Promise((resolve, reject) => {
                this.client.scan(params, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Items);
                    }
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                let items = [];
                const onScan = (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    items = items.concat(data.Items);
                    if (data.LastEvaluatedKey) {
                        params.ExclusiveStartKey = data.LastEvaluatedKey;
                        this.client.scan(params, onScan);
                    } else {
                        resolve(items);
                    }
                };
                this.client.scan(params, onScan);
            });
        }
    }

    /**
     * Puts a single item into a DynamoDB table. Optional conditional expressions can be provided.
     * @param {string} tableName - The name of the table where to put the item.
     * @param {Object} item - The item to put into the table.
     * @param {Object} [expression] - An object with keys as DynamoDB attribute names
     * and values as attribute values for the conditional expression.
     * @param {Object} [comparison] - An object with keys as DynamoDB attribute names
     * and values as comparison operators (e.g., '=', '<>', etc.) for the conditional expression.
     * @returns {Promise<Object>} A promise that resolves to the result of the put operation.
     */
    putItem(tableName, item, expression = null, comparison = null) {
        const params = {
            TableName: tableName,
            Item: item
        };

        if (expression && comparison) {
            const conditionExpression = this.buildConditionExpression(expression, comparison);
            params.ConditionExpression = conditionExpression.expression;
            params.ExpressionAttributeNames = conditionExpression.names;
            params.ExpressionAttributeValues = conditionExpression.values;
        }

        return new Promise((resolve, reject) => {
            this.client.put(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    /**
     * Builds a conditional expression for DynamoDB operations.
     * @param {Object} expression - An object with keys as DynamoDB attribute names
     * and values as attribute values for the conditional expression.
     * @param {Object} comparison - An object with keys as DynamoDB attribute names
     * and values as comparison operators (e.g., '=', '<>', etc.) for the conditional expression.
     * @returns {Object} An object containing the conditional expression string,
     * attribute names, and attribute values.
     * @private
     */
    buildConditionExpression(expression, comparison) {
        let expressionString = "";
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};

        for (const key in expression) {
            const attributeName = `#${key}`;
            const attributeValue = `:${key}`;
            const comparisonOperator = comparison[key];

            expressionAttributeNames[attributeName] = key;
            expressionAttributeValues[attributeValue] = expression[key];

            if (expressionString.length > 0) {
                expressionString += " AND ";
            }

            expressionString += `${attributeName} ${comparisonOperator} ${attributeValue}`;
        }

        return {
            expression: expressionString,
            names: expressionAttributeNames,
            values: expressionAttributeValues
        };
    }
}

module.exports = DynamoDBDocumentClient;