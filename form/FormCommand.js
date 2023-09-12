import Command from '@ckeditor/ckeditor5-core/src/command';

export default class FormCommand extends Command{

    constructor(editor, fields, modelElementName){
        super(editor)
        this.fields = fields;
        this.modelElementName = modelElementName;
    }

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), `${this.modelElementName}Box` );
		this.isEnabled = allowedIn !== null;
		const element = selection.getSelectedElement();
		// set value
		let values = {};
		if(element && element.name.includes(this.modelElementName)){
			this.fields && Object.keys(this.fields)
			.map(key =>{
				values[key] =element? element.getAttribute(key) : '';
			})
			const divElement = element.getChild(0)
			this.children =divElement? Array.from(divElement.getChildren()) : []
		} else {
			this.children = [];
		}
		this.value = values;
	} 
    

	execute( formdata ) {
		this.editor.model.change( writer => {
            const data = Object.keys(formdata).reduce((obj, key) =>{ 
                if(formdata[key]){
                    obj[key] = formdata[key];
                }
                return obj;
            }, {})
			const formElement = writer.createElement( `${this.modelElementName}Box`, {...data});
            const divElement = writer.createElement( `${this.modelElementName}Area`);
            writer.append( divElement, formElement );

			if(this.children && this.children.length){
				this.children.forEach(child =>{
					child.parent = null;
					writer.append( child, divElement );
				})
			} else{
				
				// There must be at least one paragraph for the description to be editable.
				// See https://github.com/ckeditor/ckeditor5/issues/1464.
				writer.appendElement( 'paragraph', divElement );
			}
			// Insert the content in the current selection location.
			this.editor.model.insertContent( formElement, this.editor.model.document.selection );
		});
	}

}