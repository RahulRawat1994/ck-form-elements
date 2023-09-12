import Command from '@ckeditor/ckeditor5-core/src/command';

export default class ImageBUttonCommand extends Command{

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
		let values = {};
		if(selectedElement && selectedElement.name.includes(this.modelElementName)){
			const element = selectedElement && selectedElement.getChild(0);
			this.fields.info && Object.keys(this.fields.info)
			.map(key =>{
				values[key] =element? element.getAttribute(key) : '';
			})
            this.fields.advanced && Object.keys(this.fields.advanced)
			.map(key =>{
				values[key] =element? element.getAttribute(key) : '';
			})
		}
		this.value = values;	
	} 

	execute( formdata ) {
		
		this.editor.model.change( writer => {
			
			const divElement = writer.createElement( `${this.modelElementName}Box`);
			const fieldElement = writer.createElement(`${this.modelElementName}Input`,{...formdata})
			const textNode = writer.createText( this.modelLabel + formdata.value );
			
			writer.append( textNode, fieldElement );
			writer.append( fieldElement, divElement );
			// Insert the content in the current selection location.
			this.editor.model.insertContent( divElement, this.editor.model.document.selection );
		});
	}
}