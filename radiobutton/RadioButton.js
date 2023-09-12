import RadioButtonEditing from "./RadioButtonEditing";
import RadioButtonUI from "./RadioButtonUI.js";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";

export default class RadioButton extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [RadioButtonEditing, RadioButtonUI, Widget];
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "RadioButton";
  }
}
