export class Utility {
    static getRandomString(length: number): string {
        return(Math.random().toString(20).substr(2, length))
    }
}