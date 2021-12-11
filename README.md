# HDB Driver (TypeScript)

> minimal type-safe hdb driver

[![npm](https://img.shields.io/npm/v/ts-hdb)](https://www.npmjs.com/package/ts-hdb)
[![node-test](https://github.com/Soontao/ts-hdb/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Soontao/ts-hdb/actions/workflows/nodejs.yml)
[![codecov](https://codecov.io/gh/Soontao/ts-hdb/branch/main/graph/badge.svg?token=WJf9XudtiU)](https://codecov.io/gh/Soontao/ts-hdb)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Soontao_ts-hdb&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Soontao_ts-hdb)

## Get Started

```bash
npm i -S ts-hdb
```

```ts
import { HDBClient } from "ts-hdb"

async function run() {
  const client = new HDBClient({
    host: "hostname",
    port: 443,
    user: "username",
    password: "password",
    useTLS: true,
  });
  for await (const row of client.streamQueryObject('SELECT A,B,c,D as "d" FROM A_TABLE')) {
    // the type of `row` is { A: any, B: any, C: any, d: any}
    // row.A
    // row.B
    // row.C
    // row.d
  }
}

run()
```

## [CHANGELOG](./CHANGELOG.md)
## [LICENSE](./LICENSE)
