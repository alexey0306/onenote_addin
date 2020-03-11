// Import section
import * as Config from "../globals/config";
import * as Images from "../globals/images";


// ---------------------------------------------------------
// 		Success function
// ---------------------------------------------------------

export function success(response,type){
	return {
		type: type,
		payload: response
	}
}

//---------------------------------------------------------
// 		Success function
// ---------------------------------------------------------

export function getStyle(value){
    
    try{
        // Splitting the string
        var array = value.split(Config.EXCEL_CELL_SEPARATOR);
    
        // Font size is the last element of array
        return {style: array[array.length-1],type: array[array.length-2]}
    }
    catch (e){
        return {style: Config.WORD_DEFAULT_STYLE, type: Config.WORD_DEFAULT_TYPE};
    }
    
}

// ===================================================================
//		Encrypt text
// ===================================================================

export async function encrypt_text(host,password){

	switch (host){

		case Config.HOSTNAMES.WORD:
			encrypt_word(password);
			break;

		case Config.HOSTNAMES.EXCEL:
			encrypt_excel(password);
			break;

		case Config.HOSTNAMES.ONENOTE:
			encrypt_onenote(password);
			break;

		default:
			return {message: "", error: Config.messages.UNKNOWN_HOST}
			break;
	}

}

function encrypt_word(password){

	/*
		This function is used to encrypt selected text or selected image in the Word document. The idea is very simple: we take the selected text, encrypt it, put the Saferoom Image on top of it and assign the encrypted text as some Image attribute
	*/

	try{
		Word.run(async context => {

			// Initializing the variables
			let encryptedContent = null;
	        let type = "";
	        let imageToInsert = "";
			
			// Getting the selected range
        	var range = context.document.getSelection();
        	var pictures = range.inlinePictures;
	        var picture = range.inlinePictures.getFirstOrNullObject()
	        context.load(range);
	        context.load(pictures,"items");
	        context.load(picture);
	        

	        // Loading the image properties so we can access it later
        	return context.sync().then(function () {

        		// Initializing the vars
	            var picturesNum = pictures.items.length;
	            var rangeValue = range.text;
	            var style = range.style;

	            // Checking if the range contains text and image
            	if ( (picturesNum > 0) && (rangeValue != "") ){
                	return ({ message: "", error: Config.messages.MULTIPLE_NOTSUPPORTED });
            	}

            	// Checking if we don't select multiple images
            	if ( picturesNum > 1 ){
            		return ({message: "", error: Config.messages.MULTIPLE_IMAGES_NOTSUPPORTED});
            	}

            	// Checking if the range contains text and image
	            if ( (picturesNum == 0) && (rangeValue == "") ){
	            	return ({ message: "", error: Config.messages.NO_CONTENT_SELECTED});
	            }

	            // Getting the HTML representation of selected object                 
	            var html = range.getHtml();
	            var ooxml = range.getOoxml();
	            var picbase64 = picture.getBase64ImageSrc();

	            return context.sync().then(function () {

	            	// Encrypting the image
                	if (picturesNum == 1 ){

                		// Encrypting image
                    	encryptedContent = AESCryptor.EncryptNote(sjcl.codec.base64.toBits(picbase64.value),password);

                    	// Defining the replacement image and type
                    	imageToInsert = Images.ENCRYPTED_IMAGE;
                    	type = Config.TYPES.image;
                		
                	}

                	else if (rangeValue != ""){

	                	// Encrypting text
	                    encryptedContent = AESCryptor.EncryptNote(sjcl.codec.utf8String.toBits(ooxml.value),password);

	                    // Inserting the encrypted image for the text
	                    var isSmall = (rangeValue.length < Config.TEXT_MAX_LENGTH ? true : false);
	                    
	                    // Defining the image to insert
	                    imageToInsert = (isSmall == true ? Images.ENCRYPTED_TEXT_SMALL : Images.ENCRYPTED_TEXT);
	                    type = Config.TYPES.text;
	                }

	                // Clearing the range
                	range.clear();

	                // Inserting the Replacement image
	                var image = range.insertInlinePictureFromBase64(
                		imageToInsert,Word.InsertLocation.start);
                	image.altTextTitle = encryptedContent;
                	image.altTextDescription = type;
                	range.style = "Normal";
                	return context.sync().then(function () {
                		return {message: "Word", error: ""};
                	})

	            });
        	});

		});
	}
	catch (error){
		console.log(error);
	}
	
}

function encrypt_excel(password){
	try{
		Excel.run(async context => {
			console.log(context);
		});
	}
	catch (error){
		console.log(error);
	}
	return {message: "Excel", error: ""};
}

function encrypt_onenote(password){

	try{
		OneNote.run(async context => {
			console.log(context);
		});
	}
	catch (error){
		console.log(error);
	}

	return {message: "Onenote", error: ""};
}