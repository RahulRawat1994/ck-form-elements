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
  } from '../utils';
  
  import { FocusTracker, KeystrokeHandler } from "ckeditor5/src/utils";
  import { icons } from "ckeditor5/src/core";
  
  import "@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css";
  import "../theme/ck-form-elements.scss";
  
  export default class SelectionElementView extends View {
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
          class: ["ck", "ck-form-element", "ck-selection-field-form"],
  
          tabindex: "-1"
        },
  
        children: [
         this._createSelectAttributeView(),
         this._createOptionView(),
         this._createButtonView()
        ]
      });
  
      injectCssTransitionDisabler(this);
  
    }

    _createSelectAttributeView(){
        const locale = this.locale;
        const fieldsetView = new View( locale );
        fieldsetView.setTemplate( {
            tag: 'div',
            attributes: {
                class: [ 'ck', 'ck-selection-field-form-content' ]
            },
            children: [
                ...Object.values(this.formfields),
            ]
        } );
        return fieldsetView;
    }

    _createOptionView(){
        const locale = this.locale;
        const fieldsetView = new View( locale );
        this.options = [];
        const textInput = createTextInput(
            locale, 
            locale.t('Text'),
            'col-5'
        );

        const valueInput = createTextInput(
            locale, 
            locale.t('Value'),
            'col-5 ml-2'
        );

        const submitOption = createButton(
            locale,
            locale.t("Add"),
            null,
            "ck-button-option col-2 mdi mdi-plus-circle ",
        );
        const modifyOption = createButton(
            locale,
            locale.t("Edit"),
            null,
            "ck-button-option ck-button-option-modify col-2 mdi mdi-pencil d-none",
        );
        this.textInput = textInput;
        this.valueInput = valueInput;
        this.submitOption = submitOption;
        this.modifyOption = modifyOption;
        this.refreshOptions = () =>{
            
            if(textInput.fieldView.element.value || valueInput.fieldView.element.value ){
                this.options.push({
                    text: textInput.fieldView.element.value || '',
                    value: valueInput.fieldView.element.value || ''
                })
                textInput.fieldView.element.value = ''
                valueInput.fieldView.element.value = ''
            }
            const optionHtml = this.options.length ? this.options.reduce((str, opt, i)=>{
                return str + `
                    <div class="row">
                        <div class="col-1"  data-index="${i}">
                        <i class="v-icon mdi mdi-radiobox-${opt.selected ? 'marked' :'blank'}  ck-select-option" title="Set Default"></i>
                        </div>
                        <div class="col-4">${opt.text}</div>
                        <div class="col-4">${opt.value}</div>
                        <div class="col-3" data-text="${opt.text}" data-value="${opt.value}" data-index="${i}">  
                        <i class="v-icon mdi mdi-pencil  ck-edit-option" title="Edit"></i>
                        <i class="v-icon mdi mdi-delete  ck-delete-option" title="Delete"></i>
                        <i class="v-icon mdi mdi-arrow-up  ck-up-option" title="Up"></i>
                        <i class="v-icon mdi mdi-arrow-down  ck-down-option" title="Down"></i>
                        </div>
                    </div>
                `
            },`
                <div class="row">
                <div class="col-1 font-weight-bold">#</div>
                <div class="col-4 font-weight-bold">Text</div>
                <div class="col-4 font-weight-bold">Value</div>
                <div class="col-3 font-weight-bold">Action</div>
                </div>
            `) : '';
            this.element.querySelector('.ck-options-list').innerHTML= optionHtml
            
            if (this.element.querySelector('.ck-options-list').getAttribute('listener') !== 'true') {
                this.element.querySelector('.ck-options-list').addEventListener('click', (e) =>{
                    
                    if(e.target.className.includes('ck-delete-option')){
                        
                        const index = e.target.parentElement.getAttribute('data-index')
                        if(this.options[index].selected){
                            this.formfields['value'].fieldView.element.value = '';
                            this.formfields['value'].fieldView.element.dispatchEvent(
                                new Event("input", { bubbles: true })
                            );
                        }
                        this.options.splice(index,1);
                        this.refreshOptions();

                    } else if (e.target.className.includes('ck-edit-option')) {
                      const index = e.target.parentElement.getAttribute('data-index')
                      this.refreshOptions();
                      textInput.fieldView.element.value = this.options[index].text
                      valueInput.fieldView.element.value = this.options[index].value
                      textInput.fieldView.element.dispatchEvent(
                        new Event("input", { bubbles: true })
                      );
                      valueInput.fieldView.element.dispatchEvent(
                        new Event("input", { bubbles: true })
                      );
                      modifyOption.element.classList.remove('d-none');
                      modifyOption.element.setAttribute('data-index',index);
                      submitOption.element.classList.add('d-none')
                      
                    }else if(e.target.className.includes('ck-up-option')){
                        
                        const index = parseInt(e.target.parentElement.getAttribute('data-index'))

                        if(this.options[index-1]){
                            const option = {...this.options[index-1]};
                            this.options[index-1] = {...this.options[index]};
                            this.options[index] = option;
                        };
                        this.refreshOptions();
                    }else if (e.target.className.includes('ck-down-option')){
                        
                        const index = parseInt(e.target.parentElement.getAttribute('data-index'))
                        if(this.options[index+1]){
                            const option = {...this.options[index+1]};
                            this.options[index+1] = {...this.options[index]};
                            this.options[index] = option;
                        };
                        this.refreshOptions();
                    }else if (e.target.className.includes('ck-select-option')){
                        
                        const index = parseInt(e.target.parentElement.getAttribute('data-index'))
                        this.options = this.options.map(opt => ({ ...opt, selected:false}))
                        this.options[index].selected = !this.options[index].selected
                        
                        this.formfields['value'].fieldView.element.value = this.options[index].value;
                        this.formfields['value'].fieldView.element.dispatchEvent(
                            new Event("input", { bubbles: true })
                        );
                        this.refreshOptions();
                    }
                    
                })
                this.element.querySelector('.ck-options-list').setAttribute('listener', 'true');
            }
            
            textInput.fieldView.element.dispatchEvent(
                new Event("input", { bubbles: true })
            );
            valueInput.fieldView.element.dispatchEvent(
                new Event("input", { bubbles: true })
            );
            this.focus();
        }
        submitOption.on('execute',() => { this.refreshOptions() })
        modifyOption.on('execute',() => {
          const index = modifyOption.element.getAttribute('data-index');
          submitOption.element.classList.remove('d-none')
          modifyOption.element.classList.add('d-none')
          if(textInput.fieldView.element.value || valueInput.fieldView.element.value ){
            this.options[index] = {
                text: textInput.fieldView.element.value || '',
                value: valueInput.fieldView.element.value || ''
            }
            textInput.fieldView.element.value = ''
            valueInput.fieldView.element.value = ''
          }
          this.refreshOptions()
        })
        fieldsetView.setTemplate( {
            tag: 'div',
            attributes: {
                class: [ 'ck', 'ck-selection-field-options' ]
            },
            children: [
                {
                    tag:'div',
                    children:['Available Options']
                },
                {
                    tag:'div',
                    attributes:{
                        class: [ 'ck-option-form row no-gutters'],
                    },
                    children: [
                        textInput,
                        valueInput,
                        submitOption,
                        modifyOption
                    ]
                },
                {
                    tag:'div',
                    attributes:{
                        class: ['ck-options-list']
                    },
                },
            ]
        } );
        return fieldsetView;
    }
    
    _createButtonView(){
        const locale = this.locale;
        const view = new View( locale );
    
        /**
         * The Save button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        const saveButtonView = createButton(
            locale,
            locale.t("Save"),
            icons.check,
            "ck-button-save"
        );
        saveButtonView.type = "submit";

        /**
         * The Cancel button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        const cancelButtonView = createButton(
            locale,
            locale.t("Cancel"),
            icons.cancel,
            "ck-button-cancel",
            this,
            "cancel" 
        );
  

        // set template for button view
        view.setTemplate( {
          tag: 'div',
          attributes: {
            class: [ 'ck', 'ck-selection-form__button' ]
          },
          children: [
            saveButtonView,
            cancelButtonView
          ]
        } );
    
        return view;
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
            if(formFields[key].readonly){
                this.formfields[key].fieldView.isReadOnly = true;
            }
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
        this.textInput,
        this.valueInput,
        this.submitOption,
        this.modifyOption
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
      this.options=[];
      this.refreshOptions();
    }
  
  }