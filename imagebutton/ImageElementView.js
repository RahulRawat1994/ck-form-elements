import {
    FocusCycler,
    View,
    ViewCollection,
    injectCssTransitionDisabler,
    submitHandler,
    FormHeaderView,
    ButtonView
  } from "ckeditor5/src/ui";
  
  import { 
    createTextInput,
    createNumericInput,
    createDropdownInput,
    createSwitchButton,
    createButton
  } from '../utils';
  
  import { FocusTracker, KeystrokeHandler } from "ckeditor5/src/utils";
  import { icons } from "ckeditor5/src/core";
  
  import "@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css";
  import "../theme/ck-form-elements.scss";
  
  export default class ImageElementView extends View {
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
      this.set('fields', fields);
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
        "ck-button-save ck-image-button-save"
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
        "ck-button-cancel ck-image-button-cancel",
        this,
        "cancel" 
      );
  
      /**
       * The fieldset aggregating the Image Info UI.
       */
       this._imageFieldsetView = this._createImageFieldset();
       this._buttonFieldsetView = this._createButtonFieldset();
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
          class: ["ck", "ck-form-element", "ck-image-button-form"],
  
          tabindex: "-1"
        },
  
        children: [
          // new FormHeaderView( locale, {
          //     label: t( 'Image Button Configration' )
          // } ),
          this._imageFieldsetView,
          this._buttonFieldsetView
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
      
      // const formFields = typeof fields === 'object' && !Array.isArray(fields) && fields;

       let formFields ={};
       if(typeof fields === 'object' 
          && fields.info 
          && Object.keys(fields.info).length > 0 ){
            formFields = { ...formFields, ...fields.info }
       }
       if(typeof fields === 'object' 
        && typeof fields.advanced === 'object' 
        && Object.keys(fields.advanced).length > 0 ){
          formFields = { ...formFields, ...fields.advanced }
       } 
       
       const formdata = {}
       Object.keys(formFields).map(k => { formdata[k] = ''});
       
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
             if(formFields[key].readonly){
              this.formfields[key].fieldView.isReadOnly = true;
             }
             break;
           case "numeric":
             this.formfields[key] = createTextInput(
               this.locale, 
               t(label),  
               formFields[key].class,
               (value) =>  this._updateAndValidateValue(key, value, formFields[key])
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
      submitHandler({ view: this });
  
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
    _updateAndValidateValue(key, value, field){
      this._setFormdata(key,value)
      this.formfields[key].errorText = ''
      if ( value && !(/^[0-9]*$/.test(value)) ) {
        this.formfields[key].errorText = 'Only numeric values allowed' 
      } else if (value > field.max || parseInt(value) < field.min ) {
        this.formfields[key].errorText = `Please enter in between ${field.min} to ${field.max}` 
      } 
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
          this.formdata[key] = null;
          this.formfields[key].fieldView.element.dispatchEvent(new Event('input', {bubbles:true}));
        }
        this.formfields[key].errorText = null;
        this.formfields[key].infoText = " ";
      });
    }

    _createImageFieldset(){
      const locale = this.locale;
		  const fieldsetView = new View( locale );

      const createTabButton = (locale, label, className, callback) => {
        const button = new ButtonView(locale);
      
        button.set({
          label,
          tooltip: true,
          withText: true,
        });
      
        button.extendTemplate({
          attributes: {
            class: className
          }
        });
      
        if (callback) {
          button.on( 'execute', () => {
            callback()
          });
        }
      
        return button;
      };
      const clickInfoBtn = () =>{
        const infoPanel = this._imageFieldsetView.template.children[1].element
        const advancedPanel = this._imageFieldsetView.template.children[2].element
        infoPanel.setAttribute("style","display: block;");
        advancedPanel.setAttribute("style","display: none;");
        this._imageFieldsetView.element.querySelectorAll('.ck-image-button-tab__link')[0].classList.add('active')
        this._imageFieldsetView.element.querySelectorAll('.ck-image-button-tab__link')[1].classList.remove('active')
      }
      const clickAdvanceBtn = () =>{
        const infoPanel = this._imageFieldsetView.template.children[1].element
        const advancedPanel = this._imageFieldsetView.template.children[2].element
        infoPanel.setAttribute("style","display: none;");
        advancedPanel.setAttribute("style","display: flex;flex-direction:column");
        this._imageFieldsetView.element.querySelectorAll('.ck-image-button-tab__link')[0].classList.remove('active')
        this._imageFieldsetView.element.querySelectorAll('.ck-image-button-tab__link')[1].classList.add('active')
       
      }
      const infoTabBtn = createTabButton(
        locale,
        "Image Info",
        "ck-image-button-tab__link active",
        clickInfoBtn
      );
      const advancedTabBtn = createTabButton(
        locale,
        "Advanced",
        "ck-image-button-tab__link",
        clickAdvanceBtn
      )
      
      
      fieldsetView.setTemplate( {
        tag: 'div',
        attributes: {
          class: [ 'ck', 'ck-image-button-form-content' ]
        },
        children: [
          {
            tag: 'div',
            attributes:{
              class: ['ck-image-button-tab']
            },
            children: [
              infoTabBtn,
              advancedTabBtn
            ]
          },
          this._createImageInfoFieldset(),
          this._createAdvancedFieldset(), 

        ]
      } );
      return fieldsetView;
    }
    _createImageInfoFieldset(){
      const locale = this.locale;
		  const fieldsetView = new View( locale );

      let infoFields =  [];
      if(this.formfields){
        infoFields = Object.keys(this.formfields)
        .filter((key) => Object.keys(this.fields.info).includes(key))
        .map(key => this.formfields[key]);
      }
      fieldsetView.setTemplate( {
        tag: 'fieldset',
        attributes: {
          class: [ 'ck', 'ck-image-button-form__info' ]
        },
        children: [
          ...infoFields,
          {
            tag:'div',
            attributes:{
              class: 'ck-image-button-form__preview'
            }
          }
        ]
      } );
  
      return fieldsetView;
    }

    _createAdvancedFieldset(){
      const locale = this.locale;
		  const fieldsetView = new View( locale );
      let advancedFields =  []
      if(this.formfields){
        advancedFields = Object.keys(this.formfields)
        .filter((key) => Object.keys(this.fields.advanced).includes(key))
        .map(key => this.formfields[key]);
      }
      fieldsetView.setTemplate( {
        tag: 'fieldset',
        attributes: {
          class: [ 'ck', 'ck-image-button-form__advanced  ck-form-element-hidden' ]
        },
        children: [
          ...advancedFields
        ]
      } );
  
      return fieldsetView;
    }

    _createButtonFieldset(){
      const locale = this.locale;
		  const fieldsetView = new View( locale );

      fieldsetView.setTemplate( {
        tag: 'fieldset',
        attributes: {
          class: [ 'ck', 'ck-image-info-form__button' ]
        },
        children: [
          this.saveButtonView,
          this.cancelButtonView
        ]
      } );
  
      return fieldsetView;
    }
  
  }