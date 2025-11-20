export declare class EncryptionUtil {
    private static getKey;
    static encrypt(text: string, secret: string): string;
    static decrypt(encryptedData: string, secret: string): string;
}
