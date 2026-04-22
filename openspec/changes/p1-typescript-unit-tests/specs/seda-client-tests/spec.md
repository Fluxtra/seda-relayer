## ADDED Requirements

### Requirement: Successful execution returns price and response
The test suite SHALL verify that `SedaFastClient.execute` returns the correct `OraclePrice` and raw `SedaFastResponse` when the API returns a valid 200 response.

#### Scenario: Successful API call
- **WHEN** `fetch` is mocked to return HTTP 200 with a valid `SedaFastResponse` body (exitCode=0, valid price/timestamp)
- **THEN** `execute(feed)` MUST return an object with `response` matching the mocked body AND `price` correctly decoded

### Requirement: Non-200 response throws with status code
The test suite SHALL verify that `execute` throws an error containing the HTTP status code when the API returns a non-200 response.

#### Scenario: HTTP 500 error
- **WHEN** `fetch` is mocked to return HTTP 500 with body "Internal Server Error"
- **THEN** `execute(feed)` MUST throw an error whose message contains "500"

### Requirement: Non-zero exit code throws
The test suite SHALL verify that `execute` throws when the oracle execution returns a non-zero exit code.

#### Scenario: Exit code 1 rejection
- **WHEN** `fetch` is mocked to return HTTP 200 with `dataResult.exitCode = 1`
- **THEN** `execute(feed)` MUST throw an error whose message contains "exit code 1"

### Requirement: Long error body is truncated
The test suite SHALL verify that error messages from non-200 responses are truncated to prevent excessively long error strings.

#### Scenario: 1000-char body truncated
- **WHEN** `fetch` is mocked to return HTTP 500 with a 1000-character body
- **THEN** `execute(feed)` MUST throw an error whose message is truncated to approximately 300 characters plus an ellipsis
