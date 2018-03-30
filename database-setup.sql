/* DROP SCHEMA public cascade; */
-- CREATE SCHEMA IF NOT EXISTS public;

CREATE USER test;

DROP DATABASE IF EXISTS test;
CREATE DATABASE test;

/* create company table */
CREATE TABLE IF NOT EXISTS COMPANY(
    companyId VARCHAR(10) PRIMARY KEY,
    bid INTEGER NOT NULL,
    budget DECIMAL(10, 3) NOT NULL
);

/* create companycategory table */
CREATE TABLE IF NOT EXISTS COMPANY_CATEGORY(
    companyId VARCHAR(10) NOT NULL,
    category  VARCHAR(10) NOT NULL
);

/* create companycountry table */
CREATE TABLE IF NOT EXISTS COMPANY_COUNTRY(
    companyId VARCHAR(10) NOT NULL,
    countryCode VARCHAR(10) NOT NULL
);

INSERT INTO COMPANY (companyId, bid, budget)
VALUES ('C1', 10, 1), ('C2', 30, 2), ('C3', 5, 3);

INSERT INTO COMPANY_CATEGORY
VALUES ('C1', 'Automobile'),
    ('C1', 'Finance'),
    ('C2', 'Finance'),
    ('C2', 'IT'),
    ('C3', 'IT'),
    ('C3', 'Automobile');

INSERT INTO COMPANY_COUNTRY
VALUES ('C1', 'US'),
    ('C1', 'FR'),
    ('C2', 'IN'),
    ('C2', 'US'),
    ('C3', 'US'),
    ('C3', 'RU');

