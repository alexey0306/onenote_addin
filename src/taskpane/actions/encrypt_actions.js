// Import section
import * as Config from '../globals/config';
import * as Images from '../globals/images';
import {success} from './index';
import {showAlert, isLoading} from './alerts_actions';


// ---------------------------------------------------------
// 		Encrypt text
// ---------------------------------------------------------

export function encrypt(host,password){

	return function(dispatch){

		// Showing the progress
		dispatch(isLoading(true));

		// Defining the host = Word, Onenote or Excel
		switch (host){

			// ---------------------------------------------------------
			// 		Encrypt text in Word application
			// ---------------------------------------------------------

			case Config.HOSTNAMES.WORD:

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
			            		dispatch(isLoading(false));
			                	dispatch(showAlert(true,"error",Config.messages.MULTIPLE_NOTSUPPORTED));
			                	return;
			            	}

			            	// Checking if we don't select multiple images
			            	if ( picturesNum > 1 ){
			            		dispatch(isLoading(false));
			            		dispatch(showAlert(true,"error",Config.messages.MULTIPLE_IMAGES_NOTSUPPORTED));
			            		return;
			            	}

			            	// Checking if the range contains text and image
				            if ( (picturesNum == 0) && (rangeValue == "") ){
				            	dispatch(isLoading(false));
				            	dispatch(showAlert(true,"error",Config.messages.NO_CONTENT_SELECTED));
				            	return;
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
			                		dispatch(isLoading(false));
			                		dispatch(success({message: "Finished"}, Config.ENCRYPT_TEXT));
			                	});
							});
        				});
					});
				}
				catch (error){
					dispatch(isLoading(false));
					dispatch(handleError(true,"error",error.message));
				}
				
				
				break;


			// ---------------------------------------------------------
			// 		Encrypt text in Excel application
			// ---------------------------------------------------------

			case Config.HOSTNAMES.EXCEL:
				
				try{

					// Initializing the variables
					let encryptedContent = "";
					let cellValue = "";
					let encryptedValues = [];
					let currentFont = {name: "", size: 0}

					Excel.run(async context => {

						// Getting selected cell
				        let range = context.workbook.getSelectedRange();
				        let font = range.format.font;

				        // Loading the parameters
				        context.load(range,'values');
				        context.load(font,"name");
				        context.load(font,"size");

				        // Syncing
				        return context.sync().then(function(){

				        	// Getting the current font
				        	currentFont.name = font.name;
				        	currentFont.size = font.size;

				        	// Clearing the range
				        	range.clear();
				        	range.format.wrapText = Config.EXCEL_CELL_WRAPTEXT;
				        	range.format.font.name = Config.EXCEL_CELL_FONTNAME;
				        	range.format.font.size = Config.EXCEL_CELL_FONTSIZE;

				        	// Iterating through all selected values
				        	for (var i=0;i<range.values.length;i++){

				        		encryptedValues[i] = []
				        		for (var j=0;j<range.values[i].length;j++){

				        			// Getting the cell values
				        			cellValue = range.values[i][j];

				        			// Encrypting the content
				        			encryptedContent = AESCryptor.EncryptNote(sjcl.codec.utf8String.toBits(cellValue),password);

				        			// Assigning the encrypted value to specific cell
				        			encryptedValues[i][j] = encryptedContent+Config.EXCEL_CELL_SEPARATOR+currentFont.name+Config.EXCEL_CELL_SEPARATOR+currentFont.size;
				        		}
				        	}

				        	console.log(encryptedValues);

				        	range.values = encryptedValues;
				        	return context.sync().then(function(){
				        		dispatch(isLoading(false));
				        		dispatch(success({message: "Finished"}, Config.ENCRYPT_TEXT));
				        	});

				        });

					});

				}
				catch (error){
					dispatch(isLoading(false));
					dispatch(handleError(true,"error",error.message));
				}

				break;


			// ---------------------------------------------------------
			// 		Encrypt text in Onenote application
			// ---------------------------------------------------------

			case Config.HOSTNAMES.ONENOTE:
				
				try{

					OneNote.run(async context => {

						// Get the current page.
						var outline = context.application.getActiveOutline();
						var paragraphs = outline.paragraphs;
						var richText = null;
						var content = [];

						// Loading additional parameters
						context.load(paragraphs,"items");
						context.load(paragraphs,"count");	


						// Syncing
						return context.sync().then(function(){

							var items = paragraphs.items;
							for (var i=0;i<items.length;i++){
								context.load(items[i],"type");
							}
							return context.sync().then(function(){
								console.log(items.length);
								for (var i=0;i<items.length;i++){

									console.log(items[i].type);

									if (items[i].type == "RichText"){
										console.log(items[i].richText.getHtml());
									}
									else if (items[i].type == "Other"){
										console.log(items[i]);
										//console.log(items[i]);
									}
									else if (items[i].type == "Image"){
										//console.log(items[i].image);
									}
								}
							})

						});
					});

				}
				catch (error){
					dispatch(isLoading(false));
					dispatch(handleError(true,"error",error.message));
				}

				break;

			default:
				dispatch(isLoading(false));
				dispatch(handleError(true,"error",Config.messages.UNKNOWN_HOST));
				break;
		}

		dispatch(success({
			message: host
		},Config.ENCRYPT_TEXT));
	}
}