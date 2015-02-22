function common() {
    return {

        observable: function(target, eventName) {
            eventName = (eventName === undefined ? "onUpdate" : eventName);
            var listeners = [];
            target[eventName] = function(newListeners) {
                if (_.isArray(newListeners)) listeners = newListeners;
                else listeners = [newListeners];
            };
            return function(update) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i](update);
                }
            };
        },

        extendCopyOf: function(object, updatedObject) {
            return _.extend({}, object, updatedObject);
        },

        newHashSet: function(keyFunction) {
            var it = {};
            it.add = function(value) {
                it[keyFunction(value)] = value;
                return it;
            };
            it.addAll = function(values) {
                values.forEach(function(value) {
                    it.add(value);
                });
                return it;
            };
            it.contains = function(value) {
                return it[keyFunction(value)] !== undefined;
            };
            it.contain = function(value) {
                return it.contains(value);
            };
            return it;
        },

        offsetTop: function(element) {
            if (_.isArray(element)) element = element[0][0];
            return pageYOffset + element.getBoundingClientRect().top;
        },
        offsetLeft: function(element) {
            if (_.isArray(element)) element = element[0][0];
            return pageXOffset + element.getBoundingClientRect().left;
        },
        offsetHeight: function(element) {
            if (_.isArray(element)) element = element[0][0];
            return element.getBoundingClientRect().height;
        },
        offsetWidth: function(element) {
            if (_.isArray(element)) element = element[0][0];
            return element.getBoundingClientRect().width;
        },

        styleWidthOf: function(element) {
            return parseInt(element.style("width"));
        },

        removeChildrenOf: function(element) {
            element.selectAll("*").remove();
            return element;
        },

        newControlsPanel: function(root, uiConfig) {
            var panelRoot = root.append("div").style({
                width: uiConfig.width + "px", height: 20 + "px"
            }).attr("class", "controlPanel");

            var placeholderWidth = (uiConfig.margin === undefined ? 0 : uiConfig.margin.left);
            var leftFooter = panelRoot.append("div")
                .style({ float: "left", display: "block", "margin-left": placeholderWidth + "px"})
                .attr("class", "panelWithControls");

            var it = panelRoot.append("div").style({float: "right"}).attr("class", "panelWithControls");

            it.leftFooter = function() {
                return leftFooter;
            };
            return it;
        },

        newCheckBox: function(root, label, callback) {
            var span = root.append("span");
            span.append("label").html(label + "&nbsp;");
            span.append("input").attr("type", "checkbox").on("click", function() {
                callback(this.checked);
            });
        },

        newDropDown: function(root, label, optionLabels, getSelectedIndex, onChange) {
            var span = root.append("span");
            span.append("label").html(label + "&nbsp;");
            var dropDown = span.append("select");
            for (var i = 0; i < optionLabels.length; i++) {
                dropDown.append("option").attr("value", i).html(optionLabels[i]);
            }

            dropDown.on("change", function() {
                onChange(this.value)
            });

            var it = {};
            it.update = function(update) {
                dropDown[0][0].selectedIndex = getSelectedIndex(update);
                return it;
            };
            return it;
        },

        helpDescription: function(title, text) {
            return "<strong>" + title + "</strong><br/>" + text;
        },

        addHelpButton: function(root, svgRoot, uiConfig, helpText, helpDescription, settings) {
            if (settings === undefined) settings = {};
            if (settings.tooltipCss === undefined) settings.tooltipCss = "helpTooltip";
            if (settings.buttonCss === undefined) settings.buttonCss = "helpButton";
            if (settings.tooltipPad === undefined) settings.tooltipPad = 0;

            var helpButtonImage = "iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAYAAACpSkzOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAATZJREFUeNq8VtERwiAMLZ7/skFxAusGHaEjMIIjOEJH6AgdoSPUCWSEboCkBg/RQqBa7t6V6+XlQUgITGtdUAZjTJiP8H4rw1ckByC0BHTcgkMwXYBCGxH0tSDAkawTARxOEjKjMhgzRCyAWwWFUGRaIWIx+WJ+uMYfiLg749+EYmfSGTSYIALnfezM3oSQGCLIQGbKCFe4QqHdDJ7j2k9lsIntyhqG6uTiOOycwxbO/2uozsBmjxVfBmq6NjYc502RPkrUmEORmlHSC52K2Nc5QjKjuJOFRu8epBa33CXGe3DmkNYHIk8xXNmdSLhhkdrEOBF5R+phrsGc3jZ0PXFlZ0NiAJgTOf2r8RGuIP00/bh+KDsSqZdqjlCb2yYqr4bS28RmjW/TVr7p4+Rfzy221QPyIcAAaxoAnJVfnkgAAAAASUVORK5CYII=";

            var tooltipIsVisible = false;
            var tooltip = root.append("div")
                .html(helpText)
                .attr("class", settings.tooltipCss)
                .style({opacity: 0.0, position: "absolute"});

            root.append("img")
                .attr("src", 'data:image/png;base64,' + helpButtonImage)
                .attr("class", settings.buttonCss)
                .on("click", function() {
                    if (!tooltipIsVisible) {
                        tooltip.style({opacity: 1.0})
                            .style("left", (offsetLeft(svgRoot) + uiConfig.margin.left + settings.tooltipPad) + "px")
                            .style("width", (uiConfig.width / 3) + "px")
                            .style("pointer-events", "auto");
                        tooltip.style("top", (offsetTop(svgRoot) + offsetHeight(svgRoot) - offsetHeight(tooltip) - settings.tooltipPad) + "px");
                    } else {
                        tooltip.style({opacity: 0, "pointer-events": "none"});
                    }
                    tooltipIsVisible = !tooltipIsVisible;
                });

            if (helpDescription !== undefined) {
                root.append("div")
                    .style({color: "#999", display: "inline-block", "vertical-align": "middle"})
                    .html(helpDescription);
            }
        }
    };
}
