# A little logger

A tiny structured logging utility that includes, customizable transports, metadata.

[![Build Status](https://img.shields.io/github/actions/workflow/status/Pingid/lickle-log/test.yml?branch=main&style=flat&colorA=000000&colorB=000000)](https://github.com/Pingid/lickle-log/actions?query=workflow:Test)
[![Build Size](https://img.shields.io/bundlephobia/minzip/@lickle/log?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=@lickle/log)
[![Version](https://img.shields.io/npm/v/@lickle/log?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@lickle/log)
[![Downloads](https://img.shields.io/npm/dt/@lickle/log.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@lickle/log)

## Install

Install the `@lickle/log` library using your preferred package manager:

```bash
npm install @lickle/log
```

## Usage

### Default Logger

The default logger uses a console-based structured logger transport. Here's how to use it:

```typescript
import log from '@lickle/log'

log.info`initialised`
// Output: { level: 'info', time: '...', msg: 'initialised' }

log.info({ userId: '...' })`user authenticated`
// Output: { level: 'info', time: '...', msg: 'user authenticated', meta: { userId: '...' } }

log.info('started tast')
// Output: { level: 'info', time: '...', msg: 'started tast' }

log.error(new Error('task failed'))
// Output: { level: 'error', time: '...', msg: 'task failed', meta: { stack: '...' } }
```

#### Adding Metadata

The logger's metadata is stored in the meta property. You can update it directly, and any additional metadata passed to a log call will be merged with this global metadata.

```typescript
import log from '@lickle/log'

log.meta['requestId'] = '123'

log.info`start`
// Output: { level: 'info', time: '...', msg: 'start', meta: { requestId: '123' } }
```

#### Customizing the Transport

Customize the transport function for the logger:

```typescript
import log from '@lickle/log'

log.transport = (log) => {
  if (log.level === 'error') sendToServer({ ...log, time: Date.now() })
  console.log(`[${log.level.toUpperCase()}] ${log.msg}`, log.meta)
}
```

### Creating a New Logger

You can create a new logger instance with custom configurations:

```typescript
import { create } from '@lickle/log'

const log = create({
  meta: { service: 'auth' },
  transport: (lg) => console[lg.level](`[${lg.time}] ${lg.msg}\n${JSON.stringify(lg.meta)}`),
})

log.info`foo`
```

## License

This project is licensed under the MIT License.

MIT © [Dan Beaven](https://github.com/Pingid)
