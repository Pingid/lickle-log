# A little logger

A tiny structured logging utility that includes, customizable transports, metadata.

[![Build Status](https://img.shields.io/github/actions/workflow/status/Pingid/lickle-log/test.yml?branch=main&style=flat&colorA=000000&colorB=000000)](https://github.com/Pingid/lickle-log/actions?query=workflow:Test)
[![Build Size](https://img.shields.io/bundlephobia/minzip/@lickle/log?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=@lickle/log)
[![Version](https://img.shields.io/npm/v/@lickle/log?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@lickle/log)
[![Downloads](https://img.shields.io/npm/dt/@lickle/log.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@lickle/log)

## Install

```bash
npm install @lickle/log
yarn add @lickle/log
pnpm add @lickle/log
```

## Usage

You can use the top level logger with default console based structured logger transport.

```typescript
import log from '@lickle/log'

log.debug`Initialised`

log.debug({ userId: '...' })`user authenticated`
```

```typescript
import { debug } from '@lickle/log'

debug`Initialised`
```

### Configuration

Customize the top-level transport:

```typescript
import log from '@lickle/log'

log.configure({
  meta: {},
  transport: (lg) => console[lg.level](`[${lg.time}] ${lg.msg}\n${JSON.stringify(lg.meta)}`),
})
```

Create a new logger instance:

```typescript
import { create } from '@lickle/log'

const logger = create({
  meta: {},
  transport: (lg) => console[lg.level](`[${lg.time}] ${lg.msg}\n${JSON.stringify(lg.meta)}`),
})
```

## License

MIT © [Dan Beaven](https://github.com/Pingid)
