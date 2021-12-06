# HDB Driver (TypeScript)

[![npm](https://img.shields.io/npm/v/ts-hdb)](https://www.npmjs.com/package/ts-hdb)
[![node-test](https://github.com/Soontao/ts-hdb/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Soontao/ts-hdb/actions/workflows/nodejs.yml)
[![codecov](https://codecov.io/gh/Soontao/ts-hdb/branch/main/graph/badge.svg?token=WJf9XudtiU)](https://codecov.io/gh/Soontao/ts-hdb)

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
  const rs = await client.execute("SELECT A,B,C,D FROM A_TABLE")
  for await (const row of rs.createObjectStream()) {
    // row.A
    // row.B
    // row.C
    // row.D
  }
}

run()
```

## [CHANGELOG](./CHANGELOG.md)
## [LICENSE](./LICENSE)
