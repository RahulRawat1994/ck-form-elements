import {
  FocusCycler,
  View,
  ViewCollection,
  injectCssTransitionDisabler,
  submitHandler
} from "ckeditor5/src/ui";

import { 
  createTextInput,
  createNumericInput,
  createDropdownInput,
  createSwitchButton,
  createButton
} from './utils';

import { FocusTracker, KeystrokeHandler } from "ckeditor5/src/utils";
import { icons } from "ckeditor5/src/core";

import "@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css";
import "./theme/ck-form-elements.scss";

export default class FormElementView extends View {
  constructor(validators, locale, fields) {
    super(locale);

    const t = locale.t;

    /**
     * Tracks information about the DOM focus in the form.
     *
     * @readonly
     * @member {module:utils/focustracker~FocusTracker}
     */
    this.focusTracker = new FocusTracker();

    /**
     * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
     *
     * @readonly
     * @member {module:utils/keystrokehandler~KeystrokeHandler}
     */
    this.keystrokes = new KeystrokeHandler();

    /**
     * The formfields input view.
     *
     * @member {module:ui/labeledfield/labeledfieldview~LabeledFieldView}
     */
    this.set('formfields',{}) 
    this._createFormFields(fields, t)
    
    /**
     * The Save button view.
     *
     * @member {module:ui/button/buttonview~ButtonView}
     */
    this.saveButtonView = createButton(
      this.locale,
      t("Save"),
      icons.check,
      "ck-button-save"
    );
    this.saveButtonView.type = "submit";
   // this.saveButtonView.bind( 'isEnabled' ).to( this, 'isFormEnabled', value => !!value );

    /**
     * The Cancel button view.
     *
     * @member {module:ui/button/buttonview~ButtonView}
     */
    this.cancelButtonView = createButton(
      this.locale,
      t("Cancel"),
      icons.cancel,
      "ck-button-cancel",
      this,
      "cancel" 
    );

    /**
     * A collection of views that can be focused in the form.
     *
     * @readonly
     * @protected
     * @member {module:ui/viewcollection~ViewCollection}
     */
    this._focusables = new ViewCollection();

    /**
     * Helps cycling over {@link #_focusables} in the form.
     *
     * @readonly
     * @protected
     * @member {module:ui/focuscycler~FocusCycler}
     */
    this._focusCycler = new FocusCycler({
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate form fields backwards using the <kbd>Shift</kbd> + <kbd>Tab</kbd> keystroke.
        focusPrevious: "shift + tab",

        // Navigate form fields forwards using the <kbd>Tab</kbd> key.
        focusNext: "tab"
      }
    });

    /**
     * An array of form validators used by {@link #isValid}.
     *
     * @readonly
     * @protected
     * @member {Array.<Function>}
     */
    this._validators = validators;

    this.setTemplate({
      tag: "form",

      attributes: {
        class: ["ck", "ck-form-element"],

        tabindex: "-1"
      },

      children: [
        ...Object.values(this.formfields),
        this.saveButtonView,
        this.cancelButtonView
      ]
    });

    injectCssTransitionDisabler(this);

  }

  /**
   * Create the form field 
   * @param {Object} fields contain fields details label, class, fieldview
   * @private
   */
  _createFormFields(fields,t){
    
     const formFields = typeof fields === 'object' && !Array.isArray(fields) && fields;
     const formdata = {}
     Object.keys(formFields).map(k => { formdata[k] = null});
    /**
		 * Set value of the formdata
		 */
     this.set( 'formdata', formdata );
     /**
      * Set value of isFormEnabled 
      * if isFormEnabled is false than save button will be disabled
      */
     this.set( 'isFormEnabled', false)
     /**
      * loop for creating form element based on type i.e text, numeric etc.
      * all the form field store in this.formfield object 
      */
     formFields && Object.keys(formFields).map(key => {
       const label = formFields[key].label || key || "";
       switch (formFields[key].fieldView) {
         case "text":
           this.formfields[key] = createTextInput(
             this.locale, 
             t(label), 
             formFields[key].class,
             (value) => this._setFormdata(key,value) 
           );
           break;
         case "numeric":
           this.formfields[key] = createNumericInput(
             this.locale, 
             t(label),  
             formFields[key].class,
             (value) => this._setFormdata(key,value)
           );
           break;
         case "dropdown":
           this.formfields[key] = createDropdownInput(
             this.locale,
             t(label),
             formFields[key].options,
             formFields[key].class,
             (value) => this._setFormdata(key,value)
           );
           
           break;
         case "switch":
           this.formfields[key] = createSwitchButton(
             this.locale, 
             t(label), 
             formFields[key].class,
             (value) => this._setFormdata(key,value)
           )
         default:
           break;
       }
     });

  }

  /**
   * Render form in ck toolbar 
   */
  render() {
    super.render();

    submitHandler({
      view: this
    });

    const childViews = [
      ...Object.values(this.formfields),
      this.saveButtonView,
      this.cancelButtonView
    ];

    childViews.forEach(v => {
      // Register the view as focusable.
      this._focusables.add(v); 

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });

    // Start listening for the keystrokes coming from #element.
    this.keystrokes.listenTo(this.element);

    const stopPropagation = data => data.stopPropagation();

    // Since the form is in the dropdown panel which is a child of the toolbar, the toolbar's
    // keystroke handler would take over the key management in the URL input. We need to prevent
    // this ASAP. Otherwise, the basic caret movement using the arrow keys will be impossible.
    this.keystrokes.set("arrowright", stopPropagation);
    this.keystrokes.set("arrowleft", stopPropagation);
    this.keystrokes.set("arrowup", stopPropagation);
    this.keystrokes.set("arrowdown", stopPropagation);

    // Intercept the `selectstart` event, which is blocked by default because of the default behavior
    // of the DropdownView#panelView.
    // TODO: blocking `selectstart` in the #panelView should be configurable per–drop–down instance.
    Object.values(this.formfields).map(field => {
      this.listenTo(
        field.element,
        "selectstart",
        (evt, domEvt) => {
          domEvt.stopPropagation();
        },
        { priority: "high" }
      );
    });
  }

  /**
   * @inheritDoc
   */
  destroy() {
    super.destroy();

    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  /**
   * Focuses the fist {@link #_focusables} in the form.
   */
  focus() {
    this._focusCycler.focusFirst();
  }

  /**
   * Assign value to formdata 
   * @param {String} Key -> like name, value etc.
   * @param {value} value -> attribute value 
   * @private
   */
  _setFormdata(key, value){
    
    if (!key) return;
    this.formdata[key] = value;
    this.isFormEnabled = !Object.values(this.formdata).filter(v => !v).length;
  }

  /**
   * Validates the form and returns `false` when some fields are invalid.
   *
   * @returns {Boolean}
   */
  async isValid() {


    let  errors =  this._validators.map(async validator =>{
      const error = await validator(this);
      // One error per field is enough.
      if (error) {
        // Apply updated error.
				this.formfields[error.field].errorText = (typeof error === 'object') && error.message
        return error
      }
    });
    errors = await Promise.all(errors)
    return !!(errors.filter(t => t).length == 0);
  }

  /**
   * Cleans up the supplementary error and information text of the view
   * bringing them back to the state when the form has been displayed for the first time.
   *
   * See {@link #isValid}.
   */
  resetFormStatus() {
    Object.keys(this.formfields).map(key => {
    
      if(this.formfields[key].type === 'button'){
        // For switch button casae
        const values = this.formfields[key].value;
        values && this.formfields[key].set({isOn:  values.checked ===true})
      }
      else if(this.formfields[key].fieldView && this.formfields[key].fieldView.buttonView){
        this.formfields[key].label = key.charAt(0).toUpperCase() + key.slice(1);;
        this.formfields[key].fieldView.element.value = '';
        this.formdata[key] = null;
      }
      else if(this.formfields[key].fieldView && this.formfields[key].fieldView.element){
        this.formfields[key].fieldView.element.value = '';
        this.formfields[key].fieldView.element.dispatchEvent(new Event('input', {bubbles:true}));
        this.formdata[key] = null;
      }
      this.formfields[key].errorText = null;
      this.formfields[key].infoText = "";
    });
  }

}