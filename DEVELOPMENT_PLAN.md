# AnimationCurves v2.0 - 并行开发计划

**项目仓库：** https://github.com/jadon7/AnimationCurves-v2.git  
**开发日期：** 2026-02-20  
**开发模式：** 多 Codex 实例并行开发

---

## 并行任务划分

### 实例 1: 数学核心 (curves-math)
**工作目录：** `/Users/liuhuihuan/Documents/AnimationCurves-v2/dev/curves-math`  
**分支：** `feature/curves-math`  
**负责：** 实现所有 26 条动画曲线的数学函数

**任务清单：**
- [ ] Rive Elastic 曲线（1 条）
- [ ] Android 曲线（11 条）
- [ ] iOS 曲线（14 条）
- [ ] 单元测试（每条曲线测试 t=0, 0.25, 0.5, 0.75, 1.0）
- [ ] 输出：`curves-math.jsx`（独立模块）

**交付标准：**
- 所有曲线函数符合 ExtendScript 语法
- 每个函数有 JSDoc 注释
- 包含测试数据验证

---

### 实例 2: UI 组件 (ui-components)
**工作目录：** `/Users/liuhuihuan/Documents/AnimationCurves-v2/dev/ui-components`  
**分支：** `feature/ui-components`  
**负责：** ScriptUI 界面实现

**任务清单：**
- [ ] 主窗口框架（Palette, 320x660px）
- [ ] 标签页组件（Rive/Android/iOS）
- [ ] 曲线选择下拉菜单
- [ ] 动态参数面板（支持显示/隐藏）
- [ ] 预览区域（文本显示）
- [ ] 应用按钮
- [ ] 输出：`ui-components.jsx`（独立模块）

**交付标准：**
- 符合 ScriptUI API
- 正确处理 layout.layout(true) 刷新
- 参数面板动态切换流畅

---

### 实例 3: 表达式生成器 (expression-generator)
**工作目录：** `/Users/liuhuihuan/Documents/AnimationCurves-v2/dev/expression-generator`  
**分支：** `feature/expression-generator`  
**负责：** AE 表达式代码生成

**任务清单：**
- [ ] 表达式生成器主函数
- [ ] Rive 表达式模板
- [ ] Android 表达式模板
- [ ] iOS 表达式模板
- [ ] 贝塞尔曲线辅助函数
- [ ] 表达式语法验证
- [ ] 输出：`expression-generator.jsx`（独立模块）

**交付标准：**
- 生成的表达式符合 AE 语法
- 使用 valueAtTime() 和 linear()
- 包含参数注释

---

### 实例 4: 集成与主入口 (main-integration)
**工作目录：** `/Users/liuhuihuan/Documents/AnimationCurves-v2/dev/main-integration`  
**分支：** `feature/main-integration`  
**负责：** 整合所有模块，实现主入口

**任务清单：**
- [ ] Model 数据模型
- [ ] ViewModel 视图模型
- [ ] CurveFactory 工厂类
- [ ] applyToKeyframes() 关键帧应用函数
- [ ] 错误处理和用户提示
- [ ] 整合所有模块到单文件
- [ ] 输出：`AnimationCurves.jsx`（最终文件）

**交付标准：**
- 单文件实现
- 所有模块正确集成
- 错误处理完善

---

### 实例 5: 测试套件 (testing)
**工作目录：** `/Users/liuhuihuan/Documents/AnimationCurves-v2/dev/testing`  
**分支：** `feature/testing`  
**负责：** 测试用例和验证脚本

**任务清单：**
- [ ] 数学函数单元测试
- [ ] UI 交互测试脚本
- [ ] 表达式生成测试
- [ ] 端到端测试场景
- [ ] 测试文档
- [ ] 输出：`tests/` 目录

**交付标准：**
- 覆盖所有 26 条曲线
- 包含边界值测试
- 提供 AE 测试指南

---

## 开发阶段和提交策略

### Phase 1: 基础模块开发（并行）
**时间：** 第 1 天上午

**并行任务：**
1. 实例 1 → 开发 Rive + Android 曲线（前 12 条）
2. 实例 2 → 开发 UI 框架和标签页
3. 实例 3 → 开发表达式生成器框架
4. 实例 5 → 准备测试框架

**提交点 1：**
- `feature/curves-math` → 前 12 条曲线完成
- `feature/ui-components` → UI 框架完成
- `feature/expression-generator` → 生成器框架完成
- `feature/testing` → 测试框架完成

**推送：** 推送所有分支到远程

---

### Phase 2: 完善模块（并行）
**时间：** 第 1 天下午

**并行任务：**
1. 实例 1 → 完成 iOS 曲线（后 14 条）
2. 实例 2 → 完成参数面板和预览区域
3. 实例 3 → 完成所有平台表达式模板
4. 实例 5 → 编写单元测试

**提交点 2：**
- `feature/curves-math` → 所有 26 条曲线完成
- `feature/ui-components` → UI 完全实现
- `feature/expression-generator` → 表达式生成器完成
- `feature/testing` → 单元测试完成

**推送：** 推送所有分支到远程

---

### Phase 3: 集成和测试
**时间：** 第 2 天上午

**串行任务：**
1. 实例 4 → 整合所有模块到单文件
2. 实例 5 → 运行端到端测试
3. 修复集成问题

**提交点 3：**
- `feature/main-integration` → 单文件集成完成
- `feature/testing` → 端到端测试完成

**推送：** 推送所有分支到远程

---

### Phase 4: 验证和文档
**时间：** 第 2 天下午

**并行任务：**
1. 实例 4 → 在 AE 中验证所有功能
2. 实例 5 → 编写用户文档和示例
3. 修复发现的问题

**提交点 4：**
- `main` → 合并所有分支
- 添加 README.md, USER_GUIDE.md, EXAMPLES.md

**推送：** 推送 main 分支到远程

---

## Codex 实例配置

### 通用配置
```bash
# 所有实例使用相同的基础配置
--full-auto                    # workspace-write + on-request
--model gpt-5.3-codex         # 使用主力模型
```

### 实例 1: curves-math
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/curves-math
git checkout -b feature/curves-math

/Users/liuhuihuan/.local/bin/claude \
  --dangerously-skip-permissions \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/curves-math \
  "Read ../../PRODUCT_REQUIREMENTS.md section 2.1 and ../../memory/codex-research-2026-02-20.md.

CRITICAL: ExtendScript (JavaScript 1.5) syntax only:
- Use var, not let/const
- Use function, not arrow functions
- Use string concatenation, not template literals

Task: Implement all 26 animation curve functions.

Phase 1 (do this first):
1. Rive Elastic (1 curve)
2. Android curves (11 curves)

Each curve must:
- Be a constructor function
- Have getValue(t) method
- Input: t (0.0-1.0)
- Output: value (0.0-1.0)
- Include JSDoc comments
- Include test output for t=0, 0.25, 0.5, 0.75, 1.0

Output: curves-math.jsx

After Phase 1, commit and wait for next instruction for Phase 2 (iOS curves)."
```

### 实例 2: ui-components
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/ui-components
git checkout -b feature/ui-components

/Users/liuhuihuan/.local/bin/claude \
  --dangerously-skip-permissions \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/ui-components \
  "Read ../../PRODUCT_REQUIREMENTS.md section 2.2 and ../../memory/codex-research-2026-02-20.md.

CRITICAL: ScriptUI API (not DOM):
- Use ScriptUI components (Window, Panel, Group, etc.)
- Call layout.layout(true) after visibility changes
- ExtendScript syntax only

Task: Implement ScriptUI interface.

Phase 1 (do this first):
1. Main window (Palette, 320x660px)
2. Tab panel (Rive/Android/iOS)
3. Curve dropdown placeholder

Requirements:
- Non-modal Palette window
- Tab switching works
- Layout refreshes correctly

Output: ui-components.jsx

After Phase 1, commit and wait for next instruction for Phase 2 (parameter panel)."
```

### 实例 3: expression-generator
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/expression-generator
git checkout -b feature/expression-generator

/Users/liuhuihuan/.local/bin/claude \
  --dangerously-skip-permissions \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/expression-generator \
  "Read ../../PRODUCT_REQUIREMENTS.md section 2.3.2 and ../../memory/codex-research-2026-02-20.md.

CRITICAL: AE Expression syntax:
- Use valueAtTime(time), not value.at()
- Use linear(t, tMin, tMax, v1, v2)
- ExtendScript syntax only

Task: Implement expression generator.

Phase 1 (do this first):
1. Main generator function structure
2. Rive Elastic expression template
3. Android expression templates (Linear, Accelerate, Decelerate)

Each template must:
- Include curve math implementation
- Use correct AE syntax
- Include parameter comments
- Handle time normalization

Output: expression-generator.jsx

After Phase 1, commit and wait for next instruction for Phase 2 (remaining templates)."
```

### 实例 5: testing
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/testing
git checkout -b feature/testing

/Users/liuhuihuan/.local/bin/claude \
  --dangerously-skip-permissions \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/testing \
  "Read ../../PRODUCT_REQUIREMENTS.md section 5 and ../../memory/codex-research-2026-02-20.md.

Task: Create testing framework and test cases.

Phase 1 (do this first):
1. Test framework structure
2. Unit test template for curve functions
3. Test data generator (t values: 0, 0.25, 0.5, 0.75, 1.0)
4. Test documentation template

Output:
- tests/unit/curve-tests.jsx
- tests/TESTING_GUIDE.md

After Phase 1, commit and wait for next instruction for Phase 2 (integration tests)."
```

---

## 上下文管理策略

### 1. 共享上下文文件
所有实例都可以访问：
- `PRODUCT_REQUIREMENTS.md` - 完整需求
- `memory/codex-research-2026-02-20.md` - Codex 使用指南
- `DEVELOPMENT_PLAN.md` - 本文件

### 2. 模块间接口文档
创建 `docs/MODULE_INTERFACES.md` 定义：
- 每个模块的输入/输出
- 函数签名
- 数据结构

### 3. 进度跟踪
创建 `PROGRESS.md` 实时更新：
- 每个实例的当前状态
- 完成的任务
- 遇到的问题
- 下一步计划

### 4. 问题日志
创建 `ISSUES.md` 记录：
- 发现的问题
- 解决方案
- 需要协调的事项

---

## Git 工作流

### 分支策略
```
main
├── feature/curves-math
├── feature/ui-components
├── feature/expression-generator
├── feature/main-integration
└── feature/testing
```

### 提交规范
```
[模块名] 简短描述

详细说明：
- 完成的功能
- 测试结果
- 已知问题

相关文件：
- 文件列表
```

### 推送时机
- Phase 1 完成后推送
- Phase 2 完成后推送
- Phase 3 完成后推送
- Phase 4 完成后推送（最终版本）

---

## 监控和协调

### 我的职责
1. 启动所有 Codex 实例
2. 监控每个实例的进度
3. 协调模块间的接口
4. 处理冲突和问题
5. 执行 git 提交和推送
6. 向你报告进度

### 进度报告频率
- 每个 Phase 开始时报告
- 每个实例完成任务时报告
- 遇到问题时立即报告
- 每次推送后提供 git 链接

---

## 预期时间线

**Day 1 上午（Phase 1）：** 2-3 小时
- 4 个实例并行开发基础模块
- 提交点 1 + 推送

**Day 1 下午（Phase 2）：** 2-3 小时
- 4 个实例并行完善模块
- 提交点 2 + 推送

**Day 2 上午（Phase 3）：** 2-3 小时
- 集成和测试
- 提交点 3 + 推送

**Day 2 下午（Phase 4）：** 1-2 小时
- 验证和文档
- 提交点 4 + 推送（最终版本）

**总计：** 7-11 小时（分布在 2 天）

---

## 成功标准

### 技术标准
- ✅ 所有 26 条曲线正确实现
- ✅ UI 流畅无卡顿
- ✅ 表达式在 AE 中无错误
- ✅ 单文件实现
- ✅ 符合 ExtendScript 语法

### 流程标准
- ✅ 每个 Phase 按时完成
- ✅ 所有分支正确合并
- ✅ Git 历史清晰
- ✅ 文档完整

### 交付标准
- ✅ AnimationCurves.jsx（主文件）
- ✅ README.md
- ✅ USER_GUIDE.md
- ✅ EXAMPLES.md
- ✅ tests/ 目录

---

**计划创建时间：** 2026-02-20 11:10  
**计划创建者：** Deep Research Agent  
**状态：** 准备启动
