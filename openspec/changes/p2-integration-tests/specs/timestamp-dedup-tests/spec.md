## ADDED Requirements

### Requirement: Skips feeds with unchanged timestamps
The test suite SHALL verify that the timestamp deduplication logic filters out feeds whose timestamp has not advanced since the last submission.

#### Scenario: Duplicate timestamp filtered
- **WHEN** a feed was last submitted at timestamp T AND a new fetch returns the same timestamp T for that feed
- **THEN** the feed MUST NOT be included in the output batch

### Requirement: Processes feeds with newer timestamps
The test suite SHALL verify that feeds with timestamps strictly greater than the last submission are included in the batch.

#### Scenario: Newer timestamp passes filter
- **WHEN** a feed was last submitted at timestamp T AND a new fetch returns timestamp T+60 for that feed
- **THEN** the feed MUST be included in the output batch with the new timestamp
