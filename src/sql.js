require('dotenv').config();
const { Pool } = require('pg');


const ConditionalEnums = {
    GT: '>',
    GE: '>=',
    LT: '<',
    LE: '<=',
    EQ: '=',
    NULL: 'NULL',
    NE: '<>',
}

/**
 * Class for making sql queries
 * 
 * @class
 */
class SQL {
    queryString = null;
    conditionalEnums = ConditionalEnums;

    constructor() {
        this.dbUrl = process.env.DB_URL;
        this.client = this.connect();
    }

    connect = () => {
        const client = new Pool({
            connectionString: this.dbUrl
        });
        return client;
    }

    query = async (queryString) => {
        this.queryString = queryString;

        try {
            this.validate()
            const data = await this.client.query(this.queryString);
            await this.client.end();
            return data;
        } catch (e) {
            throw e;
        }
    }

    validate = () => {
        if (!this.queryString.includes('INSERT') || 
            !this.queryString.includes('DELETE') || 
            !this.queryString.includes('UPDATE') || 
            !this.queryString.includes('DROP') ||
            !this.queryString.includes('ALTER')) {
                return;
        }
        if (this.queryString.includes('SELECT *')) {
            throw Error('* is not allowed in query string');
        } else if (!this.queryString.includes('LIMIT') && !this.queryString.includes('OFFSET')) {
            throw Error('query without limit and offset is not allowed in query string');
        }
    }

    /**
     * @param {string[]} columnList
     * @returns {SQL}
     */
    select = (columnList) => {
        if (this.queryString) {
            throw Error('select must be called before any other function');
        }
        this.queryString = 'SELECT ';
        this.queryString += columnList.join(', ');
        return this;
    }

    /**
     * 
     * @param {string[]} columnList 
     * @returns {SQL}
     */
    insert = (tableName, columnList) => {
        if (this.queryString) {
            throw Error('insert must be called before any other function');
        }
        this.queryString = `INSERT INTO ${tableName} (`;
        this.queryString += columnList.join(',');
        this.queryString += ')';
        return this;
    }

    /**
     * 
     * @param {string[]} valueList 
     * @returns {SQL}
     */
    values = (valueList) => {
        if (!this.queryString.includes('INSERT INTO')) {
            throw Error('insert function must be called before values');
        }
        const wrappedList = valueList.map(value => `'${value}'`);
        const joinedString = wrappedList.join(',');
        this.queryString += ` VALUES (${joinedString})`;
        return this;
    }

    /**
     * 
     * @param {string} tableName 
     * @returns {SQL}
     */
    from = (tableName) => {
        if (!this.queryString || !this.queryString.includes('SELECT')) {
            throw Error('from should be called after select');
        }
        this.queryString += ` FROM ${tableName}`;
        return this;
    }

    /**
     * 
     * @param {string} condition
     * @param {string} value
     * @param {ConditionalEnums} conditional
     * @returns {SQL}
     */
    where = (column, value, conditional = ConditionalEnums.EQ) => {
        if (!this.queryString || !this.queryString.includes('SELECT') || !this.queryString.includes('FROM')) {
            throw Error('select and from should be called before any conditional');
        }
        const valConverted = parseFloat(value);
        if (!this.queryString.includes('WHERE')) {
            this.queryString += ' WHERE';
            if (valConverted) {
                this.queryString += ` ${column} ${conditional} ${valConverted}`;
            } else {
                this.queryString += ` ${column} ${conditional} '${value}'`;
            }
        } else {
            if (this.queryString.includes('AND') || this.queryString.includes('OR')) {
                if (valConverted) {
                    this.queryString += ` ${column} ${conditional} ${valConverted}`;
                } else {
                    this.queryString += ` ${column} ${conditional} '${value}'`;
                }
            }
        }
        return this;
    }

    /**
     * 
     * @returns {SQL}
     */
    and = () => {
        if (!this.queryString || !this.queryString.includes('SELECT') || !this.queryString.includes('FROM')) {
            throw Error('select and from should be called before any conditional');
        }
        if (!this.queryString.includes('WHERE')) {
            return Error('AND needs where to be present')
        }
        this.queryString += ' AND';
        return this;
    }

    /**
     * 
     * @returns {SQL}
     */
    or = () => {
        if (!this.queryString || !this.queryString.includes('SELECT') || !this.queryString.includes('FROM')) {
            throw Error('select and from should be called before any conditional');
        }
        if (!this.queryString.includes('WHERE')) {
            return Error('OR needs where to be present')
        }
        this.queryString += ' OR';
        return this;
    }

    /**
     * 
     * @param {int} limit 
     * @param {int} start 
     * @returns {SQL}
     */
    paginate = (limit = 10, start = 0) => {
        if (!this.queryString || !this.queryString.includes('SELECT') || !this.queryString.includes('FROM')) {
            throw Error('select and from should be called before any conditional');
        }
        this.queryString += ` OFFSET ${start} LIMIT ${limit}`;
        return this;
    }

    /**
     * 
     * @param {string[]} columnList 
     * @returns {SQL}
     */
    returns = (columnList) => {
        if (this.queryString.includes('SELECT')) {
            throw Error('return cannot be used with select');
        }
        if (columnList.includes('*')) {
            this.queryString += ' RETURNING *';
        } else {
            const returnColumnString = columnList.join(',');
            this.queryString += ` RETURNING ${returnColumnString}`;
        }

        return this;
    }

    /**
     * 
     * @returns {Promise}
     */
    execute = async () => {
        this.queryString += ';';
        // console.log(`Executing: ${this.queryString}`);
        const result = await this.query(this.queryString);
        return result.rows;
    }
}

module.exports = SQL;


