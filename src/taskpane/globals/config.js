// Host names
export const HOSTNAMES = {
	WORD: "Word",
	EXCEL: "Excel",
	ONENOTE: "OneNote"
};

// System messages
export const messages = {
	PASSWORD_EMPTY: "Please specify the password",
	NO_ACTION_SPECIFIED: "Unrecognized action. Please try again",
	UNKNOWN_HOST: "Unknown host or application. Please try again",
	MULTIPLE_NOTSUPPORTED: "Text and image (multiple images) encryption currently not supported. Please select either text or an image",
	NO_CONTENT_SELECTED: "Please select text or image to encrypt",
	MULTIPLE_IMAGES_NOTSUPPORTED: "Currently application doesn't support multiple images encryption",
	IMAGE_NOT_FOUND: "Image with encrypted text not found. Please try again",
	IMAGE_ALTTEXT_EMPTY: "Image doesn't contain the information about Encrypted content. Please make sure that you've selected the correct image",
	UNKNOWN_TYPE: "Unrecognized content type. Unable to decrypt"
};

// Configuration parameters
export const TEXT_MAX_LENGTH = 256;
export const TYPES = {
	text: "text",
	image: "image"
}

// Actions
export const ENCRYPT_TEXT = "ENCRYPT_TEXT";
export const DECRYPT_TEXT = "DECRYPT_TEXT";
export const ENCRYPT_IMAGE = "ENCRYPT_IMAGE";
export const DECRYPT_IMAGE = "DECRYPT_IMAGE";

export const DISPLAY_PROGRESS = "DISPLAY_PROGRESS";
export const SHOW_ALERT = "SHOW_ALERT";
export const HANDLE_LOADER = "HANDLE_LOADER";
export const CLEAR_ALERTS = "CLEAR_ALERTS";

export const SET_TOKEN = "SET_TOKEN";

// Excel cell global values
export const EXCEL_CELL_FONTNAME = "Consolas";
export const EXCEL_CELL_FONTSIZE = 4;
export const EXCEL_CELL_WRAPTEXT = true;
export const EXCEL_CELL_SEPARATOR = "_____";
export const EXCEL_DEFAULT_FONTNAME = "Calibri";
export const EXCEL_DEFAULT_FONTSIZE = 11;

// Word global values
export const WORD_DEFAULT_STYLE = "Normal";
export const WORD_DEFAULT_TYPE = "text";


// Onenote Application Authentication keys
export const Onenote = {
	client_id: "96bcea38-72e7-4fc6-ae97-2776f7bf697e",
	tenant_id: "163533c9-ef1a-4082-ad79-ebe5611c7c82",
	response_type: "code",
	response_mode: "query",
	scope: "offline_access",
	redirect_uri: "https://localhost:3000/auth"
}
