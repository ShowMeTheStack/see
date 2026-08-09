/*
 * title: Savings with compound interest
 * level: 2
 * about: Reads a deposit, a yearly rate and a number of years, then prints the balance year by year and checks it against the formula with pow.
 * input: 1000 5 10
 */
#include <stdio.h>
#include <math.h>

int main(void)
{
    double deposit;
    double rate_percent;
    int years;
    double balance;
    double interest;
    double by_formula;
    int y;

    printf("Deposit, rate in percent, years: ");
    scanf("%lf %lf %d", &deposit, &rate_percent, &years);
    printf("%.2f %.2f %d\n\n", deposit, rate_percent, years);

    /*
     * Each year the bank adds rate percent of the current balance. The
     * interest earns interest too: that is what "compound" means. Watch
     * balance grow on the stack as you step round the loop.
     */
    balance = deposit;
    printf("year     interest      balance\n");
    for (y = 1; y <= years; y++) {
        interest = balance * rate_percent / 100.0;
        balance = balance + interest;
        printf("%4d %12.2f %12.2f\n", y, interest, balance);
    }

    /*
     * The loop multiplies by (1 + rate) once a year, so after n years the
     * balance is deposit * (1 + rate) to the power n. pow from math.h does
     * that in one call.
     */
    by_formula = deposit * pow(1.0 + rate_percent / 100.0, years);
    printf("\nformula gives %.2f\n", by_formula);
    printf("simple interest would give only %.2f\n",
           deposit + deposit * rate_percent / 100.0 * years);
    return 0;
}
