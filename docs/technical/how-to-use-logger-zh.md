# 如何使用日志 LoggerService

这是关于如何使用日志的开发者文档。

CherryStudio使用统一的日志服务来打印和记录日志，**若无特殊原因，请勿使用`console.xxx`来打印日志**

以下是详细说明

## 在`main`进程中使用

### 引入

```typescript
import { loggerService } from '@logger'
```

### 设置module信息（规范要求）

在import头之后，设置：

```typescript
const logger = loggerService.withContext('moduleName')
```

- `moduleName`是当前文件模块的名称，命名可以以文件名、主类名、主函数名等，原则是清晰明了
- `moduleName`会在终端中打印出来，也会在文件日志中提现，方便筛选

### 设置`CONTEXT`信息（可选）

在`withContext`中，也可以设置其他`CONTEXT`信息：

```typescript
const logger = loggerService.withContext('moduleName', CONTEXT)
```

- `CONTEXT`为`{ key: value, ... }`
- `CONTEXT`信息不会在终端中打印出来，但是会在文件日志中记录，方便筛选

### 记录日志

在代码中，可以随时调用 `logger` 来记录日志，支持的方法有：`error`, `warn`, `info`, `verbose`, `debug`, `silly`
各级别的含义，请参考下面的章节。

以下以 `logger.info` 和 `logger.error` 举例如何使用，其他级别是一样的：

```typescript
logger.info('message', CONTEXT)
logger.info('message %s %d', 'hello', 123, CONTEXT)
logger.error('message', new Error('error message'), CONTEXT)
```

- `message` 是必填的，`string`类型，其他选项都是可选的
- `CONTEXT`为`{ key: value, ...}` 是可选的，会在日志文件中记录
- 如果传递了`Error`类型，会自动记录错误堆栈

### 记录级别

- 开发环境下，所有级别的日志都会打印到终端，并且记录到文件日志中
- 生产环境下，默认记录级别为`info`，日志只会记录到文件，不会打印到终端

更改日志记录级别：

- 可以通过 `logger.setLevel('newLevel')` 来更改日志记录级别
- `logger.resetLevel()` 可以重置为默认级别
- `logger.getLevel()` 可以获取当前记录记录级别

**注意** 更改日志记录级别是全局生效的，请不要在代码中随意更改，除非你非常清楚自己在做什么

### 记录级别

- 开发环境下，默认所有级别的日志都会打印到`devTool`的`console`
- 生产环境下，默认记录级别为`info`，日志会打印到`devTool`的`console`
- 在开发和生产环境下，默认`warn`和`error`级别的日志，会传输给`main`进程，并记录到文件日志
  - 开发环境下，`main`进程终端中也会打印传输过来的日志

#### 更改日志记录级别

和`main`进程中一样，你可以通过`setLevel('level')`、`resetLevel()`和`getLevel()`来管理日志记录级别。
同样，该日志记录级别也是全局调整的。

#### 更改传输到`main`的级别

将`renderer`的日志发送到`main`，并由`main`统一管理和记录到文件（根据`main`的记录到文件的级别），默认只有`warn`和`error`级别的日志会传输到`main`

有以下两种方式，可以更改传输到`main`的日志级别：

##### 全局更改

以下方法可以分别设置、重置和获取传输到`main`的日志级别

```typescript
logger.setLogToMainLevel('newLevel')
logger.resetLogToMainLevel()
logger.getLogToMainLevel()
```

**注意** 该方法是全局生效的，请不要在代码中随意更改，除非你非常清楚自己在做什么

##### 单条更改

在日志记录的最末尾，加上`{ logToMain: true }`，即可将本条日志传输到`main`（不受全局日志级别限制），例如：

```typescript
logger.info('message', { logToMain: true })
```

## 日志级别的使用规范

日志有很多级别，什么时候应该用哪个级别，下面是在CherryStudio中应该遵循的规范：
(按日志级别从高到低排列)

| 日志级别      | 核心定义与使用场景                                                                                       | 示例                                                                                                                                                  |
| :------------ | :------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`error`**   | **严重错误，导致程序崩溃或核心功能无法使用。** <br> 这是最高优的日志，通常需要立即上报或提示用户。       | - 主进程或渲染进程崩溃。 <br> - 无法读写用户关键数据文件（如数据库、配置文件），导致应用无法运行。<br> - 所有未捕获的异常。`                          |
| **`warn`**    | **潜在问题或非预期情况，但不影响程序核心功能。** <br> 程序可以从中恢复或使用备用方案。                   | - 配置文件 `settings.json` 缺失，已使用默认配置启动。 <br> - 自动更新检查失败，但不影响当前版本使用。<br> - 某个非核心插件加载失败。`                 |
| **`info`**    | **记录应用生命周期和关键用户行为。** <br> 这是发布版中默认应记录的级别，用于追踪用户的主要操作路径。     | - 应用启动、退出。<br> - 用户成功打开/保存文件。 <br> - 主窗口创建/关闭。<br> - 开始执行一项重要任务（如“开始导出视频”）。`                           |
| **`verbose`** | **比 `info` 更详细的流程信息，用于追踪特定功能。** <br> 在诊断特定功能问题时开启，帮助理解内部执行流程。 | - 正在加载 `Toolbar` 模块。 <br> - IPC 消息 `open-file-dialog` 已从渲染进程发送。<br> - 正在应用滤镜 'Sepia' 到图像。`                                |
| **`debug`**   | **开发和调试时使用的详细诊断信息。** <br> **严禁在发布版中默认开启**，因为它可能包含敏感数据并影响性能。 | - 函数 `renderImage` 的入参: `{ width: 800, ... }`。<br> - IPC 消息 `save-file` 收到的具体数据内容。<br> - 渲染进程中 Redux/Vuex 的 state 变更详情。` |
| **`silly`**   | **最详尽的底层信息，仅用于极限调试。** <br> 几乎不在常规开发中使用，仅为解决棘手问题。                   | - 鼠标移动的实时坐标 `(x: 150, y: 320)`。<br> - 读取文件时每个数据块（chunk）的大小。<br> - 每一次渲染帧的耗时。                                      |
