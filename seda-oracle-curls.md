# MAINNET - Verification of SEDA Oracles for HYPE,  MANTRA, HYPE/MANTRA on SEDA mainnet

Owner: James Birney

<aside>
ℹ️

SEDA has setup these 3 oracles on **mainnet** (see: [https://sedaprotocol.notion.site/Mantra-SEDA-Oracle-Programs-32da68d575ca8073b5a0fbc5a0217972](https://www.notion.so/32da68d575ca8073b5a0fbc5a0217972?pvs=21))

This page is a clone of doing the same verification previously on testnet ([TESTNET - Verification of SEDA Oracles for HYPE,  MANTRA, HYPE/MANTRA on SEDA testnet](https://www.notion.so/TESTNET-Verification-of-SEDA-Oracles-for-HYPE-MANTRA-HYPE-MANTRA-on-SEDA-testnet-32e5c45f06f08087b956c6806f2a5ee1?pvs=21))

</aside>

@James Birney did some verification curls to make sure that they’re working correctly, this page is a summary of that verification. Each toggle below contains the verifying curl. 

# HYPE/USD (✅ tested)

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
  "execInputs": {
    "pyth_id": "4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b",
    "scale": 18
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1941  100  1703  100   238    678     94  0:00:02  0:00:02 --:--:--   773
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "9ed08e34-6273-4304-a6d2-4bb55539384e",
    "requestId": "9ed08e34-6273-4304-a6d2-4bb55539384e",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b22707974685f6964223a2234323739653331636333363962626363326661663032326233383262303830653332613865363839666632306662633533306432613630336562366364393862222c227363616c65223a31387d",
      "execProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "bb8f0150215acabad4be03637ab308ba3ef20da1f0e898a22a5005ba89cb80e1",
      "gasUsed": "34938534731250",
      "blockHeight": "0",
      "blockTimestamp": "1774850103632",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a223338333236303139363530303030303030303030222c2274696d657374616d70223a22323032362d30332d33305430353a35353a30325a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "101f1432cdb227f3e747e4de4557d582cc28ff16551fac145074c81cad89340e1967e35406bc7f8ea287a9cc6ea7552f80bd04a20a42a195b7f1066d58b1a85600",
    "result": {
      "price": "38326019650000000000",
      "timestamp": "2026-03-30T05:55:02Z"
    },
    "execute": {
      "result": {
        "price": "38326019650000000000",
        "timestamp": "2026-03-30T05:55:02Z"
      },
      "gasUsed": "24235163456250",
      "stdout": "Pyth Basic update version: 1.2.0\nCHAIN_ID: Ok(\"seda-1\")\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "38326019650000000000",
        "timestamp": "2026-03-30T05:55:02Z"
      },
      "gasUsed": "10703371275000",
      "stdout": "Pyth Basic Tally Phase - Version: 1.2.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```

# MANTRA/USD (✅ tested)

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "6dea2bb3d6379fee7c0d345b1a114b1475a3673f46b80643ef5f7fd2e6293c1f",
  "execInputs": {
    "binance_symbol": "MANTRAUSDT",
    "bybit_symbol": "MANTRAUSDT",
    "gate_io_symbol": "MANTRA_USDT"
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2098  100  1853  100   245    841    111  0:00:02  0:00:02 --:--:--   953
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "d74a0865-68b8-41ae-90fa-16ef89125596",
    "requestId": "d74a0865-68b8-41ae-90fa-16ef89125596",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b2262696e616e63655f73796d626f6c223a224d414e54524155534454222c2262796269745f73796d626f6c223a224d414e54524155534454222c22676174655f696f5f73796d626f6c223a224d414e5452415f55534454227d",
      "execProgramId": "6dea2bb3d6379fee7c0d345b1a114b1475a3673f46b80643ef5f7fd2e6293c1f",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "6dea2bb3d6379fee7c0d345b1a114b1475a3673f46b80643ef5f7fd2e6293c1f",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "de840d19209092a509f8e7e6635e999232dd8376a007a54df87194c3876fc8c1",
      "gasUsed": "43616009331250",
      "blockHeight": "0",
      "blockTimestamp": "1774850360325",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a223131363130303030303030303030303030222c2274696d657374616d70223a22323032362d30332d33305430353a35393a32312e3538325a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "1434a6023b2d7139039e8b7846ef5d35e19d04e979741c55de64f4192c94a74b79423221780d96c1742ff6b241c8b890a89ef0bcb32384b9c741e49376b4d77f01",
    "result": {
      "price": "11610000000000000",
      "timestamp": "2026-03-30T05:59:21.582Z"
    },
    "execute": {
      "result": {
        "price": "11610000000000000",
        "timestamp": "2026-03-30T05:59:21.582Z"
      },
      "gasUsed": "32905304760000",
      "stdout": "Mantra BinByGate version: 1.0.0\nBybit price for MANTRAUSDT: 0.0116\nGate.io price for MANTRA_USDT: 0.01162\nBinance fetch failed: Failed to parse response from Binance API for symbol: MANTRAUSDT\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "11610000000000000",
        "timestamp": "2026-03-30T05:59:21.582Z"
      },
      "gasUsed": "10710704571250",
      "stdout": "Mantra BinByGate Tally Phase - Version: 1.0.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```

# HYPE/MANTRA (✅ tested)

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "3e1b8cd95c5b5fa3f0eab64d7e1125864ccbe6f1e848d7fc9607e0b00aa07797",
  "execInputs": {
    "binance_symbol": "MANTRAUSDT",
    "bybit_symbol": "MANTRAUSDT",
    "gate_io_symbol": "MANTRA_USDT",
    "quote_assets": [
      {
        "id": "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b"
      },
      {
        "id": "0x4279e31cc369bbcc2faf022b382b080e32a8e689ff20fbc530d2a603eb6cd98b"
      }
    ],
    "invert": true
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  3096  100  2603  100   493    759    143  0:00:03  0:00:03 --:--:--   903
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "70a61db4-bfbf-43b7-a7be-e826c79fb8d2",
    "requestId": "70a61db4-bfbf-43b7-a7be-e826c79fb8d2",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b2262696e616e63655f73796d626f6c223a224d414e54524155534454222c2262796269745f73796d626f6c223a224d414e54524155534454222c22676174655f696f5f73796d626f6c223a224d414e5452415f55534454222c2271756f74655f617373657473223a5b7b226964223a22307832623839623964633866646639663334373039613562313036623437326630663339626236636139636530346230666437663265393731363838653265353362227d2c7b226964223a22307834323739653331636333363962626363326661663032326233383262303830653332613865363839666632306662633533306432613630336562366364393862227d5d2c22696e76657274223a747275657d",
      "execProgramId": "3e1b8cd95c5b5fa3f0eab64d7e1125864ccbe6f1e848d7fc9607e0b00aa07797",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "3e1b8cd95c5b5fa3f0eab64d7e1125864ccbe6f1e848d7fc9607e0b00aa07797",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "9a1f13f44048367f3436c56241cb7379e0e2f94594858b761baf01e2e680b103",
      "gasUsed": "77157605062500",
      "blockHeight": "0",
      "blockTimestamp": "1774932095877",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a22333237393234333634333431313634363530343230392e31323735333436222c2274696d657374616d70223a22323032362d30332d33315430343a34313a33372e3637355a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "e52eaa68030ba32c17d1f45523b33338102c78c9f19acd02d81ac16e0627df3125fe3038685c352d17d18abe4e763a3f20cd8e32d2457e195fbf3a4affbe5c1901",
    "result": {
      "price": "3279243643411646504209.1275346",
      "timestamp": "2026-03-31T04:41:37.675Z"
    },
    "execute": {
      "result": {
        "price": "3279243643411646504209.1275346",
        "timestamp": "2026-03-31T04:41:37.675Z"
      },
      "gasUsed": "66356484302500",
      "stdout": "Mantra BinByGate version: 1.1.0\nBybit price for MANTRAUSDT: 0.01128\nGate.io price for MANTRA_USDT: 0.01129\nBinance fetch failed: Failed to parse response from Binance API for symbol: MANTRAUSDT\nCHAIN_ID: Ok(\"seda-1\")\nCross-rate quote from Pyth: 0.99914468\nPrice after applying cross-rate: 0.0112946605490608227028742224\nCHAIN_ID: Ok(\"seda-1\")\nCross-rate quote from Pyth: 37.03794381\nPrice after applying cross-rate: 0.0003049483688133718431405067\nPrice after inversion: 3279.2436434116465042091275346\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "3279243643411646504209.1275346",
        "timestamp": "2026-03-31T04:41:37.675Z"
      },
      "gasUsed": "10801120760000",
      "stdout": "Mantra BinByGate Tally Phase - Version: 1.1.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```

# USDC/USD (✅ tested)

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
  "execInputs": {
    "pyth_id": "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    "scale": 18
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1937  100  1697  100   240   1310    185  0:00:01  0:00:01 --:--:--  1496
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "f2b3a36b-7ade-44b6-83a3-0e8abeec532b",
    "requestId": "f2b3a36b-7ade-44b6-83a3-0e8abeec532b",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b22707974685f6964223a22307865616130323063363163633437393731323831333436316365313533383934613936613663303062323165643063666332373938643166396139653963393461222c227363616c65223a31387d",
      "execProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "559b675a82902f961634e367c90beacfbe6f7e9b5f88246ad76edb5f40f6a412",
      "gasUsed": "34897726719375",
      "blockHeight": "0",
      "blockTimestamp": "1774931813401",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a22393939363634333930303030303030303030222c2274696d657374616d70223a22323032362d30332d33315430343a33363a35315a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "b9d9367ed497cb48240b49b4aa31dbdca6b19f3ebb5afb47c136bdc99fd529fe2f19b18664493f58840485c3358b6bf4bc95b4303b3c5c971b7e7a7b9a8ad68000",
    "result": {
      "price": "999664390000000000",
      "timestamp": "2026-03-31T04:36:51Z"
    },
    "execute": {
      "result": {
        "price": "999664390000000000",
        "timestamp": "2026-03-31T04:36:51Z"
      },
      "gasUsed": "24216761811875",
      "stdout": "Pyth Basic update version: 1.2.0\nCHAIN_ID: Ok(\"seda-1\")\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "999664390000000000",
        "timestamp": "2026-03-31T04:36:51Z"
      },
      "gasUsed": "10680964907500",
      "stdout": "Pyth Basic Tally Phase - Version: 1.2.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```

# USDT/USD (✅ tested)

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
  "execInputs": {
    "pyth_id": "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
    "scale": 18
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1937  100  1697  100   240   1091    154  0:00:01  0:00:01 --:--:--  1246
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "430dbfe7-6158-408d-92b2-da5904f4120c",
    "requestId": "430dbfe7-6158-408d-92b2-da5904f4120c",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b22707974685f6964223a22307832623839623964633866646639663334373039613562313036623437326630663339626236636139636530346230666437663265393731363838653265353362222c227363616c65223a31387d",
      "execProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "cefe600578edb2888216419cc79f2c883dd12dcc8486be246a8125023848fb2c",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "ff33832eaa0454106dd4a6e8efdb43dd13803aeb63e35066c50b015ac7f54010",
      "gasUsed": "34923109930625",
      "blockHeight": "0",
      "blockTimestamp": "1774932014052",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a22393939313436353030303030303030303030222c2274696d657374616d70223a22323032362d30332d33315430343a34303a31325a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "39bd45d9d8cc8135e5b2fe5277a3610315de3dbbefc6526d134e7fe15d198d360534612c900583cf8d2b80d3be360dc3265649164e94a7afcdc75efa3f2ffc1400",
    "result": {
      "price": "999146500000000000",
      "timestamp": "2026-03-31T04:40:12Z"
    },
    "execute": {
      "result": {
        "price": "999146500000000000",
        "timestamp": "2026-03-31T04:40:12Z"
      },
      "gasUsed": "24242145023125",
      "stdout": "Pyth Basic update version: 1.2.0\nCHAIN_ID: Ok(\"seda-1\")\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "999146500000000000",
        "timestamp": "2026-03-31T04:40:12Z"
      },
      "gasUsed": "10680964907500",
      "stdout": "Pyth Basic Tally Phase - Version: 1.2.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```

# stMANTRA/MANTRA (✅ tested)

- Oracle: 1,007,054,565,427,171,789.52 / 10^18 = **1.007055**
    - This means 1 stMANTRA = 1.007055 MANTRA
- FE says 1 MANTRA = 0.9929948528 stMANTRA
    - Meaning 1 stMANTRA = 1/0.9929948528 = **1.00706** MANTRA
- **Matches** — both agree to ~5 decimal places.

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "v1.evm-vault.mantra",
  "execInputs": {
    "vaultType": "erc4626Ratio",
    "contract": "0x4131a80b67be287627766b858c3c6d7f9e900324"
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2069  100  1881  100   188    685     68  0:00:02  0:00:02 --:--:--   753
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "b93859c9-07a9-47e2-9d5a-9c6b05c2d635",
    "requestId": "b93859c9-07a9-47e2-9d5a-9c6b05c2d635",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b227661756c7454797065223a2265726334363236526174696f222c22636f6e7472616374223a22307834313331613830623637626532383736323737363662383538633363366437663965393030333234227d",
      "execProgramId": "493a55ecfc2833fc7cc1d73a19494b204b7ea9547d243c71e111d3559db2f91d",
      "execOnsName": "v1.evm-vault.mantra",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "493a55ecfc2833fc7cc1d73a19494b204b7ea9547d243c71e111d3559db2f91d",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "aab161a2a1579c0b1189f0ffcc506ef31d62a6792bf33aede10f9bd2e9f33d9e",
      "gasUsed": "42215773288125",
      "blockHeight": "0",
      "blockTimestamp": "1774932365788",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a22313030373035343536353432373137313738392e35323137363234363531222c2274696d657374616d70223a22323032362d30332d33315430343a34363a30362e3737325a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "17105b01c0ff65ee205f051baf04f67589eab3114bad820ce4afa38307e9f18a481b302dfeee70073d6a1f7cc0158f985df38788bd7dfec82733c5809645f5be01",
    "result": {
      "price": "1007054565427171789.5217624651",
      "timestamp": "2026-03-31T04:46:06.772Z"
    },
    "execute": {
      "result": {
        "price": "1007054565427171789.5217624651",
        "timestamp": "2026-03-31T04:46:06.772Z"
      },
      "gasUsed": "31403903753125",
      "stdout": "Mantra EVM Vault version: 1.0.0\nContract decimals: 18\ntotalAssets: 1831318279550332236796352, totalSupply: 1818489625508549051898797\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "1007054565427171789.5217624651",
        "timestamp": "2026-03-31T04:46:06.772Z"
      },
      "gasUsed": "10811869535000",
      "stdout": "Mantra EVM Vault Tally Phase - Version: 1.0.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```

# wmantraUSD-Yld/USD (✅ tested)

- Oracle: 1,002,594 / 10^6 = **$1.002594**
- FE says mantraUSD/wmantraUSD-YLD = 0.9974
- Meaning 1 wmantraUSD-YLD = ~$1.0026 (reciprocal)

```json
% curl -X 'POST' \
  'https://fast-api.mainnet.seda.xyz/execute?includeDebugInfo=true&encoding=json' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "execProgramId": "v1.evm-vault.mantra",
  "execInputs": {
    "vaultType": "accountantRate",
    "contract": "0xcB6C931AC97Da626684B44af070465938eAE20b6",
    "scale": 18
  },
  "inputEncoding": "auto"
}' | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1996  100  1789  100   207   1142    132  0:00:01  0:00:01 --:--:--  1273
{
  "_tag": "ExecuteResponse",
  "data": {
    "id": "133b776f-0252-41bc-b1fd-f13a89660fbd",
    "requestId": "133b776f-0252-41bc-b1fd-f13a89660fbd",
    "dataRequest": {
      "consensusFilter": "00",
      "execGasLimit": "300000000000000",
      "execInputs": "7b227661756c7454797065223a226163636f756e74616e7452617465222c22636f6e7472616374223a22307863423643393331414339374461363236363834423434616630373034363539333865414532306236222c227363616c65223a31387d",
      "execProgramId": "493a55ecfc2833fc7cc1d73a19494b204b7ea9547d243c71e111d3559db2f91d",
      "execOnsName": "v1.evm-vault.mantra",
      "gasPrice": "0",
      "memo": "",
      "replicationFactor": 1,
      "tallyGasLimit": "50000000000000",
      "tallyInputs": "",
      "tallyProgramId": "493a55ecfc2833fc7cc1d73a19494b204b7ea9547d243c71e111d3559db2f91d",
      "version": "0.0.1"
    },
    "dataResult": {
      "drId": "cedf1982209ab520d14efce40bd8dd0b64fb09a9d4148a04b6f45c6f31fee844",
      "gasUsed": "36338913806250",
      "blockHeight": "0",
      "blockTimestamp": "1774943174832",
      "consensus": true,
      "exitCode": 0,
      "version": "0.0.1",
      "result": "7b227072696365223a2231303032353934303030303030303030303030222c2274696d657374616d70223a22323032362d30332d33315430373a34363a31352e3131315a227d",
      "paybackAddress": "",
      "sedaPayload": ""
    },
    "signature": "debe9f57d8c4a1c28951e9f7c7b4b077bc7ee870403dafbd92b9dbb60fc58708771b3cc80e93473c5003215601883d51004e4ede2c02c2331a856f230bfd4e0e01",
    "result": {
      "price": "1002594000000000000",
      "timestamp": "2026-03-31T07:46:15.111Z"
    },
    "execute": {
      "result": {
        "price": "1002594000000000000",
        "timestamp": "2026-03-31T07:46:15.111Z"
      },
      "gasUsed": "25607900673750",
      "stdout": "Mantra EVM Vault version: 1.0.0\nContract decimals: 6\ngetRate: 1002594\n",
      "stderr": "",
      "exitCode": 0
    },
    "tally": {
      "result": {
        "price": "1002594000000000000",
        "timestamp": "2026-03-31T07:46:15.111Z"
      },
      "gasUsed": "10731013132500",
      "stdout": "Mantra EVM Vault Tally Phase - Version: 1.0.0\n",
      "stderr": "",
      "exitCode": 0
    }
  }
}
```