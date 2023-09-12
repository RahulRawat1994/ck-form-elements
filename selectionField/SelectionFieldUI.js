import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { createDropdown } from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import SelectionElementView from "./SelectionElementView";
import SelectionFieldEditing from "./SelectionFieldEditing";
import { getSvgContent } from "../utils";
import fieldIcon from "../theme/icons/dropdown.svg";

export default class SelectionElementUI extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [SelectionFieldEditing];
  }

  constructor(editor) {
    super(editor);
    this.className = "selection-button";
    this.command = editor.plugins.get(SelectionFieldEditing).command;
    this.label = editor.plugins.get(SelectionFieldEditing).label;
    this.fields = editor.plugins.get(SelectionFieldEditing).fields;
    this.fieldIcon = fieldIcon;
  }

  /**
   * @inheritDoc
   */
  async init() {
    const editor = this.editor;
    const command = editor.commands.get(this.command);
    const svgIcon = await getSvgContent(this.fieldIcon);
    editor.ui.componentFactory.add(this.command, locale => {
      const dropdown = createDropdown(locale);

      const form = new SelectionElementView(
        this.getFormValidators(editor.t),
        editor.locale,
        this.fields
      );

      this._setUpDropdown(dropdown, form, command, svgIcon, this.className);
      this._setUpForm(dropdown, form, command);

      return dropdown;
    });
  }

  /**
   * @private
   * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
   * @param {module:ui/view~View} form
   * @param {module:HiddenFieldCommand} command
   */
  async _setUpDropdown(dropdown, form, command, svgIcon = "", className = "") {
    const editor = this.editor;
    const t = editor.t;
    // Bind button model to command.
    dropdown.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
    const button = dropdown.buttonView;

    dropdown.panelView.children.add(form);

    button.set({
      class: className,
      label: t(this.label),
      withText: !svgIcon,
      icon: svgIcon || undefined,
      tooltip: true
    });

    // Note: Use the low priority to make sure the following listener starts working after the
    // default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
    // invisible form/input cannot be focused/selected.
    button.on(
      "open",
      () => {
        form.disableCssTransitions();

        // Make sure that each time the panel shows up, the fields remains in sync with the value of
        // the command. If the user typed in the input, then canceled and re-opened it without changing
        // the value of the media command (e.g. because they didn't change the selection),they would
        // see the old value they would see the old value instead of the actual value of the command.

        Object.keys(form.formfields).map(key => {
          if (
            form.formfields[key].fieldView &&
            form.formfields[key].fieldView.element
          ) {
            form.formfields[key].fieldView.element.value = command.value
              ? command.value[key] || ""
              : "";
          }
          form.formdata[key] = command.value ? command.value[key] : null;

          if (
            form.formfields[key].fieldView &&
            form.formfields[key].fieldView.buttonView &&
            form.formdata[key]
          ) {
            // In case of dropdown
            const selectedOpt = this.fields[key].options.find(
              opt => opt.key === form.formdata[key]
            );
            form.formfields[key].label =
              (selectedOpt && selectedOpt.text) || form.formdata[key];
          }
          if(form.formfields[key].toggleSwitchView){
            form.formfields[key].set({isOn:  command.value? !!command.value[key] : false || false})
          }
          form.formfields[key].fieldView &&
            form.formfields[key].fieldView.element.dispatchEvent(
              new Event("input", { bubbles: true })
            );
        });
        form.options =[... command.value.options];
        const valueOption = form.options.find(o => o.selected);
        if(valueOption){
          form.formfields['value'].fieldView.element.value = valueOption.value;
          form.formfields['value'].fieldView.element.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        }
        form.modifyOption.element.classList.add('d-none')
        form.submitOption.element.classList.remove('d-none')
        form.refreshOptions();
        form.focus();
        form.enableCssTransitions();
      },
      { priority: "low" }
    );

    dropdown.on("submit", async () => {
      if (await form.isValid()) {
        editor.execute(this.command, form.formdata, form.options);
        closeUI();
      }
    });

    dropdown.on("change:isOpen", () => form.resetFormStatus());
    dropdown.on("cancel", () => closeUI());

    function closeUI() {
      editor.editing.view.focus();
      dropdown.isOpen = false;
    }
  }

  /**
   * @private
   * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
   * @param {module:ui/view~View} form
   * @param {module:media-embed/mediaembedcommand~MediaEmbedCommand} command
   */
  _setUpForm(dropdown, form, command) {
    form.delegate("submit", "cancel").to(dropdown);
    Object.keys(form.formfields).map(key => {
      form.formfields[key].bind("value").to(command, "value");
      // Form elements should be read-only when corresponding commands are disabled.
      form.formfields[key]
        .bind("isReadOnly")
        .to(command, "isEnabled", value => !value);
    });
  }

  /**
   * Setup validation for form
   * @param {Object} t
   * @returns {Object}
   */
  getFormValidators(t) {
    return [
      async form => {
        if (!form.formdata.name || !form.formdata.name.length) {
          return { field: "name", message: t("The name must not be empty.") };
        }
      },
      async form => {
				if ( form.formdata.size && !(/^[0-9]*$/.test(form.formdata.size)) ) {
					return {field: 'size', message: t( 'Only numeric values allowed' )}
				} 
			},
    ];
  }
}
