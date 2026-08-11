/*
 * title: Roman numerals with a switch
 * level: 3
 * about: Converts numbers to Roman numerals with a greedy loop over a value table and converts them back with a switch.
 * input: 1994 2024 49 3888 14
 */
#include <stdio.h>

int main(void)
{
    /* The table includes the six subtractive pairs (CM, CD, XC, XL, IX,
       IV), so the greedy rule "take the biggest value that fits" just
       works. Both arrays are static, so See shows them among the globals,
       and the strings themselves sit in the string-literal area. */
    static const int value[] = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
    static const char *symbol[] = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };
    char roman[20];
    int n, rest, i, len, back, v, prev;
    const char *s;

    while (scanf("%d", &n) == 1) {
        /* Number to Roman: for each table entry, while it still fits,
           append its symbol and subtract it. */
        rest = n;
        len = 0;
        for (i = 0; i < 13; i++) {
            while (rest >= value[i]) {
                for (s = symbol[i]; *s != '\0'; s++)
                    roman[len++] = *s;
                rest -= value[i];
            }
        }
        roman[len] = '\0';

        /* Roman to number: read right to left. A letter smaller than the
           one after it is subtracted (the I in IV), otherwise added. */
        back = 0;
        prev = 0;
        for (i = len - 1; i >= 0; i--) {
            switch (roman[i]) {
            case 'I': v = 1;    break;
            case 'V': v = 5;    break;
            case 'X': v = 10;   break;
            case 'L': v = 50;   break;
            case 'C': v = 100;  break;
            case 'D': v = 500;  break;
            case 'M': v = 1000; break;
            default:  v = 0;
            }
            if (v < prev)
                back -= v;
            else
                back += v;
            prev = v;
        }
        printf("%4d = %-15s back again: %d\n", n, roman, back);
    }
    return 0;
}
