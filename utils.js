import {
  ButtonView,
  SwitchButtonView,
  LabeledFieldView,
  createLabeledInputText,
  createLabeledInputNumber,
  createLabeledDropdown
} from "ckeditor5/src/ui";

import {
  addListToDropdown
} from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import Model from "@ckeditor/ckeditor5-ui/src/model";
import Collection from "@ckeditor/ckeditor5-utils/src/collection";

/**
 * Creates a Input Text view.
 *
 * @private
 * @param {String} label The input label.
 * @returns {module:ui/labeledfield/labeledfield~LabeledFieldView} The labeled InputText view instance.
 */
 export const createTextInput = (locale, label = "",className='', callback) => {

  const t = locale.t;

  const labeledInput = new LabeledFieldView(
    locale,
    createLabeledInputText
  );

  const inputField = labeledInput.fieldView;
  labeledInput.label = t(label);
  labeledInput.class = className || '';

  inputField.on("input", () => {
    callback
    && typeof callback === 'function'
    && callback(inputField.element.value.trim())
  });
  return labeledInput;
};

/**
 * Creates a Input Number view.
 *
 * @private
 * @param {String} label The input label.
 * @returns {module:ui/labeledfield/labeledfield~LabeledFieldView} The labeled Input view instance.
 */
export const createNumericInput = (locale, label = "", className='', callback) => {
  const t = locale.t;

  const labeledInput = new LabeledFieldView(
    locale,
    createLabeledInputNumber
  );
  const inputField = labeledInput.fieldView;

  labeledInput.label = t(label);
  labeledInput.class = className || '';
  inputField.on("input", () => {
    callback 
    && typeof callback === 'function' 
    && callback(inputField.element.value.trim())
  });

  return labeledInput;
};

/**
 * Creates a Dropdown view.
 *
 * @private
 * @param {String} label The dropdown label.
 * @param {Array} options The dropdown options.
 * @returns {module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView} The button view instance.
 */
export const createDropdownInput = (locale, dropdownLabel = "", options = [], className='', callback) => {
  const t = locale.t;

  const labeledDropdown = new LabeledFieldView(
    locale,
    createLabeledDropdown
  );
  labeledDropdown.label = t(dropdownLabel);
  labeledDropdown.class = className || '';
  const dropdownView = labeledDropdown.fieldView;
  dropdownView.buttonView.set({
    withText: true,
    label: dropdownLabel,
    tooltip: true
  });
   
  const items = new Collection();
  Array.isArray(options) && 
    options.map(opt => 
      (items.add({
        type: "button",
        model: new Model({
          id: opt.key,
          withText: true,
          label: t(opt.text)
        })
      }))
    );
  addListToDropdown(dropdownView, items);
  
  dropdownView.on("execute", eventInfo => {
    const { id, label } = eventInfo.source;
    if(label){
      labeledDropdown.errorText= ''
    }
    labeledDropdown.label = label || dropdownLabel;
    callback && typeof callback === 'function' && callback(id)
  });

  return labeledDropdown;
};

/**
 * Creates a button view.
 *
 * @private
 * @param {String} label The button label.
 * @param {String} icon The button icon.
 * @param {String} className The additional button CSS class name.
 * @param {String} [eventName] An event name that the `ButtonView#execute` event will be delegated to.
 * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
 */
export const createButton = (locale, label, icon, className, ref, eventName) => {
  const button = new ButtonView(locale);

  button.set({
    label,
    icon,
    tooltip: true
  });

  button.extendTemplate({
    attributes: {
      class: className
    }
  });

  if (eventName) {
    button.delegate("execute").to(ref, eventName);
  }

  return button;
};

/**
 * Create a switch button view 
 * 
 * @private
 * @param {String} label The input label.
 * @returns {module:ui/SwitchButtonView} The labeled Input view instance.
 */
export const createSwitchButton = (locale, label, className= '', callback) =>{
  const switchButton = new SwitchButtonView();

  switchButton.set( {
    name:'switchButton',
    isToggleable : true,
    label,
    withText: true,
    class: className || ''
  } );
 
  switchButton.on( 'execute', () => {
    switchButton.set({
      isOn : !switchButton.isOn ,
    })  
    callback(switchButton.isOn )
  } );
  
  return switchButton;
}

/**
 * Check svg xml is valid or not
 * @param {string} svgContent 
 * @returns 
 */
const isSvgValid = (svgContent) =>{
  const oParser = new DOMParser();
  const oDOM = oParser.parseFromString(svgContent, "text/xml");
  return oDOM.documentElement.nodeName !== 'parsererror' 
} 

/**
 * Get content of svg from url 
 * @param {String} url string of svg icon 
 * @returns {String} svg xml content or empty string
 */
export const getSvgContent = async (url) =>{
  if(!url){
    return ''; 
  }
  let content = '';
  try {
    const response = await fetch(url);
    
    if(typeof response == 'object' && "text" in response ){
      let textContent = await response.text(); 
      content = isSvgValid(textContent) ? textContent : ''
    }
    return content;
  } catch(error) { 
    return content; 
  } 
}
