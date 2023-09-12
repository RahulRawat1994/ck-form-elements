import Command from '@ckeditor/ckeditor5-core/src/command';

export default class ElementCommand extends Command{

  constructor(editor, fields, modelElementName, modelLabel=''){
    super(editor)
    this.fields = fields;
    this.modelElementName = modelElementName;
    this.modelLabel = modelLabel
  }

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;	
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), `${this.modelElementName}Box` );
		this.isEnabled = allowedIn !== null;
		const selectedElement = selection.getSelectedElement();
		let values = {
			options:[]
		};
		if(selectedElement && selectedElement.name.includes(this.modelElementName)){
			this.fields && Object.keys(this.fields)
			.map(key =>{
				values[key] =selectedElement? selectedElement.getAttribute(key) : '';
			})

			for (let child of selectedElement.getChildren()) {
				if(!child.name.includes(`${this.modelElementName}Input`)){
					return ;
				}
				values.options.push({
					value: child.getAttribute('value'),
					text:  child.getChild(0) ?  child.getChild(0).data  : ''
				})
				if(child.getAttribute('selected')){
					values.options[values.options.length-1].selected = true;
				}
			}
		}
		this.value = values;
	} 

	execute( formdata,options ) {
		
		this.editor.model.change( writer => {
			const divElement = writer.createElement( `${this.modelElementName}Box`, {...formdata});
            
			options.map((opt) =>{
				const textNode = writer.createText(opt.text)
				const attrs = {value:opt.value};
				if(opt.selected){
					attrs.selected = true;
				}
				const fieldElement = writer.createElement(`${this.modelElementName}Input`,attrs)
				writer.append( textNode, fieldElement );
				writer.append( fieldElement, divElement );
			})
			// Insert the content in the current selection location.
			this.editor.model.insertContent( divElement, this.editor.model.document.selection );
		});
	}
}