# AnimationCurves v2.0 - Codex 并行开发方案（修订版）

**项目仓库：** https://github.com/jadon7/AnimationCurves-v2.git  
**开发工具：** Codex CLI (非交互式模式)  
**开发日期：** 2026-02-20

---

## 策略调整

由于环境限制，我们使用 **Codex exec 非交互式模式** 在独立进程中运行：

```bash
# 基本模式
codex exec --full-auto --cd /path/to/dir "task description"

# 后台运行 + 输出重定向
codex exec --full-auto --cd /path/to/dir "task" > output.log 2>&1 &
```

---

## 4 个并行任务

### Task 1: 数学核心 (curves-math)
**命令：**
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/curves-math && \
codex exec --full-auto \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/curves-math \
  "Read ../../PRODUCT_REQUIREMENTS.md section 2.1.

CRITICAL: ExtendScript (JavaScript 1.5) syntax:
- Use var, not let/const
- Use function, not arrow functions
- No template literals, no ES6+

Task: Create curves-math.jsx with 12 curve functions (Phase 1):

1. Rive Elastic (amplitude, period, easingType params)
2. Android Linear
3. Android Accelerate (factor)
4. Android Decelerate (factor)
5. Android AccelerateDecelerate
6. Android Anticipate (tension)
7. Android Overshoot (tension)
8. Android AnticipateOvershoot (tension)
9. Android Bounce
10. Android FastOutSlowIn
11. Android FastOutLinearIn
12. Android LinearOutSlowIn

Each curve:
- Constructor function
- getValue(t) method (t: 0-1, returns: 0-1)
- JSDoc comments
- Test output for t=0, 0.25, 0.5, 0.75, 1.0

Commit: '[curves-math] Phase 1: Rive + Android curves (12 total)'" \
  > /tmp/codex-curves-math.log 2>&1 &
```

---

### Task 2: UI 组件 (ui-components)
**命令：**
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/ui-components && \
codex exec --full-auto \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/ui-components \
  "Read ../../PRODUCT_REQUIREMENTS.md section 2.2.

CRITICAL: ScriptUI API (not DOM):
- Use Window, Panel, Group, TabbedPanel, DropDownList, Slider, EditText, Button
- Call layout.layout(true) after visibility changes
- ExtendScript syntax only

Task: Create ui-components.jsx with Phase 1 UI:

1. Main Palette window (320x660px, title 'Animation Curves v2.0')
2. TabbedPanel with 3 tabs: Rive, Android, iOS
3. Curve dropdown (placeholder)
4. Basic layout structure

Requirements:
- Non-modal Palette
- Tab switching works
- Layout refreshes correctly

Commit: '[ui-components] Phase 1: Main window + tabs'" \
  > /tmp/codex-ui-components.log 2>&1 &
```

---

### Task 3: 表达式生成器 (expression-generator)
**命令：**
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/expression-generator && \
codex exec --full-auto \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/expression-generator \
  "Read ../../PRODUCT_REQUIREMENTS.md section 2.3.2.

CRITICAL: AE Expression syntax:
- Use valueAtTime(time), NOT value.at()
- Use linear(t, tMin, tMax, v1, v2)
- ExtendScript syntax only

Task: Create expression-generator.jsx with Phase 1:

1. ExpressionGenerator constructor
2. generate(platform, curveType, params) method
3. Rive Elastic template
4. Android Linear template
5. Android Accelerate template
6. Android Decelerate template

Each template:
- Inline curve math
- Correct AE syntax
- Parameter comments
- Time normalization: var t = (time - inPoint) / (outPoint - inPoint)

Commit: '[expression-generator] Phase 1: Framework + 4 templates'" \
  > /tmp/codex-expression-generator.log 2>&1 &
```

---

### Task 4: 测试框架 (testing)
**命令：**
```bash
cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/testing && \
codex exec --full-auto \
  --cd /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/testing \
  "Read ../../PRODUCT_REQUIREMENTS.md section 5.

Task: Create testing framework Phase 1:

1. Create tests/ directory
2. Create tests/unit/curve-tests.jsx
3. Test data generator (t: 0, 0.25, 0.5, 0.75, 1.0)
4. Create tests/TESTING_GUIDE.md

Framework:
- Runnable in After Effects
- Test each curve with standard t values
- Readable output format
- ExtendScript syntax

Commit: '[testing] Phase 1: Test framework'" \
  > /tmp/codex-testing.log 2>&1 &
```

---

## 监控方案

使用 cron 每 3 分钟检查进度：

```bash
# 检查进程
ps aux | grep "codex exec" | grep -v grep

# 检查日志
tail -50 /tmp/codex-*.log

# 检查文件
ls -la /Users/liuhuihuan/Documents/AnimationCurves-v2/dev/*/
```

---

## 执行步骤

1. ✅ 创建分支
2. ⏭️ 启动 4 个 codex exec 后台进程
3. ⏭️ 设置 cron 监控任务
4. ⏭️ 等待完成（预计 30-60 分钟）
5. ⏭️ 检查结果并提交
6. ⏭️ 推送到 GitHub

---

**状态：** 准备执行
