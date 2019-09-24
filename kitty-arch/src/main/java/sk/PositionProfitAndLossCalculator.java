package sk;

public class PositionProfitAndLossCalculator {

    public static void main(String[] args) {
        int[] lossAmount = {30, 20, 20, 20, 30, 0, 0, 0};
        int[] lossInterval = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        PositionProfitAndLossCalculator.calcLoss(10000, 100, lossAmount, lossInterval);
        int[] profitAmount = {30, 20, 20, 20, 0, 0, 0, 0};
        int[] profitInterval = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
        PositionProfitAndLossCalculator.calcProfit(10000, 100, profitAmount, profitInterval);

    }

    /**
     * 计算损失。
     *
     * @param totalInput  计划总投入
     * @param initPrice   初始投入价格
     * @param inputAmount 投入股数比例
     * @param interval    投入间隔
     */
    public static void calcLoss(int totalInput, int initPrice, int[] inputAmount, int[] interval) {
        int length = interval.length;
        int[] stockAmount = new int[length];
        double[] mktValue = new double[length];
        double[] totalLoss = new double[length];
        double[] remainCurrent = new double[length];
        double[] currentPrice = new double[length];
        double[] lossPercent = new double[length];
        double[] bouncePercent = new double[length];
        double[] revertPercent = new double[length];
        double[] totalLossCheck = new double[length];

        currentPrice[0] = initPrice;
        mktValue[0] = inputAmount[0] * currentPrice[0] * (100 - interval[0]) / 100;
        remainCurrent[0] = totalInput - mktValue[0];
        totalLoss[0] = 0;
        lossPercent[0] = 0;
        bouncePercent[0] = 0;
        revertPercent[0] = 0;
        stockAmount[0] = inputAmount[0];
        double tempAddedMktValue = 0;
        int inputAmountCurrent = 0;
        for (int i = 1; i < length; i++) {
            inputAmountCurrent = i < inputAmount.length ? inputAmount[i] : 0;
            stockAmount[i] = stockAmount[i - 1] + inputAmountCurrent;
            currentPrice[i] = currentPrice[i - 1] * (1 - (interval[i] - interval[i - 1]) / 100.0);
            tempAddedMktValue = inputAmountCurrent * currentPrice[i];
            mktValue[i] = mktValue[i - 1] * (1 - (interval[i] - interval[i - 1]) / 100.0) + tempAddedMktValue;
            remainCurrent[i] = remainCurrent[i - 1] - tempAddedMktValue;
            totalLoss[i] = totalInput - mktValue[i] - remainCurrent[i];
            lossPercent[i] = totalLoss[i] / totalInput;
            bouncePercent[i] = totalLoss[i] / mktValue[i];
            revertPercent[i] = 0;
            totalLossCheck[i] = totalLoss[i - 1] + mktValue[i - 1] * (interval[i] - interval[i - 1]) / 100;
        }

        for (int i = 0; i < length; i++) {
            System.out.printf("%d%% -> %s，股数%d，市值%s，现金%s，总亏%s，亏损%s%%，跌幅%s%%，回本%s%%%n", interval[i], String.format("%.2f", currentPrice[i]), stockAmount[i], String
                    .format("%.2f", mktValue[i]), String
                    .format("%.2f", remainCurrent[i]), String.format("%.2f", totalLoss[i]), String
                    .format("%.2f", 100 * totalLoss[i] / totalInput), String.format("%.2f", (initPrice - currentPrice[i]) / initPrice * 100), String.format("%.2f", bouncePercent[i] * 100));
        }
    }

    public static void calcProfit(int totalInput, int initPrice, int[] inputAmount, int[] interval) {
        int length = interval.length;
        int[] stockAmount = new int[length];
        double[] mktValue = new double[length];
        double[] totalProfit = new double[length];
        double[] remainCurrent = new double[length];
        double[] currentPrice = new double[length];
        double[] profitPercent = new double[length];
        double[] revertPercent = new double[length];
        double[] totalProfitCheck = new double[length];

        currentPrice[0] = initPrice;
        mktValue[0] = inputAmount[0] * currentPrice[0] * (100 + interval[0]) / 100;
        remainCurrent[0] = totalInput - mktValue[0];
        totalProfit[0] = 0;
        profitPercent[0] = 0;
        revertPercent[0] = 0;
        revertPercent[0] = 0;
        stockAmount[0] = inputAmount[0];
        double tempAddedMktValue = 0;
        int inputAmountCurrent = 0;
        for (int i = 1; i < length; i++) {
            inputAmountCurrent = i < inputAmount.length ? inputAmount[i] : 0;
            stockAmount[i] = stockAmount[i - 1] + inputAmountCurrent;
            currentPrice[i] = currentPrice[i - 1] * (1 + (interval[i] - interval[i - 1]) / 100.0);
            tempAddedMktValue = inputAmountCurrent * currentPrice[i];
            mktValue[i] = mktValue[i - 1] * (1 + (interval[i] - interval[i - 1]) / 100.0) + tempAddedMktValue;
            remainCurrent[i] = remainCurrent[i - 1] - tempAddedMktValue;
            totalProfit[i] = mktValue[i] + remainCurrent[i] - totalInput;
            profitPercent[i] = totalProfit[i] / totalInput;
            revertPercent[i] = totalProfit[i] / mktValue[i];
            totalProfitCheck[i] = totalProfit[i - 1] + mktValue[i - 1] * (interval[i] - interval[i - 1]) / 100;
        }

        for (int i = 0; i < length; i++) {
            System.out.println(
                    interval[i] + "% -> " + String.format("%.2f", currentPrice[i]) + "，股数" + stockAmount[i] + "，市值" + String
                            .format("%.2f", mktValue[i]) + "，现金"
                            + String
                            .format("%.2f", remainCurrent[i]) + "，总盈"
                            + String.format("%.2f", totalProfit[i]) + "，盈利" + String
                            .format("%.2f", 100 * totalProfit[i] / totalInput)
                            + "%，涨幅"
                            + String.format("%.2f", (currentPrice[i] - initPrice) / initPrice * 100)
                            + "%，回撤"
                            + String.format("%.2f", revertPercent[i] * 100) + "%");
        }
    }

}