# Lifi 玻璃适配（dsh-lifi-adapters）

把第三方 DSH 插件的页面与卡片接入 Liue 的玻璃体系，并**由本包提供**对外的玻璃表面契约（`.lifi-glass` 类、`--lifi-*` 变量、`window.dshLifiGlass`）。Liue 主包不再包含这部分内容。

- 纯客户端 CSS + 少量 JS，无 Host 端口、无网络请求、无数据读写。
- 独立安装/卸载，不内置在 Lifiwallpaper 包体中。
- 版本绑定：**本包 0.1.0 只兼容 Lifiwallpaper 0.2.7**。检测不到 `0.2.7` 时完全不注入样式（页面保持原样），并在控制台给出一条提示。

## 版本矩阵

| dsh-lifi-adapters | 兼容的 dsh-lifiwallpaper | 说明                                         |
| ----------------- | --------------------- | ------------------------------------------ |
| 0.1.0             | 0.2.7                 | 首个公开契约版本；Liue 只提供 `data-dsh-ap-version` 标记 |

Lifiwallpaper 升级到新协议时，需要同步发布新的 adapter 版本并在 `client.js` 里修改 `REQUIRED_LIFI`。

## 安装

在 DSH 的「插件」页安装本包（或使用 `plugin_manager install_bundle`），启用后刷新页面。只有 Lifiwallpaper 同时启用且玻璃模式不是「无」时才会生效。

## 对第三方开发者的契约

安装本包后，其他插件只需给容器加一个类：

```html
<div class="lifi-glass">…</div>
```

即可获得与 Lifiwallpaper 一致的玻璃：背景色、模糊、边框、圆角都会跟随用户的 Liue 设置。

可用变量（由本包定义在 `<html>` 上）：

| 变量                      | 含义               |
| ----------------------- | ---------------- |
| `--lifi-surface-bg`     | 玻璃背景色（浅色/深色自动切换） |
| `--lifi-surface-border` | 玻璃边框色            |
| `--lifi-blur`           | 背景模糊半径           |
| `--lifi-radius`         | 圆角半径             |

检测：

```js
if (window.dshLifiGlass?.protocol === 'lifi-appearance/0.2.7') {
  // 可以使用 .lifi-glass
}
```

当 Lifiwallpaper 玻璃模式为「无」或本适配包被禁用时，`window.dshLifiGlass` 不存在，`.lifi-glass` 不产生任何样式，插件应回退到自己的默认背景。

## 已适配的第三方页面

| 插件                                                | 处理                              |
| ------------------------------------------------- | ------------------------------- |
| `dsh-memory-evolve`（记忆 / 技能 / 待办 / Memory Evolve） | 页面根透明；顶层卡片玻璃；嵌套条目透明             |
| `billion-context`（上下文）                            | 仅 iframe 外框圆角与阴影；内部为跨源文档，无法注入样式 |

具体选择器见 `client.js` 顶部 CSS。

## 已知边界

- `billion-context` 的「上下文」是**跨源 iframe**（`/__bili/?embed=1&theme=…`）。浏览器同源策略禁止父页面修改其内部样式，只能处理外框；要统一内部背景需要 bili 侧支持透明背景或主题参数。
- 若第三方页面将来改用 Shadow DOM，需要单独适配。
- 本包只在 Liue 0.2.7 上验证；其他版本会主动禁用。

## 许可

MIT © 2026 Liue
