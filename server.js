'use strict';

const Joi = require('joi');
const Hapi = require('hapi');
const pg = require('pg');

const logger = require('./logger').infolog;

const internals = {
    queries: {
        getBaseTargetting: `SELECT COMPANY.companyId from COMPANY INNER JOIN COMPANY_CATEGORY
            ON COMPANY.companyId = COMPANY_CATEGORY.companyId INNER JOIN COMPANY_COUNTRY
            ON COMPANY.companyId = COMPANY_COUNTRY.companyId
            WHERE COMPANY_CATEGORY.category = $1 and COMPANY_COUNTRY.countryCode = $2`,
        getBudgetCheck: `SELECT budget FROM Company WHERE companyId = $1`,
        getBaseBidCheck: `SELECT bid FROM Company WHERE companyId = $1`,
        reduceBudget: `UPDATE Company SET budget = budget - $2::decimal where companyId = $1`
    }
};

var config = {
    user: 'test', // env var: test
    database: 'test', // env var: test
    password: 'test', // env var: test
    host: 'localhost', // Server hosting the postgres database
    port: 5432, // env var: PGPORT
    max: 100, // max number of clients in the pool
    idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};

const pool = new pg.Pool(config);

var server = new Hapi.Server();
server.connection({ port: 9000, host: 'localhost' });

internals.matchLogic = async function(req, reply) {
    logger.info(`------`);
    logger.info(`---Logging new request---`);
    const countryCode = req.query.CountryCode;
    const category = req.query.Category;
    const baseBid = req.query.BaseBid / 100;

    const client = await pool.connect();

    // base targetting check
    const res = await client.query(internals.queries.getBaseTargetting, [category, countryCode]);

    if (res.rows.length <= 0) {
        logger.info(`No Companies passed from targeting`);
        return reply('No Companies passed from targeting');
    }

    const budgetCheckPaas = [];

    //Check if company has budget to sell stock
    logger.info(`BaseTargeting: `);
    for (const row of res.rows) {
        logger.info(`{${row.companyid}, passed}`);

        const res1 = await client.query(internals.queries.getBudgetCheck, [row.companyid]);

        if (res1.rows[0].budget > baseBid) {
            budgetCheckPaas.push(row.companyid);
        }
    }

    if (budgetCheckPaas.length <= 0) {
        logger.info(`No Companies passed from Budget`);
        return reply('No Companies passed from Budget');
    }

    const baseBidCheckPass = [];

    //check if bid is more that the base bid
    logger.info(`BudgetCheck: `);
    for (const cId of budgetCheckPaas) {
        logger.info(`{${cId}, passed}`);

        const res2 = await client.query(internals.queries.getBaseBidCheck, [cId]);

        if (res2.rows[0].bid > baseBid * 100) {
            baseBidCheckPass.push({
                companyId: cId,
                bid: res2.rows[0].bid
            });
        }
    }

    if (baseBidCheckPass.length <= 0) {
        logger.info(`No Companies passed from BaseBid check`);
        return reply('No Companies passed from BaseBid check');
    }

    let winner = {};

    logger.info(`BaseBid: `);
    for (const company of baseBidCheckPass) {
        logger.info(`{${company.companyId}, passed}`);
    }

    //If more than one company passed basebid check then select company with highest bid
    if (baseBidCheckPass.length > 1) {
        const xMax = Math.max(...Array.from(baseBidCheckPass, o => o.bid));
        const max = baseBidCheckPass.find(o => o.bid === xMax);

        winner = max;
    } else {
        winner = baseBidCheckPass[0];
    }

    //Reduce the company's budget
    await client.query(internals.queries.reduceBudget, [winner.companyId, winner.bid / 100]);

    logger.info(`Winner = ${winner.companyId}`);
    return reply(winner.companyId);
};

server.route({
    method: 'GET',
    path: '/',
    handler: internals.matchLogic,
    config: {
        validate: {
            query: {
                CountryCode: Joi.string().required(),
                Category: Joi.string().required(),
                BaseBid: Joi.number().required()
            }
        }
    }
});

if (!module.parent) {
    server.start(err => {
        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.info.uri}`);
    });
}

module.exports = server;
