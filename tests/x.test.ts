import {Math} from "../src/x";

describe("X file", () => {
    it("true is true", () => {
        expect(true).toBeTruthy();
    })
    
    let math = new Math();
    it("should do simple add", () => {
        expect(math.sum(1,2)).toBe(3);
    })

    it("should mock", () => {
        math.sum = jest.fn((a: number, b: number) : number => a*b)
        expect(math.sum(3,5)).toBe(15)
    })
})