export class PkceUtil {

    private dec2hex(dec: any) {
        return ("0" + dec.toString(16)).substr(-2);
    }

    public generateCodeVerifier(length: number = 56): string {
        var array = new Uint32Array(length / 2)
        window.crypto.getRandomValues(array)
        return Array.from(array, this.dec2hex).join("")
    }

    public base64urlencode(a: ArrayBuffer) {
        let str = "";
        const bytes = new Uint8Array(a);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    public async generateCodeChallengeFromVerifier(v: string) {
        const hashed = await this.sha256(v);
        const base64encoded = this.base64urlencode(hashed);
        return base64encoded;
    }

    public async sha256(plain: string): Promise<ArrayBuffer> {
        // returns promise ArrayBuffer
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        var hash = await window.crypto.subtle.digest("SHA-256", data)
        return hash
    }

    private getRandomValues(uint32s: number): string {
        var value = "";
        var values = window.crypto.getRandomValues(new Uint32Array(uint32s))
        for (var i = 0; i < values.length; i++) {
            const rv = values[i].toString() // .substring(0,8) 
            value += rv
        }
        return value;

    }

    public getNonce(): string {
        return this.getRandomValues(4)
    }
    public getRandom(): string {
        return this.getRandomValues(4)
    }

}

export const pkceUtil = new PkceUtil()
