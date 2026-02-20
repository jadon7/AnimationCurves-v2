(function () {
    function buildUI() {
        var win = new Window('palette', 'Animation Curves v2.0', undefined, { resizeable: false });
        win.orientation = 'column';
        win.alignChildren = ['fill', 'top'];
        win.spacing = 8;
        win.margins = 10;
        win.preferredSize = [320, 660];

        var tabs = win.add('tabbedpanel');
        tabs.alignChildren = ['fill', 'top'];
        tabs.preferredSize = [300, 470];

        var riveTab = tabs.add('tab', undefined, 'Rive');
        var androidTab = tabs.add('tab', undefined, 'Android');
        var iosTab = tabs.add('tab', undefined, 'iOS');

        function refreshLayout() {
            win.layout.layout(true);
        }

        function clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }

        function roundToStep(value, step) {
            if (!step || step <= 0) {
                return value;
            }
            return Math.round(value / step) * step;
        }

        function getDecimals(step) {
            var str;
            var parts;
            if (!step || step >= 1) {
                return 0;
            }
            str = String(step);
            parts = str.split('.');
            return parts.length > 1 ? parts[1].length : 0;
        }

        function formatNumber(value, decimals) {
            var p = Math.pow(10, decimals || 0);
            return String(Math.round(value * p) / p);
        }

        var platformData = {
            Rive: {
                curves: [
                    {
                        name: 'Elastic',
                        params: [
                            { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 1.0, max: 3.0, step: 0.01, defaultValue: 1.0 },
                            { key: 'period', label: 'Period', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.3 },
                            { key: 'easingType', label: 'Easing Type', type: 'dropdown', options: ['Ease Out', 'Ease In', 'Ease In-Out'], defaultValue: 'Ease Out' }
                        ]
                    }
                ]
            },
            Android: {
                curves: [
                    { name: 'Linear', params: [] },
                    { name: 'Accelerate', params: [{ key: 'factor', label: 'Factor', type: 'slider', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0 }] },
                    { name: 'Decelerate', params: [{ key: 'factor', label: 'Factor', type: 'slider', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0 }] },
                    { name: 'AccelerateDecelerate', params: [] },
                    { name: 'Anticipate', params: [{ key: 'tension', label: 'Tension', type: 'slider', min: 0.0, max: 5.0, step: 0.1, defaultValue: 2.0 }] },
                    { name: 'Overshoot', params: [{ key: 'tension', label: 'Tension', type: 'slider', min: 0.0, max: 5.0, step: 0.1, defaultValue: 2.0 }] },
                    { name: 'AnticipateOvershoot', params: [{ key: 'tension', label: 'Tension', type: 'slider', min: 0.0, max: 5.0, step: 0.1, defaultValue: 2.0 }] },
                    { name: 'Bounce', params: [] },
                    { name: 'FastOutSlowIn', params: [] },
                    { name: 'FastOutLinearIn', params: [] },
                    { name: 'LinearOutSlowIn', params: [] }
                ]
            },
            iOS: {
                curves: [
                    { name: 'Linear', params: [] },
                    { name: 'EaseIn', params: [] },
                    { name: 'EaseOut', params: [] },
                    { name: 'EaseInOut', params: [] },
                    {
                        name: 'Spring Default',
                        params: [
                            { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.7 },
                            { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 },
                            { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.5 }
                        ]
                    },
                    {
                        name: 'Spring Gentle',
                        params: [
                            { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.9 },
                            { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 },
                            { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.6 }
                        ]
                    },
                    {
                        name: 'Spring Bouncy',
                        params: [
                            { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.5 },
                            { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.2 },
                            { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.7 }
                        ]
                    },
                    {
                        name: 'Spring Custom',
                        params: [
                            { key: 'damping', label: 'Damping', type: 'slider', min: 0.1, max: 1.0, step: 0.01, defaultValue: 0.8 },
                            { key: 'velocity', label: 'Velocity', type: 'slider', min: 0.0, max: 3.0, step: 0.01, defaultValue: 0.0 },
                            { key: 'duration', label: 'Duration', type: 'slider', min: 0.1, max: 2.0, step: 0.01, defaultValue: 0.5 }
                        ]
                    },
                    { name: 'CA Default', params: [] },
                    { name: 'CA EaseIn', params: [] },
                    { name: 'CA EaseOut', params: [] },
                    { name: 'CA EaseInEaseOut', params: [] },
                    { name: 'CA Linear', params: [] }
                ]
            }
        };

        var uiByPlatform = {};
        var curveValues = {};
        var currentPlatform = 'Rive';

        function initializeCurveValues() {
            var platformName;
            var curves;
            var i;
            var j;
            var param;
            for (platformName in platformData) {
                if (!platformData.hasOwnProperty(platformName)) {
                    continue;
                }
                curveValues[platformName] = {};
                curves = platformData[platformName].curves;
                for (i = 0; i < curves.length; i += 1) {
                    curveValues[platformName][curves[i].name] = {};
                    for (j = 0; j < curves[i].params.length; j += 1) {
                        param = curves[i].params[j];
                        curveValues[platformName][curves[i].name][param.key] = param.defaultValue;
                    }
                }
            }
        }

        function getSelectedCurveDef(platformName) {
            var ui = uiByPlatform[platformName];
            var idx;
            if (!ui || !ui.dropdown.selection || ui.dropdown.selection.index === 0) {
                return null;
            }
            idx = ui.dropdown.selection.index - 1;
            return platformData[platformName].curves[idx];
        }

        function updatePreview() {
            var curveDef = getSelectedCurveDef(currentPlatform);
            var lines;
            var params;
            var values;
            var i;

            lines = [];
            lines.push('Platform: ' + currentPlatform);
            if (!curveDef) {
                lines.push('Curve: (none)');
                lines.push('Parameters: -');
            } else {
                lines.push('Curve: ' + curveDef.name);
                params = curveDef.params;
                values = curveValues[currentPlatform][curveDef.name];
                if (!params || params.length === 0) {
                    lines.push('Parameters: none');
                } else {
                    lines.push('Parameters:');
                    for (i = 0; i < params.length; i += 1) {
                        lines.push(' - ' + params[i].label + ': ' + values[params[i].key]);
                    }
                }
            }
            previewText.text = lines.join('\n');
        }

        function clearParamControls(ui) {
            while (ui.paramsPanel.children.length > 0) {
                ui.paramsPanel.remove(ui.paramsPanel.children[0]);
            }
            ui.paramControls = [];
        }

        function buildParameterControls(platformName) {
            var ui = uiByPlatform[platformName];
            var curveDef = getSelectedCurveDef(platformName);
            var hasParams;
            var params;
            var values;
            var i;
            var param;
            var row;
            var label;
            var valueGroup;
            var slider;
            var input;
            var select;
            var minText;
            var maxText;
            var stepDecimals;

            clearParamControls(ui);

            hasParams = curveDef && curveDef.params && curveDef.params.length > 0;
            ui.paramsPanel.visible = hasParams ? true : false;
            refreshLayout();

            if (!hasParams) {
                updatePreview();
                return;
            }

            params = curveDef.params;
            values = curveValues[platformName][curveDef.name];

            for (i = 0; i < params.length; i += 1) {
                param = params[i];

                row = ui.paramsPanel.add('group');
                row.orientation = 'column';
                row.alignChildren = ['fill', 'top'];
                row.spacing = 2;

                label = row.add('statictext', undefined, param.label);
                label.alignment = ['left', 'center'];

                if (param.type === 'dropdown') {
                    select = row.add('dropdownlist', undefined, param.options);
                    select.selection = 0;
                    if (values[param.key] !== undefined) {
                        var k;
                        for (k = 0; k < param.options.length; k += 1) {
                            if (param.options[k] === values[param.key]) {
                                select.selection = k;
                                break;
                            }
                        }
                    }

                    select.onChange = (function (p, s) {
                        return function () {
                            if (!s.selection) {
                                return;
                            }
                            curveValues[platformName][curveDef.name][p.key] = s.selection.text;
                            updatePreview();
                        };
                    }(param, select));

                    ui.paramControls.push({ key: param.key, type: 'dropdown', dropdown: select });
                } else {
                    valueGroup = row.add('group');
                    valueGroup.orientation = 'row';
                    valueGroup.alignChildren = ['fill', 'center'];
                    valueGroup.spacing = 6;

                    minText = valueGroup.add('statictext', undefined, formatNumber(param.min, getDecimals(param.step)));
                    minText.preferredSize = [30, 18];

                    slider = valueGroup.add('slider', undefined, values[param.key], param.min, param.max);
                    slider.preferredSize = [155, 18];

                    maxText = valueGroup.add('statictext', undefined, formatNumber(param.max, getDecimals(param.step)));
                    maxText.preferredSize = [30, 18];

                    input = valueGroup.add('edittext', undefined, formatNumber(values[param.key], getDecimals(param.step)));
                    input.characters = 6;

                    stepDecimals = getDecimals(param.step);

                    slider.onChanging = (function (p, s, e, d) {
                        return function () {
                            var v = roundToStep(s.value, p.step);
                            v = clamp(v, p.min, p.max);
                            curveValues[platformName][curveDef.name][p.key] = parseFloat(formatNumber(v, d));
                            e.text = formatNumber(v, d);
                            updatePreview();
                        };
                    }(param, slider, input, stepDecimals));

                    slider.onChange = (function (p, s, e, d) {
                        return function () {
                            var v = roundToStep(s.value, p.step);
                            v = clamp(v, p.min, p.max);
                            s.value = v;
                            curveValues[platformName][curveDef.name][p.key] = parseFloat(formatNumber(v, d));
                            e.text = formatNumber(v, d);
                            updatePreview();
                        };
                    }(param, slider, input, stepDecimals));

                    input.onChange = (function (p, s, e, d) {
                        return function () {
                            var raw = parseFloat(e.text);
                            var v;
                            if (isNaN(raw)) {
                                raw = curveValues[platformName][curveDef.name][p.key];
                            }
                            v = roundToStep(raw, p.step);
                            v = clamp(v, p.min, p.max);
                            s.value = v;
                            e.text = formatNumber(v, d);
                            curveValues[platformName][curveDef.name][p.key] = parseFloat(formatNumber(v, d));
                            updatePreview();
                        };
                    }(param, slider, input, stepDecimals));

                    ui.paramControls.push({ key: param.key, type: 'slider', slider: slider, input: input });
                }
            }

            refreshLayout();
            updatePreview();
        }

        function buildTabContent(tab, platformName) {
            tab.orientation = 'column';
            tab.alignChildren = ['fill', 'top'];
            tab.spacing = 8;
            tab.margins = 10;

            var curveGroup = tab.add('group');
            curveGroup.orientation = 'column';
            curveGroup.alignChildren = ['fill', 'top'];

            var curveLabel = curveGroup.add('statictext', undefined, 'Curve');
            curveLabel.alignment = ['left', 'top'];

            var curveItems = ['-- Select Curve --'];
            var platformCurves = platformData[platformName].curves;
            var n;
            for (n = 0; n < platformCurves.length; n += 1) {
                curveItems.push(platformCurves[n].name);
            }

            var curveDropdown = curveGroup.add('dropdownlist', undefined, curveItems);
            curveDropdown.selection = 0;

            var paramsPanel = tab.add('panel', undefined, 'Parameters');
            paramsPanel.alignChildren = ['fill', 'top'];
            paramsPanel.preferredSize = [280, 240];
            paramsPanel.visible = false;

            curveDropdown.onChange = function () {
                buildParameterControls(platformName);
                if (platformName === currentPlatform) {
                    updatePreview();
                }
            };

            uiByPlatform[platformName] = {
                dropdown: curveDropdown,
                paramsPanel: paramsPanel,
                paramControls: []
            };
        }

        initializeCurveValues();

        buildTabContent(riveTab, 'Rive');
        buildTabContent(androidTab, 'Android');
        buildTabContent(iosTab, 'iOS');

        var previewPanel = win.add('panel', undefined, 'Curve Preview');
        previewPanel.alignChildren = ['fill', 'top'];
        previewPanel.preferredSize = [300, 150];

        var previewText = previewPanel.add('edittext', undefined, '', { multiline: true, readonly: true });
        previewText.preferredSize = [280, 110];

        var applyButton = win.add('button', undefined, 'Apply to Selected Keyframes');
        applyButton.preferredSize = [300, 30];

        tabs.selection = riveTab;

        tabs.onChange = function () {
            if (!tabs.selection) {
                return;
            }
            currentPlatform = tabs.selection.text;
            updatePreview();
            refreshLayout();
        };

        applyButton.onClick = function () {
            updatePreview();
            alert('Apply action will be implemented in next phase.');
        };

        updatePreview();

        win.onResizing = win.onResize = function () {
            this.layout.resize();
        };

        refreshLayout();

        return win;
    }

    var palette = buildUI();
    if (palette instanceof Window) {
        palette.center();
        palette.show();
    }
}());
