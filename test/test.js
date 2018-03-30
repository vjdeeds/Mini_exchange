('use strict');
const util = require('util');
const app = require('../server');
const Lab = require('lab');
const code = require('code');
const expect = code.expect;
const lab = (exports.lab = Lab.script());

let server;

function createRequest(query) {
    return {
        method: 'GET',
        url: util.format('http://localhost:9000/%s', query)
    };
}

lab.experiment('Mini Exchange', () => {
    lab.test('Should return a company when query params fulfill criteria', async () => {
        const req = createRequest('?CountryCode=US&Category=Automobile&BaseBid=9');
        const response = await app.inject(req);

        expect(response.payload).to.exist();
        expect(response.payload).to.contain('C1');
    });

    lab.test('Should return a company with higher bid when base bid check returns multiple companies', async () => {
        const req = createRequest('?CountryCode=US&Category=Automobile&BaseBid=4');
        const response = await app.inject(req);

        expect(response.payload).to.exist();
        expect(response.payload).to.contain('C1');
    });

    lab.test('Should fail when query params are incorrect, BaseBid missing', async () => {
        const req = createRequest('?CountryCode=IN&Category=Automobile');

        const response = await app.inject(req);

        expect(response.result).to.exist();
        expect(response.result.message).to.contain('child "BaseBid" fails because ["BaseBid" is required]');
    });

    lab.test('Should fail when query params are incorrect, Category missing', async () => {
        const req = createRequest('?CountryCode=IN&BaseBid=9');

        const response = await app.inject(req);

        expect(response.result).to.exist();
        expect(response.result.message).to.contain('child "Category" fails because ["Category" is required]');
    });

    lab.test('Should fail when query params are incorrect, CountryCode missing', async () => {
        const req = createRequest('?Category=Automobile&BaseBid=9');

        const response = await app.inject(req);

        expect(response.result).to.exist();
        expect(response.result.message).to.contain('child "CountryCode" fails because ["CountryCode" is required]');
    });

    lab.test('Should fail when no companies passes targeting', async () => {
        const req = createRequest('?CountryCode=IN&Category=Automobile&BaseBid=9');
        const response = await app.inject(req);

        expect(response.payload).to.exist();
        expect(response.payload).to.contain('No Companies passed from targeting');
    });

    lab.test('Should fail when no companies passes budget check', async () => {
        const req = createRequest('?CountryCode=US&Category=Automobile&BaseBid=500');
        const response = await app.inject(req);

        expect(response.payload).to.exist();
        expect(response.payload).to.contain('No Companies passed from Budget');
    });

    lab.test('Should fail when no companies passes BaseBid check', async () => {
        const req = createRequest('?CountryCode=US&Category=Automobile&BaseBid=100');
        const response = await app.inject(req);

        expect(response.payload).to.exist();
        expect(response.payload).to.contain('No Companies passed from BaseBid check');
    });
});
