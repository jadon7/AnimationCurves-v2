# AnimationCurves v2.0 - 更新日志

**更新时间：** 2026-02-20 12:16  
**版本：** v2.1 (Physics-focused)

---

## 🎯 重大更新

### 1. Spring 曲线时间修复 ✅
**问题：** iOS Spring 曲线使用关键帧时间距离，导致动画节奏不正确  
**修复：** Spring 曲线现在使用固定的物理时间（duration 参数）

**技术细节：**
- 时间驱动曲线（Rive Elastic）：继续使用关键帧时间距离
- 物理驱动曲线（iOS Spring）：使用固定 duration 参数
- 修改位置：AnimationCurves.jsx:433, 683, 697, 711, 725

**效果：**
- Spring 动画现在有正确的物理行为
- 不受关键帧间距影响
- 动画节奏由 damping、velocity、duration 参数控制

---

### 2. 可视化曲线预览 ✅
**问题：** 预览面板只显示文本信息  
**修复：** 实现了图形化曲线预览

**技术细节：**
- 使用 ScriptUI Graphics 对象绘制
- 280x110 像素画布
- 实时采样曲线并绘制路径
- 显示网格、坐标轴和曲线

**效果：**
- 可以直观看到曲线形状
- 参数变化时实时更新
- 更容易理解曲线行为

---

### 3. 精简到物理曲线 ✅
**原因：** 只保留真正的物理动画曲线  
**变更：** 从 26 条曲线减少到 5 条

**保留的曲线：**
1. **Rive Elastic** - 弹性动画（amplitude, period, easingType）
2. **iOS Spring Default** - 默认弹簧（damping=0.8）
3. **iOS Spring Gentle** - 柔和弹簧（damping=0.9）
4. **iOS Spring Bouncy** - 弹跳弹簧（damping=0.5）
5. **iOS Spring Custom** - 自定义弹簧（可调参数）

**移除的曲线：**
- ❌ 所有 Android 曲线（11 条）- 非物理曲线
- ❌ iOS Linear, EaseIn, EaseOut, EaseInOut（4 条）- 简单缓动
- ❌ iOS CA 曲线（6 条）- 贝塞尔曲线

**代码变化：**
- AnimationCurves.jsx: 1600 → 1109 行（-491 行）
- 移除了 Android 标签页
- 只保留 Rive 和 iOS 标签页
- 更新了所有文档

---

## 📊 对比

| 项目 | v2.0 | v2.1 |
|------|------|------|
| 曲线数量 | 26 | 5 |
| 平台数量 | 3 (Rive/Android/iOS) | 2 (Rive/iOS) |
| 代码行数 | 1600 | 1109 |
| 物理曲线 | 5 | 5 |
| 非物理曲线 | 21 | 0 |

---

## 🎨 新特性

### 可视化预览
- 实时绘制曲线图形
- 显示网格和坐标轴
- 参数变化立即反映

### 物理时间控制
- Spring 曲线独立于关键帧
- 精确的物理行为
- 可预测的动画时长

---

## 🔧 技术改进

### 表达式生成
```javascript
// 物理曲线（Spring）
var duration = 1.0;  // 固定物理时间
var t = (time - inPoint) / duration;

// 时间驱动曲线（Elastic）
var duration = outPoint - inPoint;  // 关键帧时间距离
var t = (time - inPoint) / duration;
```

### 预览绘制
```javascript
// 采样曲线
for (var i = 0; i <= samples; i++) {
    var t = i / samples;
    var val = curve.getValue(t);
    // 绘制点
}
```

---

## 📖 文档更新

所有文档已更新以反映新的 5 曲线结构：
- ✅ README.md - 更新曲线列表
- ✅ USER_GUIDE.md - 移除 Android 部分
- ✅ EXAMPLES.md - 更新示例

---

## 🚀 使用建议

### 选择曲线
1. **需要弹性效果** → Rive Elastic
2. **需要平滑弹簧** → iOS Spring Gentle
3. **需要弹跳效果** → iOS Spring Bouncy
4. **需要快速响应** → iOS Spring Default
5. **需要自定义** → iOS Spring Custom

### 参数调整
- **damping (阻尼)**: 0.5-0.9，越小越弹
- **velocity (初速度)**: 0-3，影响起始速度
- **duration (时长)**: 0.5-2 秒，物理动画时长

---

## 🔗 链接

- **GitHub:** https://github.com/jadon7/AnimationCurves-v2
- **主文件:** AnimationCurves.jsx (1109 行)
- **提交:** 812add7

---

## ✨ 总结

v2.1 是一个重大更新，专注于物理动画：
- ✅ 修复了 Spring 曲线的时间问题
- ✅ 添加了可视化预览
- ✅ 精简到 5 条高质量物理曲线
- ✅ 代码更简洁（-491 行）
- ✅ 更专注、更易用

现在插件完全专注于物理动画，每条曲线都有真实的物理行为！

---

**更新完成时间：** 2026-02-20 12:16  
**下一版本计划：** 根据使用反馈优化
