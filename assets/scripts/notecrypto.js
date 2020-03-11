var AESCryptor = {};

/* Errors */
var EncryptError =
{
    'ERROR_ENCRYPT_NOTE_EMPTY':             '0: Source note you want to encrypt is empty',
    'ERROR_ENCRYPT_PLAIN_EMPTY':            '1: Plain text for encryption is empty',
    'ERROR_ENCRYPT_PSW_EMPTY':              '7: Password for encryption is empty',
    'ERROR_ENCRYPT_PSW_BIG':                '8: Incorrect encryption password length. Should not be more than 256 symbols',
    'ERROR_ENCRYPT_PSW_SMALL':              '9: Incorrect encryption password length. Should be more than 6 symbols',
    'ERROR_ENCRYPT_SCHEMA':                 '10: Unknown schema definition:  ',
    'ERROR_ENCRYPT_COMMON':                 '11: Common encryption error. System:  ',
    'ERROR_ENCRYPT_FILE_PLAIN_EMPTY':       '11: File name with plain text for encryption is empty',
    'ERROR_ENCRYPT_FILE_PLAIN_NOTEXISTS':   '13: File {1} with plain text for encryption does not exist',
    'ERROR_ENCRYPT_FILE_PLAIN_TOOLARGE':    '14: File {0} with size {1} bytes is too large for encryption. Maximum size for this version is {2} bytes',
    'ERROR_ENCRYPT_FILE_COMMON':            '15: Common file encryption error. System:  ',
    'ERROR_ENCRYPT_FILE_CIPHER_EMPTY':      '17: File name for the encrypted cipher text is empty'
};

var DecryptError =
{
    'ERROR_DECRYPT_NOTE_EMPTY':             '100: Encrypted note for decryption is empty',
    'ERROR_DECRYPT_PSW_EMPTY':              '104: Password for decryption is empty',
    'ERROR_DECRYPT_PSW_BIG' :               '105: Incorrect decryption password length. Should not be more than 256 symbols',
    'ERROR_DECRYPT_PSW_SMALL':              '106: Incorrect decryption password length. Should be more than 6 symbols',
    'ERROR_DECRYPT_NOTE_FORMAT':            '107: Format of the note for decryption is wrong',
    'ERROR_DECRYPT_COMMON':                 '108: Common decryption error. System:  ',
    'ERROR_DECRYPT_BASE64' :                '114: Error converting from BASE64 ciphertext',
    'ERROR_DECRYPT_CIPHER_EMPTY':           '102: Cipher text for decryption is empty',
    'ERROR_DECRYPT_FILE_CIPHER_EMPTY' :     '109: File name with encrypted cipher text is empty',
    'ERROR_DECRYPT_FILE_CIPHER_NOTEXISTS' :	'110: File {1} with encrypted cipher text for decryption does not exist',
    'ERROR_DECRYPT_FILE_CIPHER_WRONGEXT':   '111: Wrong cipher file extension. Extension must be {1}', 
    'ERROR_DECRYPT_FILE_COMMON' :           '113: Common file decryption error. System:  ',
    'ERROR_DECRYPT_FILE_PLAIN_EMPTY' :      '112: File name for the decrypted plain text is empty',
    'ERROR_DECRYPT_NOTE_INTEGRITY' :        '115: Encrypted note integrity was compromised'
};

var CheckError =
{
    'ERROR_CHECK_COMMON' :	            'Common error while checking the note. System: ',
    'ERROR_CHECK_FIRST_TOKEN_TOOLONG' :	'First token is too long. Symbols {0} were added to the first token',
    'ERROR_CHECK_FORMAT_ERROR' :        'Encrypted note format error. Must be 4 fields. Found {0} fields',
    'ERROR_CHECK_HASH_LENGHT_WRONG' :   'Hash field (2) has wrong length. Must be {0} symbols',
    'ERROR_CHECK_HASH_VALUE_WRONG' :    'Hash field (2) has wrong value. Must be HEX symbols (0-9, A-F)',
    'ERROR_CHECK_SECOND_TOKEN_TOOLONG' : 'Second token is too long. Symbols {0} were added to the second token',
    'ERROR_CHECK_TOKEN_NOTFOUND' :	    'No tokens found in encrypted note. Must be 2 tokens ({0}). Found {1} tokens'
};

var HashError =
{
    'ERROR_HASH_DATA_EMPTY':        '300: Source byte array for hashing is empty',
    'ERROR_HASH_TEXT_EMPTY'	:       '301: Source text for hashing is empty',
    'ERROR_HASH_FILE_EMPTY' :	    '302: File name for hashing is empty',
    'ERROR_HASH_FILE_NOTEXISTS' :	'303: File {1} for hashing does not exist',
    'ERROR_HASH_DATA_COMMON' :	    '304: Common error while hashing the data. System:  ',
    'ERROR_HASH_TEXT_COMMON' :      '305: Common error while hashing the text. System:  ',
    'ERROR_HASH_FILE_COMMON' :	    '306: Common error while hashing the file. System:  '
}

// Constants
const PASSWORD_LENGHT_MIN = 6
const PASSWORD_LENGHT_MAX = 128
const NOTE_TOKEN_COUNT = 2 
const NOTE_SEPARATORS_COUNT = 3 
const NOTE_MD5_HASH_LENGHT = 32
const SEPARATOR = "__"; 
const TOKEN = "TUFNTU9USEVOQ1JZUFRFRE5PVEU=";

/*
    Takes password string and salt WordArray
    Returns key bitArray
*/
AESCryptor.KeyForPassword = function (password, salt)
{
    var hmacSHA1 = function (key)
    {
      var hasher = new sjcl.misc.hmac(key, sjcl.hash.sha1);
      this.encrypt = function ()
      {
          return hasher.encrypt.apply(hasher, arguments);
      };
  };
    return sjcl.misc.pbkdf2(password, salt, 10000, 32 * 8, hmacSHA1);
}

/*
  Encrypt plaintext (bitArray) with password (string)
  Returns message (bitArray)
*/
AESCryptor.EncryptData = function (plaintext, password)
{
  var encryption_salt = sjcl.random.randomWords(8 / 4);
  var encryption_key = AESCryptor.KeyForPassword(password, encryption_salt);
  var hmac_salt = sjcl.random.randomWords(8 / 4);
  var hmac_key = AESCryptor.KeyForPassword(password, hmac_salt);
  var iv = sjcl.random.randomWords(16 / 4);
  var version = sjcl.codec.hex.toBits("02");
  var options = sjcl.codec.hex.toBits("01");
  var message = sjcl.bitArray.concat(version, options);
  message = sjcl.bitArray.concat(message, encryption_salt);
  message = sjcl.bitArray.concat(message, hmac_salt);
  message = sjcl.bitArray.concat(message, iv);
  var aes = new sjcl.cipher.aes(encryption_key);
  sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
  var encrypted = sjcl.mode.cbc.encrypt(aes, plaintext, iv);
  message = sjcl.bitArray.concat(message, encrypted);
  var hmac = new sjcl.misc.hmac(hmac_key).encrypt(message);
  message = sjcl.bitArray.concat(message, hmac);
  return message;
}

/*
  Decrypt message (bitArray) with password (string)
  Returns decrypted plaintext (bitArray)
*/
AESCryptor.DecryptData = function (message, password)
{
  var version = sjcl.bitArray.extract(message, 0 * 8, 8);
  var options = sjcl.bitArray.extract(message, 1 * 8, 8);
  var encryption_salt = sjcl.bitArray.bitSlice(message, 2 * 8, 10 * 8);
  var encryption_key = AESCryptor.KeyForPassword(password, encryption_salt);
  var hmac_salt = sjcl.bitArray.bitSlice(message, 10 * 8, 18 * 8);
  var hmac_key = AESCryptor.KeyForPassword(password, hmac_salt);
  var iv = sjcl.bitArray.bitSlice(message, 18 * 8, 34 * 8);
  var ciphertext_end = sjcl.bitArray.bitLength(message) - (32 * 8);
  var ciphertext = sjcl.bitArray.bitSlice(message, 34 * 8, ciphertext_end);
  var hmac = sjcl.bitArray.bitSlice(message, ciphertext_end);
  var expected_hmac = new sjcl.misc.hmac(hmac_key).encrypt(sjcl.bitArray.bitSlice(message, 0, ciphertext_end));
  // .equal is of consistent time
  if (!sjcl.bitArray.equal(hmac, expected_hmac))
  {
    throw new sjcl.exception.corrupt("HMAC mismatch or bad password.");
  }
  var aes = new sjcl.cipher.aes(encryption_key);
  sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."]();
  var decrypted = sjcl.mode.cbc.decrypt(aes, ciphertext, iv);
  return decrypted;
}

/*
  Encrypt plaintext (bitArray) with password (string) and create note
  Returns note (base64 string)
*/
AESCryptor.EncryptNote = function (plaintext, password)
{
    var md5Hash = md5(plaintext)
    var cipher = AESCryptor.EncryptData(plaintext, password)
    var note = TOKEN + SEPARATOR + md5Hash.toUpperCase() + SEPARATOR + sjcl.codec.base64.fromBits(cipher) + SEPARATOR + TOKEN
    return note;
}

/*
  Decrypt plaintext with password (string) from encrypted note (base64 string)
  Returns plaintext (bitArray)
*/
AESCryptor.DecryptNote = function (encryptedNote, password)
{
    var parts = encryptedNote.split(SEPARATOR)
    var cipher = sjcl.codec.base64.toBits(parts[2].replace(/<(?:.|\n)*?>/gm, ''))
    var plain = AESCryptor.DecryptData(cipher, password)
    return plain;
}