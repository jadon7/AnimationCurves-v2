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

        function buildTabContent(tab) {
            tab.orientation = 'column';
            tab.alignChildren = ['fill', 'top'];
            tab.spacing = 8;
            tab.margins = 10;

            var curveGroup = tab.add('group');
            curveGroup.orientation = 'column';
            curveGroup.alignChildren = ['fill', 'top'];

            var curveLabel = curveGroup.add('statictext', undefined, 'Curve');
            curveLabel.alignment = ['left', 'top'];

            var curveDropdown = curveGroup.add('dropdownlist', undefined, ['-- Select Curve --', 'Placeholder Curve']);
            curveDropdown.selection = 0;

            var paramsPanel = tab.add('panel', undefined, 'Parameters');
            paramsPanel.alignChildren = ['fill', 'top'];
            paramsPanel.preferredSize = [280, 240];
            paramsPanel.visible = false;

            var paramRow = paramsPanel.add('group');
            paramRow.orientation = 'row';
            paramRow.alignChildren = ['fill', 'center'];

            var paramSlider = paramRow.add('slider', undefined, 50, 0, 100);
            paramSlider.preferredSize = [180, 20];

            var paramInput = paramRow.add('edittext', undefined, '50');
            paramInput.characters = 5;

            curveDropdown.onChange = function () {
                paramsPanel.visible = curveDropdown.selection && curveDropdown.selection.index > 0;
                refreshLayout();
            };

            return {
                dropdown: curveDropdown,
                paramsPanel: paramsPanel,
                paramSlider: paramSlider,
                paramInput: paramInput
            };
        }

        var riveUI = buildTabContent(riveTab);
        var androidUI = buildTabContent(androidTab);
        var iosUI = buildTabContent(iosTab);
        riveUI.dropdown.selection = 0;
        androidUI.dropdown.selection = 0;
        iosUI.dropdown.selection = 0;

        var previewPanel = win.add('panel', undefined, 'Curve Preview');
        previewPanel.alignChildren = ['fill', 'top'];
        previewPanel.preferredSize = [300, 150];

        var previewText = previewPanel.add('edittext', undefined, 'Preview placeholder', { multiline: true, readonly: true });
        previewText.preferredSize = [280, 110];

        var applyButton = win.add('button', undefined, 'Apply to Selected Keyframes');
        applyButton.preferredSize = [300, 30];

        tabs.selection = riveTab;

        tabs.onChange = function () {
            refreshLayout();
        };

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
