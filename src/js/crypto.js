import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

export function encrypt(data) {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()

    return ciphertext
}

export function decrypt(ciphertext) {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)

        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    }
    catch (error) {
        return null
    }
}
