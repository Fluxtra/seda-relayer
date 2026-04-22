## ADDED Requirements

### Requirement: Decode from convenience result field
The test suite SHALL verify that `decodeResult` correctly extracts price and timestamp from the `data.result` convenience field when it is populated.

#### Scenario: Convenience field decoding
- **WHEN** `decodeResult` receives a `SedaFastResponse` where `data.result.price = "1234000000000000000000"` and `data.result.timestamp = "2025-06-15T12:00:00Z"`
- **THEN** the returned `OraclePrice` MUST have `price = 1234000000000000000000n` and `timestamp` equal to `new Date("2025-06-15T12:00:00Z")`

### Requirement: Fallback to hex-encoded dataResult
The test suite SHALL verify that when the convenience `data.result.price` field is falsy, `decodeResult` falls back to decoding the hex-encoded JSON in `data.dataResult.result`.

#### Scenario: Hex fallback decoding
- **WHEN** `decodeResult` receives a response where `data.result.price` is empty/null AND `data.dataResult.result` contains the hex encoding of `{"price":"123000000","timestamp":"2025-01-01T00:00:00Z"}`
- **THEN** the returned `OraclePrice` MUST have `price = 123000000n` and `timestamp` equal to `new Date("2025-01-01T00:00:00Z")`

### Requirement: Price with decimal is truncated to integer
The test suite SHALL verify that when the price string contains a decimal point, `decodeResult` truncates to the integer part before converting to BigInt.

#### Scenario: Decimal price truncation
- **WHEN** `decodeResult` receives a response with `data.result.price = "123.456"`
- **THEN** the returned `OraclePrice.price` MUST equal `123n`

### Requirement: Malformed hex fallback throws
The test suite SHALL verify that `decodeResult` throws when the convenience field is empty and the hex fallback contains invalid data.

#### Scenario: Garbage hex throws error
- **WHEN** `decodeResult` receives a response where `data.result.price` is falsy AND `data.dataResult.result` contains non-decodable hex
- **THEN** the function MUST throw an error
