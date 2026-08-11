/*
 * title: Numbers in words with switches
 * level: 3
 * about: Spells out numbers from 0 to 9999 in English using switches for the digit words and if chains for the joins.
 * input: 0 7 13 40 99 105 1000 2019 7341 9999
 */
#include <stdio.h>

/* Print the word for 1-9. A switch maps a small number straight to its
   case; the compiler can turn this into a jump table. */
static void units(int d)
{
    switch (d) {
    case 1: printf("one");   break;
    case 2: printf("two");   break;
    case 3: printf("three"); break;
    case 4: printf("four");  break;
    case 5: printf("five");  break;
    case 6: printf("six");   break;
    case 7: printf("seven"); break;
    case 8: printf("eight"); break;
    case 9: printf("nine");  break;
    }
}

/* Print 1-99. The teens are irregular, so they get their own switch. */
static void tens(int n)
{
    if (n < 10) {
        units(n);
        return;
    }
    if (n < 20) {
        switch (n) {
        case 10: printf("ten");       break;
        case 11: printf("eleven");    break;
        case 12: printf("twelve");    break;
        case 13: printf("thirteen");  break;
        case 15: printf("fifteen");   break;
        case 18: printf("eighteen");  break;
        default:
            /* fourteen, sixteen, seventeen, nineteen are regular:
               the unit word plus "teen". */
            units(n - 10);
            printf("teen");
        }
        return;
    }
    switch (n / 10) {
    case 2: printf("twenty");  break;
    case 3: printf("thirty");  break;
    case 4: printf("forty");   break;
    case 5: printf("fifty");   break;
    case 6: printf("sixty");   break;
    case 7: printf("seventy"); break;
    case 8: printf("eighty");  break;
    case 9: printf("ninety");  break;
    }
    if (n % 10 != 0) {
        printf("-");
        units(n % 10);
    }
}

int main(void)
{
    int n;
    int th, hu, rest;

    while (scanf("%d", &n) == 1) {
        printf("%4d: ", n);
        if (n == 0) {
            printf("zero\n");
            continue;
        }
        th = n / 1000;
        hu = n / 100 % 10;
        rest = n % 100;

        /* Each part is printed only if it is there, and "and" joins the
           hundreds (or thousands) to a non-zero remainder, British style. */
        if (th > 0) {
            units(th);
            printf(" thousand");
        }
        if (hu > 0) {
            if (th > 0)
                printf(" ");
            units(hu);
            printf(" hundred");
        }
        if (rest > 0) {
            if (th > 0 || hu > 0)
                printf(" and ");
            tens(rest);
        }
        printf("\n");
    }
    return 0;
}
