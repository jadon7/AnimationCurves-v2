# Animation Curves v2 for After Effects

Adobe After Effects 插件，为关键帧属性应用物理弹簧动画曲线。支持 4 个平台共 7 条曲线，提供两种版本：

- **CEP 扩展版**（推荐）— 可停靠面板，现代 UI，实时预览
- **ExtendScript 脚本版** — 单文件，浮动窗口，快速安装

## 支持的曲线

| 平台 | 曲线 | 参数 |
|------|------|------|
| Rive | Elastic | amplitude, period, easingType |
| Folme | Spring | damping, response |
| Android | Spring | stiffness, dampingRatio |
| Android | Fling | startVelocity, friction |
| iOS | Duration + Bounce | duration, bounce |
| iOS | Response + Damping | response, dampingFraction |
| iOS | Physics | mass, stiffness, damping |

## 系统要求

- Adobe After Effects CC 2015+
- macOS 或 Windows

## 安装

### 版本一：CEP 扩展（推荐）

可停靠面板，集成到 AE 工作区，现代 UI。

#### 自动安装

**macOS / Linux:**
```bash
./install.sh
```

**Windows:**
```cmd
install.bat
```

脚本会自动开启 CEP 调试模式，并将扩展复制到 AE 的扩展目录。完成后重启 After Effects，打开 `Window > Extensions > Animation Curves`。

#### 手动安装

**macOS:**

1. 开启 CEP 调试模式（终端执行）：
   ```bash
   defaults write com.adobe.CSXS.11 PlayerDebugMode 1
   ```

2. 将项目文件夹复制到扩展目录，并重命名为 `com.animationcurves.panel`：
   ```bash
   cp -r /path/to/AnimationCurves-v2 ~/Library/Application\ Support/Adobe/CEP/extensions/com.animationcurves.panel
   ```

3. 重启 After Effects，打开 `Window > Extensions > Animation Curves`

**Windows:**

1. 打开注册表编辑器，导航到 `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`，创建 DWORD `PlayerDebugMode` 值为 `1`
2. 将项目文件夹复制到 `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.animationcurves.panel`
3. 重启 After Effects，打开 `Window > Extensions > Animation Curves`

#### 开发者模式

如果你需要修改代码并实时生效，使用符号链接模式：

**macOS / Linux:**
```bash
./install.sh --dev
```

**Windows:**
```cmd
install.bat --dev
```

### 版本二：ExtendScript 脚本

单文件，浮动窗口，无需配置 CEP 调试模式。

1. 找到 AE 的 ScriptUI Panels 文件夹：
   - **macOS:** `/Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/`
   - **Windows:** `C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\`

2. 将 `extendscript-version/AnimationCurves.jsx` 复制到该文件夹

3. 重启 After Effects，打开 `Window > AnimationCurves.jsx`

## 使用方法

1. 打开包含关键帧的合成
2. 在时间线中选择关键帧
3. 打开插件面板（CEP 版：`Window > Extensions > Animation Curves`；脚本版：`Window > AnimationCurves.jsx`）
4. 选择平台和曲线类型，调整参数
5. 点击 Apply 应用到选中的关键帧

## 项目结构

```
├── CSXS/manifest.xml              # CEP 扩展清单
├── client/                         # 前端 (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   ├── main.js                    # 应用逻辑、UI、预览
│   ├── curves.js                  # 曲线数学实现
│   └── lib/CSInterface.js         # Adobe CEP 库
├── host/                           # 后端 (ExtendScript)
│   ├── index.jsx                  # 主入口
│   └── expression-generator.jsx   # 表达式生成器 + 曲线类
├── extendscript-version/          # ExtendScript 单文件版本
│   └── AnimationCurves.jsx        # 独立脚本
├── install.sh                     # 安装脚本 (macOS/Linux)
├── install.bat                    # 安装脚本 (Windows)
└── .debug                         # 调试配置
```

## License

MIT
