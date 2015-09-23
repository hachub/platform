define(function(require) {
    'use strict';

    var ChoiceBusinessUnitFilter;
    var _ = require('underscore');
    var TextFilter = require('oro/filter/choice-filter');
    var $ = require('jquery');
    var routing = require('routing');
    var tools = require('oroui/js/tools');

    /**
     * Number filter: formats value as a number
     *
     * @export  oro/filter/number-filter
     * @class   oro.filter.NumberFilter
     * @extends oro.filter.ChoiceFilter
     */
    ChoiceBusinessUnitFilter = TextFilter.extend({
        templateSelector: '#choice-business-unit-template',

        events: {
            'keyup input': '_onReadCriteriaInputKey',
            'keydown [type="text"]': '_preventEnterProcessing',
            'click .filter-update': '_onClickUpdateCriteria',
            'click .filter-criteria-selector': '_onClickCriteriaSelector',
            'click .filter-criteria .filter-criteria-hide': '_onClickCloseCriteria',
            'click .disable-filter': '_onClickDisableFilter',
            'click .choice-value': '_onClickChoiceValue',
            'click .reset-filter': '_onClickResetFilter',
            'change input[type="checkbox"]': '_onChangeBusinessUnit'
        },

        /**
         * Initialize.
         *
         * @param {Object} options
         */
        initialize: function(options) {
            var self = this;
            if (!self.businesUnit) {
                $.ajax({
                    url: routing.generate('oro_business_unit_list'),
                    success: function (reposne) {
                        self.businesUnit = reposne;

                    },
                    error: function (jqXHR) {
                        //messenger.showErrorMessage(__('Sorry, unexpected error was occurred'), jqXHR.responseJSON);
                    }
                });
            }
            ChoiceBusinessUnitFilter.__super__.initialize.apply(this, arguments);
        },

        /**
         * @inheritDoc
         */
        _renderCriteria: function() {
            var value = _.extend({}, this.emptyValue, this.value);
            var selectedChoiceLabel = '';

            if (!_.isEmpty(this.choices)) {
                var foundChoice = _.find(this.choices, function(choice) {
                    return (choice.value === value.type);
                });

                if (foundChoice) {
                    selectedChoiceLabel = foundChoice.label;
                }
            }

            var $filter = $(this.template({
                name: this.name,
                choices: this.choices,
                selectedChoice: value.type,
                selectedChoiceLabel: selectedChoiceLabel,
                value: value.value
            }));
            var list = this._getListTemplate(this.businesUnit);
                $filter.find('.list').html(list);

            this._appendFilter($filter);

            this._updateDOMValue();

            this._criteriaRenderd = true;
        },

        _getListTemplate: function(businessUnit) {
            var self = this;
            var template;
            var response = [];
            $.each(businessUnit, function (key, value) {
                if (!value['owner_id']) {
                    response.push({
                        value: value,
                        children: []
                    });
                }
            });

            $.each(response, function(key1, value1) {
                response[key1]['children'] = self.findChild(value1, businessUnit);
            });

            template = this.getTemplate(response);
            return template;
        },

        getTemplate: function(items) {
            var self = this;
            var template = '<ul>';
            $.each(items, function(key, value) {
                template += '<li>' + '<label for="business-unit-' + value.value.id + '"><input id="business-unit-' + value.value.id + '" value="' + value.value.id + '" type="checkbox">' + value.value.name + '</label>';
                if (value.children.length > 0) {
                    template += self.getTemplate(value.children);
                }
                template += '</li>';
            });
            template += '</ul>';

            return template;
        },

        findChild: function(item, businessUnit) {
            var self = this;
            var responce = [];
            var value = item.value;

            $.each(businessUnit, function(key1, value1) {
                if (value1['owner_id'] === value['id']) {
                    responce.push({
                        value: value1,
                        children: []
                    });
                }
            });

            if (responce.length > 0) {
                $.each(responce, function(key1, value1) {
                    responce[key1]['children'] = self.findChild(value1, businessUnit);
                });
            }

            return responce;
        },

        _onChangeBusinessUnit: function(e) {
            var values = [];
            $.each(this.$el.find('input:checked'), function(key, value) {
                values.push($(this).val());
            });

            values = values.join(',');
            this.setValue({value: values});
        },

        /**
         * Set raw value to filter
         *
         * @param value
         * @return {*}
         */
        setValue: function(value) {
            var oldValue = this.value;
            this.value = tools.deepClone(value);
            this._updateDOMValue();

            return this;
        },

        _onClickUpdateCriteria: function() {
            ChoiceBusinessUnitFilter.__super__._onClickUpdateCriteria.apply(this, arguments);
            this.trigger('update');
            this._updateCriteriaHint();
        },

        /**
         * @inheritDoc
         */
        _getCriteriaHint: function() {
            var value = (arguments.length > 0) ? this._getDisplayValue(arguments[0]) : this._getDisplayValue();
            var option = null;

            if (!value.value) {
                return this.placeholder;
            }
            var hintValue = this.wrapHintValue ? ('"' + value.value + '"') : value.value;

            return (option ? option.label + ' ' : '') + hintValue;
       }
    });

    return ChoiceBusinessUnitFilter;
});
