# Steps to follow

1.) install postgres client (https://www.postgresql.org/download/macosx/)
2.) run the commands from database-setup.sql file one by one

#Note: The database setup should be correct in order to run the code

3.) npm install

# To start the program

4.) npm start (to start the API)

5.) Hit the URL from any rest client or from your browser (http://localhost:9000/?CountryCode=US&Category=Automobile&BaseBid=9)

# To test the API

6.) npm test (To run the unit tests)

# To view the logs

7.) The log files will be available at /logs/exchange.log

Note: The unit test and the API are using same copy of the Database

#End to End process

In the file server.js, the function internals.matchLogic() receives the request

The query params are parsed using the below code

\*const countryCode = req.query.CountryCode;
\*const category = req.query.Category;
\*const baseBid = req.query.BaseBid / 100;

Line:46 makes a call to db to check if request satisfies base targetting

if response if null: the API replies back with 'No Companies passed from targeting'

else, in line:60 another db call is made to check if the list returned fro line 46 satisfies the budget.

if response if null: the API replies back with 'No Companies passed from Budget'

else, in line:79 another db call is made to check if the if bid is more that the base bid

if response if null: the API replies back with 'No Companies passed from BaseBid check'

else, in line:102

\*if (baseBidCheckPass.length > 1) {
\*const xMax = Math.max(...Array.from(baseBidCheckPass, o => o.bid));
\*const max = baseBidCheckPass.find(o => o.bid === xMax);
\*winner = max;
\*} else {
\*winner = baseBidCheckPass[0];
\*}

we filter the company that has the maximum bid value and return the same

Also, in line:112 make another db call to reduce the company budget after deducting the bid amount

#Thanks
