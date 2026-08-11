/*
 * title: Keep asking until the answer is valid
 * level: 2
 * about: Uses do-while loops to reject out-of-range answers before accepting a menu choice and a quantity.
 * input: 7 0 2 -3 120 4
 */
#include <stdio.h>

int main(void)
{
    int choice;
    int qty;
    static const char *drinks[] = { "tea", "coffee", "cocoa" };
    static const int pence[] = { 120, 180, 150 };

    printf("1 tea  2 coffee  3 cocoa\n");

    /* The classic validation loop: ask, read, and go round again while
       the answer is no good. The test is at the bottom because we have
       nothing to test until we have read something. */
    do {
        printf("choose 1-3: ");
        scanf("%d", &choice);
        printf("%d\n", choice);
        if (choice < 1 || choice > 3)
            printf("  no such drink\n");
    } while (choice < 1 || choice > 3);

    do {
        printf("how many (1-10): ");
        scanf("%d", &qty);
        printf("%d\n", qty);
        if (qty < 1 || qty > 10)
            printf("  between 1 and 10, please\n");
    } while (qty < 1 || qty > 10);

    /* choice is 1-based for people, the arrays are 0-based for C. The
       drinks array lives with the globals (it is static); its three
       pointers point at string literals in the read-only area. */
    printf("%d x %s = %d.%02d pounds\n", qty, drinks[choice - 1],
           qty * pence[choice - 1] / 100, qty * pence[choice - 1] % 100);
    return 0;
}
