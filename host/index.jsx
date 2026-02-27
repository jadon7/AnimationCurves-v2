// Host-side ExtendScript for After Effects
// This file is called by the CEP panel to apply curves to keyframes

#include "expression-generator.jsx"

// Main function called from CEP panel
function applyAnimationCurve(platform, curveType, params) {
    try {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return JSON.stringify({ success: false, error: 'No active composition' });
        }

        var selectedProps = comp.selectedProperties;
        if (!selectedProps || selectedProps.length === 0) {
            return JSON.stringify({ success: false, error: 'No properties selected' });
        }

        var expressionGenerator = new ExpressionGenerator();
        var appliedCount = 0;

        for (var i = 0; i < selectedProps.length; i++) {
            var prop = selectedProps[i];

            // Check if property can have expressions
            if (!prop.canSetExpression) {
                continue;
            }

            // Check if property has keyframes
            if (!prop.numKeys || prop.numKeys < 2) {
                continue;
            }

            // Get selected keyframes
            var selectedKeys = prop.selectedKeys;
            if (!selectedKeys || selectedKeys.length === 0) {
                continue;
            }

            // Generate expression
            var expression = expressionGenerator.generate(platform, curveType, params, selectedKeys);

            // Apply expression
            prop.expression = expression;
            appliedCount++;
        }

        if (appliedCount === 0) {
            return JSON.stringify({
                success: false,
                error: 'No valid properties found. Please select keyframed properties.'
            });
        }

        return JSON.stringify({
            success: true,
            count: appliedCount
        });

    } catch (err) {
        return JSON.stringify({
            success: false,
            error: err.toString()
        });
    }
}
