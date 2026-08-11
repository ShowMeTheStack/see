/*
 * title: Savings growth table
 * level: 2
 * about: Tabulates a savings balance year by year at three interest rates, stopping once every account has doubled.
 * input: 1000
 */
#include <stdio.h>

int main(void)
{
    double start;
    double a, b, c;           /* one balance per interest rate */
    int year = 0;
    int a_done = 0, b_done = 0, c_done = 0;

    scanf("%lf", &start);
    a = b = c = start;

    printf("year      3%%        5%%        8%%\n");
    printf("%4d %9.2f %9.2f %9.2f\n", year, a, b, c);

    /* We do not know beforehand how many years it will take, so the loop
       is driven by a condition: keep going while any account is still
       short of double. When one doubles, mark it with a star once. */
    while (a < 2 * start || b < 2 * start || c < 2 * start) {
        year++;
        a *= 1.03;
        b *= 1.05;
        c *= 1.08;
        printf("%4d %9.2f%c%9.2f%c%9.2f%c\n", year,
               a, (a >= 2 * start && !a_done) ? '*' : ' ',
               b, (b >= 2 * start && !b_done) ? '*' : ' ',
               c, (c >= 2 * start && !c_done) ? '*' : ' ');
        if (a >= 2 * start) a_done = 1;
        if (b >= 2 * start) b_done = 1;
        if (c >= 2 * start) c_done = 1;
    }
    printf("* marks the year each account first doubled.\n");
    printf("The rule of 72 guesses 72/3 = 24, 72/5 = 14.4 and 72/8 = 9 years.\n");
    return 0;
}
