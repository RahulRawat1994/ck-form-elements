import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import ImageElementView from './ImageElementView';
import { getSvgContent } from '../utils';
import ImageButtonEditing from "./ImageButtonEditing";
import fieldIcon from "../theme/icons/imagebutton.svg";

export default class ImageButtonUI extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [ImageButtonEditing];
  }

  constructor(editor) {
    super(editor);
    this.className = "img-button";
    this.command = editor.plugins.get(ImageButtonEditing).command;
    this.label = editor.plugins.get(ImageButtonEditing).label;
    this.fields = editor.plugins.get(ImageButtonEditing).fields;
    this.fieldIcon = fieldIcon;
  }

  async init() {
		const editor = this.editor;
		const command = editor.commands.get( this.command );
		const svgIcon =  await getSvgContent(this.fieldIcon);
		editor.ui.componentFactory.add( this.command, (locale) => {
			const dropdown = createDropdown( locale );
		
			const form = new ImageElementView( this.getFormValidators( editor.t), editor.locale, this.fields );
			
			this._setUpDropdown( dropdown, form, command,  svgIcon, this.className );
			this._setUpForm( dropdown, form, command );
      // Set image Preview 
      this._setImagePreview(form);
			return dropdown;
		} );
	}

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
        const indirectFields = ['width', 'height', 'border', 'hspace', 'vspace', 'align'];
        Object.keys(form.formfields).map(key => {
          if(!indirectFields.includes(key)){

            if (
              form.formfields[key].fieldView &&
              form.formfields[key].fieldView.element
            ) {
              
              form.formfields[key].fieldView.element.value = command.value
                ? command.value[key] || ''
                : "";
            }
            form.formdata[key] = command.value ? command.value[key] :null  
            
            if (
              form.formfields[key].fieldView &&
              form.formfields[key].fieldView.buttonView 
            ) {
              // In case of dropdown
              if(form.formdata[key]){
                const allFields = { ...this.fields.info, ...this.fields.advanced};
                const selectedOpt =  allFields[key].options.find(opt => opt.key === form.formdata[key])
                form.formfields[key].label =selectedOpt && selectedOpt.text || form.formdata[key];
              } else {
                form.formfields[key].label =form.formfields[key].fieldView.buttonView.label
              }
            }
            form.formfields[key].fieldView && 
            form.formfields[key].fieldView.element.dispatchEvent(new Event('input', {bubbles:true}));
          }
        });

        this._updateIndirectFields(form);
        
        form.focus();
        form.enableCssTransitions();
      },
      { priority: "low" }
    );

    dropdown.on("submit", async () => {
      if (await form.isValid()) {
        editor.execute(this.command, form.formdata);
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
  _updateIndirectFields(form){
    const styleStr = form.formfields['style'].fieldView.element.value;
    const styleArr = styleStr ? styleStr.split(';').reduce((obj, styleAttr)=>{
      if(styleAttr){
          const styleAttrArr = styleAttr.split(':');
          obj[styleAttrArr[0]]=styleAttrArr[1];
      }
      return  obj;
      }, {}) : {};

    // upadate width 
    if(form.formfields['width'] && form.formfields['width'].fieldView){
      const widthValue = styleArr['width'] 
      ? styleArr['width'].replace( /\D+/g, '')  : '';
      form.formdata['width'] = widthValue;
      form.formfields['width'].fieldView.element.value = widthValue;
      form.formfields['width'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true})) 
    }

    // upadate height 
    if(form.formfields['height'] && form.formfields['height'].fieldView){
      const heightValue = styleArr['height'] 
      ? styleArr['height'].replace( /\D+/g, '')  : '';
      form.formdata['height'] = heightValue;
      form.formfields['height'].fieldView.element.value = heightValue;
      form.formfields['height'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true})) 
    }
    // upadate border 
    if(form.formfields['border'] && form.formfields['border'].fieldView){
      const borderValue = styleArr['border'] 
      ? styleArr['border'].replace( /\D+/g, '') : '';
      form.formdata['border'] = borderValue;
      form.formfields['border'].fieldView.element.value = borderValue;
      form.formfields['border'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true})) 
    }
    // hspace
    if(form.formfields['hspace'] && form.formfields['hspace'].fieldView){
      const hspaceValue = styleArr['margin-left'] 
      ? styleArr['margin-left'].replace( /\D+/g, '') : '';
      form.formdata['hspace'] = hspaceValue;
      form.formfields['hspace'].fieldView.element.value = hspaceValue;
      form.formfields['hspace'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true})) 
    }
    // vspace
    if(form.formfields['vspace'] && form.formfields['vspace'].fieldView){
      const vspaceValue = styleArr['margin-top'] 
      ? styleArr['margin-top'].replace( /\D+/g, '') : '';
      form.formdata['vspace'] = vspaceValue;
      form.formfields['vspace'].fieldView.element.value = vspaceValue;
      form.formfields['vspace'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true})) 
    }

    // align
    if(form.formfields['align'] && form.formfields['align'].fieldView){
      const floatValue = styleArr['float'] 
      ? styleArr['float'] : '';
      form.formdata['align'] = floatValue;
      form.formfields['align'].fieldView.element.value = floatValue;
      const allFields = { ...this.fields.info, ...this.fields.advanced};
      const selectedOpt =  allFields['align'].options.find(opt => opt.key === floatValue)
      if(selectedOpt && selectedOpt.text){
        form.formfields['align'].label =selectedOpt.text
      }
      
      form.formfields['align'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true})) 
    }
   
  }
  _updateStyleAttribute(form,attrKey, attrValue){

    const data = form.formfields['style'].fieldView.element.value;
    const styleArr = data ? data.split(';').reduce((obj, styleAttr)=>{
      if(styleAttr){
          const styleAttrArr = styleAttr.split(':');
          obj[styleAttrArr[0]]=styleAttrArr[1];
      }
      return  obj;
      }, {}) : {};
    styleArr[attrKey]=attrValue;

    const style = Object.keys(styleArr).reduce((styleStr,key ) =>{
        return `${styleStr}${key}:${styleArr[key]};`
    },'')

    form.formfields['style'].fieldView.element.value = style;
    form.formdata['style'] = style;
    form.formfields['style'].fieldView.element.dispatchEvent(new Event('input', {bubbles:true}));
  }
  _setImagePreview(form){

    // Update Url 
    if(form.formfields['src'] && form.formfields['src'].fieldView){
      
      form.formfields['src'].fieldView.element.addEventListener('input', (e) => {
        const value = form.formfields['src'].fieldView.element.value
        let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
        let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
        img.src = `${value}`;
        coreEditor.appendChild(img);
      })
    }

	// Update alt text
    if(form.formfields['alt'] && form.formfields['alt'].fieldView){
      
		form.formfields['alt'].fieldView.element.addEventListener('input', (e) => {
		  const value = form.formfields['alt'].fieldView.element.value
		  let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
		  let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
		  img.alt = `${value}`;
		  coreEditor.appendChild(img);
		})
	}

	// Update width
    if(form.formfields['width'] && form.formfields['width'].fieldView){
      
      form.formfields['width'].fieldView.element.addEventListener('input', (e) => {
        if(form.formfields['width'].errorText){
          return ;
        }
        const value = form.formfields['width'].fieldView.element.value
        let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
        let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
        let widthValue = value?  `${value}px` : 'auto';
        img.style.cssText += `width: ${widthValue}`
        coreEditor.appendChild(img);
        
        this._updateStyleAttribute(form,'width',widthValue);
      })
	}

	// Update height
    if(form.formfields['height'] && form.formfields['height'].fieldView){
      
		form.formfields['height'].fieldView.element.addEventListener('input', (e) => {
      if(form.formfields['height'].errorText){
        return ;
      }
		  const value = form.formfields['height'].fieldView.element.value
		  let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
		  let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
      let heightValue = value?  `${value}px` : 'auto';
		  img.style.cssText += `height: ${heightValue}`
		  coreEditor.appendChild(img);
      this._updateStyleAttribute(form,'height',heightValue);
		})
	}

	// Update border
    if(form.formfields['border'] && form.formfields['border'].fieldView){
      
		form.formfields['border'].fieldView.element.addEventListener('input', (e) => {
      if(form.formfields['border'].errorText){
        return ;
      }
		  const value = form.formfields['border'].fieldView.element.value
		  let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
		  let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
		  let borderValue = value ?`${value}px solid black`:'none';
      img.style.cssText += `border: ${borderValue}`
      this._updateStyleAttribute(form,'border',borderValue);
      coreEditor.appendChild(img);
      
		})
	}

	// Update alignment
    if(form.formfields['align'] && form.formfields['align'].fieldView){
      
    form.formfields['align'].fieldView.on("execute", eventInfo => {
      
      const { id, label } = eventInfo.source;
		  const value = id
		  
		  let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
		  let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
      let floatValue = value ? value : 'none'
      img.style.cssText += `float: ${floatValue};`
      this._updateStyleAttribute(form,'float',floatValue);
		  
		  coreEditor.appendChild(img);
		})
	}

	// Update hspace
    if(form.formfields['hspace'] && form.formfields['hspace'].fieldView){
      if(form.formfields['hspace'].errorText){
        return ;
      }
		form.formfields['hspace'].fieldView.element.addEventListener('input', (e) => {
		  const value = form.formfields['hspace'].fieldView.element.value
		  let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
		  let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
		  let hSpaceValue = value?`${value}px`:'auto';
		  img.style.cssText += `margin-left: ${hSpaceValue}; margin-right:${hSpaceValue};`
      this._updateStyleAttribute(form,'margin-left',hSpaceValue);
      this._updateStyleAttribute(form,'margin-right',hSpaceValue);
		  coreEditor.appendChild(img);
		})
	}

	// Update vspace
    if(form.formfields['vspace'] && form.formfields['vspace'].fieldView){
      if(form.formfields['vspace'].errorText){
        return ;
      }
		form.formfields['vspace'].fieldView.element.addEventListener('input', (e) => {
		  const value = form.formfields['vspace'].fieldView.element.value
		  let coreEditor = form.element.querySelector('.ck-image-button-form__preview')
		  let img = coreEditor.querySelector('img') ? coreEditor.querySelector('img') :  document.createElement("img")
		  let vSpaceValue = value?`${value}px`:'auto';
		  img.style.cssText += `margin-top: ${vSpaceValue}; margin-bottom:${vSpaceValue};`
      this._updateStyleAttribute(form,'margin-top',vSpaceValue);
      this._updateStyleAttribute(form,'margin-bottom',vSpaceValue);
		  coreEditor.appendChild(img);
		})
	}
  }

  /**
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
	 * @param {module:ui/view~View} form
	 * @param {module:media-embed/mediaembedcommand~MediaEmbedCommand} command
	 */
	_setUpForm( dropdown, form, command ) {
		form.delegate( 'submit', 'cancel' ).to( dropdown );
		Object.keys(form.formfields).map(key =>{
			form.formfields[key].bind( 'value' ).to( command, 'value' );
			// Form elements should be read-only when corresponding commands are disabled.
			form.formfields[key].bind( 'isReadOnly' ).to( command, 'isEnabled', value => !value );
		})
	}

  /**
   * Setup validation for form
   * @param {Object} t
   * @returns {Object}
   */
  getFormValidators(t) {
    return [
      async form => {
        if (!form.formdata.src || !form.formdata.src.length) {
          return { field: "src", message: t("The url must not be empty") };
        } 
      },
      async form => {
				if ( form.formdata.width && !(/^[0-9]*$/.test(form.formdata.width)) ) {
					return {field: 'width', message: t( 'Only numeric values allowed' )}
				} else if (parseInt(form.formdata.width) > 500  || parseInt(form.formdata.width) < 0) {
					return {field: 'width', message: t( 'Please enter in between 0 to 500' )}
				} 
			},
			async form => {
				if ( form.formdata.height && !(/^[0-9]*$/.test(form.formdata.height)) ) {
					return {field: 'height', message: t( 'Only numeric values allowed' )}
				} else if (parseInt(form.formdata.height) > 500 || parseInt(form.formdata.height) < 0 ) {
					return {field: 'height', message: t( 'Please enter in between 0 to 500' )}
				} 
			},
      async form => {
				if ( form.formdata.hspace && !(/^[0-9]*$/.test(form.formdata.hspace)) ) {
					return {field: 'hspace', message: t( 'Only numeric values allowed' )}
				} else if (parseInt(form.formdata.hspace) > 500 || parseInt(form.formdata.hspace) < 0 ) {
					return {field: 'hspace', message: t( 'Please enter in between 0 to 500' )}
				} 
			},
			async form => {
				if ( form.formdata.vspace && !(/^[0-9]*$/.test(form.formdata.vspace)) ) {
					return {field: 'vspace', message: t( 'Only numeric values allowed' )}
				} else if (parseInt(form.formdata.vspace) > 500 || parseInt(form.formdata.vspace) < 0 ) {
					return {field: 'vspace', message: t( 'Please enter in between 0 to 500' )}
				} 
			},
      async form => {
				if ( form.formdata.border && !(/^[0-9]*$/.test(form.formdata.border)) ) {
					return {field: 'border', message: t( 'Only numeric values allowed' )}
				} else if (parseInt(form.formdata.border) > 20 || parseInt(form.formdata.border) < 0 ) {
					return {field: 'border', message: t( 'Please enter in between 0 to 20' )}
				} 
			},
    ];
  }
}
