define(['jquery'], function($) {
    'use strict';

    /**
     * @export  oroform/js/optional-validation-handler
     * @class   OptionalValidationHandler
     */
    return {
        /**
         * @param  {jQuery}  $group Optional validation elements group
         */
        initialize: function($group) {
            const labels = this.getGroupElements($group, $group.find('label[data-required]'));
            labels.addClass('required').attr('aria-required', true);

            const labelAsterisk = labels.find('em');
            labelAsterisk.html('*');

            if (this.isGroupEmpty($group)) {
                labelAsterisk.hide();
            } else {
                labelAsterisk.show();
                $group.data('group-validation-required', true);
            }
        },

        isGroupEmpty: function($group) {
            return !(this.hasNotEmptyDescendantGroup($group) || this.hasNotEmptyInput($group) ||
                this.hasNotEmptySelect($group));
        },

        /**
         * @param {jQuery} $group
         * @returns {boolean}
         */
        hasNotEmptyDescendantGroup: function($group) {
            return $group.find('[data-validation-optional-group][data-group-validation-required]').length > 0;
        },

        /**
         * @param {jQuery} $group
         * @returns {boolean}
         */
        hasNotEmptyInput: function($group) {
            const elementsSelector = [
                'textarea',
                'input[type!="checkbox"][type!="radio"][type!="button"][data-required]',
                'input[type="radio"][data-required]:checked',
                'input[type="checkbox"][data-required]:checked'
            ].join(', ');

            const checkedElements = this.getGroupElements($group, $group.find(elementsSelector));
            for (let i = 0; i < checkedElements.length; i++) {
                if (!this.isValueEmpty($(checkedElements[i]).val())) {
                    return true;
                }
            }

            return false;
        },

        /**
         * @param {jQuery} $group
         * @returns {boolean}
         */
        hasNotEmptySelect: function($group) {
            const elements = this.getGroupElements($group, $group.find('select'));
            for (let i = 0; i < elements.length; i++) {
                if (!this.isValueEmpty($(elements[i]).find('option:selected').val())) {
                    return true;
                }
            }

            return false;
        },

        /**
         * @param  {jQuery}  $group   Optional validation elements group
         * @param  {jQuery}  $element Changed Element
         *
         * @return {boolean} Should parent OptionalValidationHandler be called
         */
        handle: function($group, $element) {
            const tagName = $element.prop('tagName').toLowerCase();

            switch (tagName) {
                case 'select':
                    this.selectHandler($group, $element);
                    break;
                case 'textarea':
                case 'input':
                    this.inputHandler($group, $element);
                    break;
            }

            return true;
        },

        /**
         * @param {jQuery} $group   Optional validation elements group
         * @param {jQuery} $element Changed Element
         */
        inputHandler: function($group, $element) {
            this.handleGroupRequire($group, $element.val());
        },

        /**
         * @param {jQuery} $group   Optional validation elements group
         * @param {jQuery} $element Changed Element
         */
        selectHandler: function($group, $element) {
            this.handleGroupRequire($group, $element.find('option:selected').val());
        },

        /**
         * @param {jQuery}           $group Optional validation elements group
         * @param {string|undefined} value  Changed Element value
         */
        handleGroupRequire: function($group, value) {
            if (this.isValueEmpty(value) && this.isGroupEmpty($group)) {
                $group
                    .find('label[data-required]')
                    .removeAttr('aria-required')
                    .find('em')
                    .hide();
                this.clearValidationErrorsAndDisableValidation($group);
                $group.data('group-validation-required', false);
            } else {
                $group
                    .find('label[data-required]')
                    .attr('aria-required', true)
                    .find('em')
                    .show();
                const inputs = this.getGroupElements($group, $group.find('input, select, textarea'));
                inputs.data('ignore-validation', false);
                $group.data('group-validation-required', true);
            }
        },

        /**
         * @param {string|undefined} value
         * @returns {boolean}
         */
        isValueEmpty: function(value) {
            value = value ? $.trim(value) : '';
            return !value;
        },

        /**
         * @param {jQuery} $group
         */
        clearValidationErrorsAndDisableValidation: function($group) {
            const validator = $group.validate();
            const inputs = this.getGroupElements($group, $group.find('input, select, textarea'));
            inputs.data('ignore-validation', true);
            inputs.each(
                function(key, element) {
                    validator.hideElementErrors($(element));
                }
            );
        },

        /**
         * @param {jQuery} $group
         * @param {jQuery} $elements
         *
         * @return {jQuery}
         */
        getGroupElements: function($group, $elements) {
            $elements.filter(function(key, element) {
                return $(element).closest('[data-validation-optional-group]').get(0) === $group.get(0);
            });

            return $elements;
        }
    };
});
