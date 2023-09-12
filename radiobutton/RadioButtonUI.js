import RadioButtonEditing from "./RadioButtonEditing";
import FormElementUI from "../FormElementUI";
import fieldIcon from '../theme/icons/radio-button.svg';

export default class RadioButtonUI extends FormElementUI {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [RadioButtonEditing];
  }

  constructor(editor) {
    super(editor);

    this.command = editor.plugins.get(RadioButtonEditing).command;
    this.label = editor.plugins.get(RadioButtonEditing).label;
    this.fields = editor.plugins.get(RadioButtonEditing).fields;
    this.fieldIcon = fieldIcon;
  }

  /**
   * Setup validation for form
   * @param {Object} t
   * @returns {Array<Functions>}
   */
  getFormValidators(t) {
    return [
      async (form) => {
        if (!form.formdata.name || !form.formdata.name.length) {
          return { field: "name", message: t("The name must not be empty.") };
        }
      },
      async (form) => {
        if (!form.formdata.value || !form.formdata.value.length) {
          return { field: "value", message: t("The value must not be empty.") };
        }
      },
    ];
  }
}
