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

## Install

Install the `@lickle/log` library using your preferred package manager:

```bash
npm install @lickle/log
yarn add @lickle/log
pnpm add @lickle/log
```

## Usage

### Default Logger

The default logger uses a console-based structured logger transport. Here's how to use it:

```typescript
import log from '@lickle/log';

log.info`initialised`;
// Output: { level: 'info', time: '...', msg: 'initialised' }

log.info({ userId: '...' })`user authenticated`;
// Output: { level: 'info', time: '...', msg: 'user authenticated', meta: { userId: '...' } }
```

### Adding Metadata

You can add metadata to the logger using the `log.meta` method. Metadata fields are merged by default. To replace existing metadata, pass `true` as the second argument `log.meta({ ... }, true)`.

```typescript
import log from '@lickle/log';

log.meta({ requestId: '123' });

log.info`start`;
// Output: { level: 'info', time: '...', msg: 'start', meta: { requestId: '123' } }
```

### Configuration

#### Customizing the Transport

Customize the transport function for the top-level logger as shown below:

```typescript
import log from '@lickle/log';

log.configure({
  transport: (lg) => console[lg.level](`[${lg.time}] ${lg.msg}\n${JSON.stringify(lg.meta)}`),
});
```

#### Creating a New Logger Instance

You can create a new logger instance with custom configurations:

```typescript
import { create } from '@lickle/log';

const logger = create({
  meta: {},
  transport: (lg) => console[lg.level](`[${lg.time}] ${lg.msg}\n${JSON.stringify(lg.meta)}`),
});
```

## License

This project is licensed under the MIT License.

MIT © [Dan Beaven](https://github.com/Pingid)

