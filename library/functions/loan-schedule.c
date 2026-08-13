/*
 * title: Paying off a loan month by month
 * level: 2
 * about: Computes the monthly payment on a loan with one function and prints the repayment schedule with another, comparing two loan lengths.
 */
#include <stdio.h>
#include <math.h>

/* The standard annuity formula. rate is per year in percent; the
   monthly rate is that divided by 12 and by 100. */
double monthly_payment(double principal, double rate, int months)
{
    double r = rate / 1200.0;

    if (r == 0)
        return principal / months;
    return principal * r / (1 - pow(1 + r, -months));
}

/* Interest is charged on what is still owed; the rest of the payment
   reduces the debt. Prints every "every"th month and returns the total
   interest paid, so the caller can compare options. */
double schedule(double principal, double rate, int months, int every)
{
    double pay = monthly_payment(principal, rate, months);
    double owed = principal, interest, total_interest = 0;
    int m;

    printf("\n%.0f at %.1f%% over %d months: %.2f a month\n", principal, rate, months, pay);
    printf(" month   interest  principal      owed\n");
    for (m = 1; m <= months; m++) {
        interest = owed * rate / 1200.0;
        owed -= pay - interest;
        total_interest += interest;
        if (m % every == 0 || m == 1)
            printf("%6d %10.2f %10.2f %10.2f\n", m, interest, pay - interest, owed < 0.005 ? 0.0 : owed);
    }
    return total_interest;
}

int main(void)
{
    double short_loan, long_loan;

    /* Each call to schedule makes its own frame with its own owed and
       total_interest; nothing is shared between the two runs. */
    short_loan = schedule(12000, 6.0, 24, 4);
    long_loan  = schedule(12000, 6.0, 60, 12);

    printf("\ninterest over 2 years: %8.2f\n", short_loan);
    printf("interest over 5 years: %8.2f\n", long_loan);
    printf("the longer loan costs %.2f more\n", long_loan - short_loan);
    return 0;
}
