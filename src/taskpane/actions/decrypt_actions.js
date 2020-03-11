// Import section
import * as Config from '../globals/config';
import * as Images from '../globals/images';
import {success,getStyle} from './index';
import {showAlert, isLoading} from './alerts_actions';


// ---------------------------------------------------------
// 		Decrypt text
// ---------------------------------------------------------

export function decrypt(host,password){

	return function(dispatch){

		// Showing the progress
		dispatch(isLoading(true));

		// Defining the host = Word, Onenote or Excel
		switch (host){

			case Config.HOSTNAMES.WORD:

				// ---------------------------------------------------------
				// 		Decrypt text in Word application
				// ---------------------------------------------------------

				try{

					Word.run(async context => {

						// Getting the selected range
        				var range = context.document.getSelection();

        				// Getting the image from the selected range
        				var picture = range.inlinePictures.getFirstOrNullObject();

        				// Loading the image properties so we can access it later
				        context.load(range,"style");
				        context.load(picture,"altTextTitle");
				        context.load(picture,"altTextDescription");

				        return context.sync().then(function () {

				        	// Checking that we have a picture and text to decrypt
            				if ( (picture == null) ){
            					dispatch(isLoading(false));
            					dispatch(showAlert(true,"error",Config.messages.IMAGE_NOT_FOUND));
            					return false;
            				}
            				else if (picture.altTextTitle == null){
            					dispatch(isLoading(false));
            					dispatch(showAlert(true,"error",Config.messages.IMAGE_ALTTEXT_EMPTY));
            					return false;
            				}

            				// Checking the type of encrypted data
            				switch (picture.altTextDescription){
            					case Config.TYPES.text:

            						
            						try{

                    					// Decrypting text using password	
                    					var decryptedText = sjcl.codec.utf8String.fromBits(AESCryptor.DecryptNote(picture.altTextTitle, password));
                    					
                    					// Inserting the decrypted text
				                    	range.clear();
				                    	
				                    	//if (style.style != ""){range.style = style.style;}
				                    	range.insertOoxml(decryptedText,Word.InsertLocation.start);
				                    	return context.sync().then(function () {
				                        	dispatch(isLoading(false));
				                        	dispatch(success("Finished",Config.DECRYPT_TEXT));
				                    	});
                    				}
                    				catch (error){
                    					dispatch(isLoading(false));
                    					dispatch(showAlert(true,"error",error.message));
                    					return false;
                    				}

                    				

            						break;
            					case Config.TYPES.image:

            						try{
            							// Decrypting text using password
				                    	var decryptedImage = sjcl.codec.base64.fromBits(AESCryptor.DecryptNote(picture.altTextTitle, password));
				                    
					                    // Inserting the decrypted text
					                    range.clear();
					                    //range.style = style.style;
					                    
					                    // Inserting decrypted picture
					                    range.insertInlinePictureFromBase64(decryptedImage,Word.InsertLocation.replace);
					                                            
					                    return context.sync().then(function () {
					                        dispatch(isLoading(false));
					                        dispatch(success("Finished",Config.DECRYPT_IMAGE));
					                    });	
            						}
            						catch (error){
            							dispatch(isLoading(false));
                    					dispatch(showAlert(true,"error",error.message));
                    					return false;
            						}            						

            						break;

            					default:
            						dispatch(isLoading(false));
            						dispatch(showAlert(true,"error",Config.messages.UNKNOWN_TYPE));
            						break;
            				}

				        });

					});

				}
				catch (error){
					dispatch(isLoading(false));
					dispatch(showAlert(true,"error",error));
				}

				break;

			case Config.HOSTNAMES.EXCEL:

				try{
					
					// ---------------------------------------------------------
					// 		Decrypt text in Excel application
					// ---------------------------------------------------------

					// Initializing the variables
				    let decryptedContent = "";
				    let cellValue = "";
				    let decryptedValues = []
				    let font = {name: "", size: 0};

				    Excel.run(async context => {

				    	// Getting selected cell(s)
				        let range = context.workbook.getSelectedRange();
				        let font = range.format.font;
				        let worksheet = context.workbook.worksheets.getActiveWorksheet();
				        context.load(range,'values');
				        context.load(range,'address');

				        // Syncing
				        return context.sync().then(function () {

				        	// Getting font
				            font = getFont(range.values[0][0]);
				            //console.log(font);
				            //return;
				            range.format.wrapText = Config.EXCEL_CELL_WRAPTEXT;
				            range.format.font.name = font.name;
				            range.format.font.size = font.size;

				            // Iterating through all selected cells
				            for (var i=0;i<range.values.length;i++){
				            	decryptedValues[i] = [];
				            	for (var j=0;j<range.values[i].length;j++){

				            		// Getting the cell value
				            		cellValue = range.values[i][j];        		
				            		try{

				            			// Tryin to decrypt it
				            			var decryptedContent = sjcl.codec.utf8String.fromBits(AESCryptor.DecryptNote(cellValue.split(Config.EXCEL_CELL_SEPARATOR)[0], password));

				            			// Updating the cells 
                        				decryptedValues[i][j] = decryptedContent;
				            		} 
				            		catch (error){
				            			decryptedValues[i][j] = cellValue;
				            		}
				            	}
				            }

				            // Updating the selected range
				            range.values = decryptedValues;

				            return context.sync().then(function(){
				            	dispatch(isLoading(false));
				            });
				        });


				    });
				}
				catch (error){
					dispatch(isLoading(false));
					dispatch(showAlert(true,"error",error));
				}
				
				break;

			default:
				break;
		}

	};
}

function getFont(value){
    
    try{
        // Splitting the string
        var array = value.split(Config.EXCEL_CELL_SEPARATOR);
    
        // Font size is the last element of array
        return {name: array[array.length-2],size: parseInt(array[array.length-1])}
    }
    catch (e){
        return {name: Config.EXCEL_DEFAULT_FONTNAME, size: Config.EXCEL_DEFAULT_FONTSIZE};
    }
    
}