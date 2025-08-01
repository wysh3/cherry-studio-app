# How to use the LoggerService

This is a developer document on how to use the logger.

CherryStudio uses a unified logging service to print and record logs. **Unless there is a special reason, do not use `console.xxx` to print logs**

The following are detailed instructions.

## Usage in the `main` process

### Importing

```typescript
import { loggerService } from '@logger'
```

### Setting module information (Required by convention)

After the import statements, set it up as follows:

```typescript
const logger = loggerService.withContext('moduleName')
```

- `moduleName` is the name of the current file's module. It can be named after the filename, main class name, main function name, etc. The principle is to be clear and understandable.
- `moduleName` will be printed in the terminal and will also be present in the file log, making it easier to filter.

### Setting `CONTEXT` information (Optional)

In `withContext`, you can also set other `CONTEXT` information:

```typescript
const logger = loggerService.withContext('moduleName', CONTEXT)
```

- `CONTEXT` is an object of the form `{ key: value, ... }`.
- `CONTEXT` information will not be printed in the terminal, but it will be recorded in the file log, making it easier to filter.

### Logging

In your code, you can call `logger` at any time to record logs. The supported methods are: `error`, `warn`, `info`, `verbose`, `debug`, `silly`.
For the meaning of each level, please refer to the section below.

The following examples show how to use `logger.info` and `logger.error`. Other levels are used in the same way:

```typescript
logger.info('message', CONTEXT)
logger.info('message %s %d', 'hello', 123, CONTEXT)
logger.error('message', new Error('error message'), CONTEXT)
```

- `message` is a required string. All other options are optional.
- `CONTEXT` as `{ key: value, ... }` is optional and will be recorded in the log file.
- If an `Error` type is passed, the error stack will be automatically recorded.

### Log Levels

- In the development environment, all log levels are printed to the terminal and recorded in the file log.
- In the production environment, the default log level is `info`. Logs are only recorded to the file and are not printed to the terminal.

Changing the log level:

- You can change the log level with `logger.setLevel('newLevel')`.
- `logger.resetLevel()` resets it to the default level.
- `logger.getLevel()` gets the current log level.

**Note:** Changing the log level has a global effect. Please do not change it arbitrarily in your code unless you are very clear about what you are doing.

### Log Levels

- In the development environment, all log levels are printed to the `devTool`'s `console` by default.
- In the production environment, the default log level is `info`, and logs are printed to the `devTool`'s `console`.
- In both development and production environments, `warn` and `error` level logs are, by default, transmitted to the `main` process and recorded in the file log.
  - In the development environment, the `main` process terminal will also print the logs transmitted from the renderer.

#### Changing the Log Level

Same as in the `main` process, you can manage the log level using `setLevel('level')`, `resetLevel()`, and `getLevel()`.
Similarly, changing the log level is a global adjustment.

#### Changing the Level Transmitted to `main`

Logs from the `renderer` are sent to `main` to be managed and recorded to a file centrally (according to `main`'s file logging level). By default, only `warn` and `error` level logs are transmitted to `main`.

There are two ways to change the log level for transmission to `main`:

##### Global Change

The following methods can be used to set, reset, and get the log level for transmission to `main`, respectively.

```typescript
logger.setLogToMainLevel('newLevel')
logger.resetLogToMainLevel()
logger.getLogToMainLevel()
```

**Note:** This method has a global effect. Please do not change it arbitrarily in your code unless you are very clear about what you are doing.

##### Per-log Change

By adding `{ logToMain: true }` at the end of the log call, you can force a single log entry to be transmitted to `main` (bypassing the global log level restriction), for example:

```typescript
logger.info('message', { logToMain: true })
```

## Log Level Usage Guidelines

There are many log levels. The following are the guidelines that should be followed in CherryStudio for when to use each level:
(Arranged from highest to lowest log level)

| Log Level     | Core Definition & Use Case                                                                                                                                                                          | Example                                                                                                                                                                                                            |
| :------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`error`**   | **Critical error causing the program to crash or core functionality to become unusable.** <br> This is the highest-priority log, usually requiring immediate reporting or user notification.        | - Main or renderer process crash. <br> - Failure to read/write critical user data files (e.g., database, configuration files), preventing the application from running. <br> - All unhandled exceptions.           |
| **`warn`**    | **Potential issue or unexpected situation that does not affect the program's core functionality.** <br> The program can recover or use a fallback.                                                  | - Configuration file `settings.json` is missing; started with default settings. <br> - Auto-update check failed, but does not affect the use of the current version. <br> - A non-essential plugin failed to load. |
| **`info`**    | **Records application lifecycle events and key user actions.** <br> This is the default level that should be recorded in a production release to trace the user's main operational path.            | - Application start, exit. <br> - User successfully opens/saves a file. <br> - Main window created/closed. <br> - Starting an important task (e.g., "Start video export").                                         |
| **`verbose`** | **More detailed flow information than `info`, used for tracing specific features.** <br> Enabled when diagnosing issues with a specific feature to help understand the internal execution flow.     | - Loading `Toolbar` module. <br> - IPC message `open-file-dialog` sent from the renderer process. <br> - Applying filter 'Sepia' to the image.                                                                     |
| **`debug`**   | **Detailed diagnostic information used during development and debugging.** <br> **Must not be enabled by default in production releases**, as it may contain sensitive data and impact performance. | - Parameters for function `renderImage`: `{ width: 800, ... }`. <br> - Specific data content received by IPC message `save-file`. <br> - Details of Redux/Vuex state changes in the renderer process.              |
| **`silly`**   | **The most detailed, low-level information, used only for extreme debugging.** <br> Rarely used in regular development; only for solving very difficult problems.                                   | - Real-time mouse coordinates `(x: 150, y: 320)`. <br> - Size of each data chunk when reading a file. <br> - Time taken for each rendered frame.                                                                   |
