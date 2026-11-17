# Commission quote tests

- The user should not be able to submit the form without entering all required fields.

- Low risk quote: Navigate to `/`. Enter `100000` in Loan amount and `36` in Loan term (months), then open Risk band and select Low. Click Generate Quote once and wait for the result. Verify that Your commission quote is displayed, Total commission is not zero or blank, Commission rate is not zero or blank, and Quote ID has a nonblank value. The test fails if an error is displayed.

Note: The mock vendor randomly fails with a 10% chance.
