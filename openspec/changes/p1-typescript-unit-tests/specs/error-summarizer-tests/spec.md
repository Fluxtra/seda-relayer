## ADDED Requirements

### Requirement: Extracts code, action, and reason from ethers error
The test suite SHALL verify that `summarizeError` parses ethers-style error strings to extract the code, action, and reason fields.

#### Scenario: Full ethers error extraction
- **WHEN** `summarizeError` is called with `'code=CALL_EXCEPTION action="estimateGas" reason="execution reverted"'`
- **THEN** the result MUST contain "CALL_EXCEPTION", "estimateGas", and "execution reverted"

### Requirement: Handles missing action and reason gracefully
The test suite SHALL verify that `summarizeError` handles error strings that have a code but lack action or reason fields.

#### Scenario: Code only, no action/reason
- **WHEN** `summarizeError` is called with `'code=NETWORK_ERROR'`
- **THEN** the result MUST contain "NETWORK_ERROR" and "unknown" for the action AND MUST NOT throw

### Requirement: Truncates long messages without code pattern
The test suite SHALL verify that when the input message does not match the code pattern and exceeds 200 characters, it is truncated.

#### Scenario: Long message truncation
- **WHEN** `summarizeError` is called with a 300-character string that does not contain `code=`
- **THEN** the result MUST be exactly 200 characters plus "…" (201 total)

### Requirement: Short messages returned as-is
The test suite SHALL verify that short messages without a code pattern are returned unchanged.

#### Scenario: Short message passthrough
- **WHEN** `summarizeError` is called with a 50-character string that does not contain `code=`
- **THEN** the result MUST equal the original input string exactly
