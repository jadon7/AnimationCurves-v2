# Animation Curves v2 for After Effects

Adobe After Effects CEP 扩展，为关键帧属性应用物理弹簧动画曲线。支持 4 个平台共 7 条曲线，可停靠面板，实时预览。

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

### 方式一：运行安装脚本（推荐）

```bash
./install.sh
```

脚本会自动开启 CEP 调试模式，并将扩展复制到 AE 的扩展目录。完成后重启 After Effects，打开 `Window > Extensions > Animation Curves`。

### 方式二：手动安装

#### macOS

1. 开启 CEP 调试模式（终端执行）：
   ```bash
   defaults write com.adobe.CSXS.11 PlayerDebugMode 1
   ```

2. 将项目文件夹复制到扩展目录，并重命名为 `com.animationcurves.panel`：
   ```bash
   cp -r /path/to/AnimationCurves-v2 ~/Library/Application\ Support/Adobe/CEP/extensions/com.animationcurves.panel
   ```

3. 重启 After Effects，打开 `Window > Extensions > Animation Curves`

#### Windows

1. 打开注册表编辑器，导航到 `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`，创建 DWORD `PlayerDebugMode` 值为 `1`
2. 将项目文件夹复制到 `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.animationcurves.panel`
3. 重启 After Effects，打开 `Window > Extensions > Animation Curves`

### 开发者模式

如果你需要修改代码并实时生效，使用符号链接模式：

```bash
./install.sh --dev
```

## 使用方法

1. 打开包含关键帧的合成
2. 在时间线中选择关键帧
3. 打开 `Window > Extensions > Animation Curves`
4. 选择平台和曲线类型，调整参数
5. 点击 Apply 应用到选中的关键帧

## 项目结构

```
├── CSXS/manifest.xml        # CEP 扩展清单
├── client/                   # 前端 (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   ├── main.js              # 应用逻辑、UI、预览
│   ├── curves.js            # 曲线数学实现
│   └── lib/CSInterface.js   # Adobe CEP 库
├── host/                     # 后端 (ExtendScript)
│   ├── index.jsx            # 主入口
│   └── expression-generator.jsx  # 表达式生成器 + 曲线类
├── install.sh               # 安装脚本
└── .debug                   # 调试配置
```

## License

MIT
