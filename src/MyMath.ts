export default class MyMath {
    private static roundDigit = 4;

    public static round(val : number) : number {
        let roundingVal = 10 ** MyMath.roundDigit;
        val = Math.round(val * roundingVal) / roundingVal;
        if (val == -0) val = 0;
        return val
    }
}