/*
 * title: Reversing numbers and palindromes
 * level: 2
 * about: Reverses the digits of each number with a while loop and reports which numbers read the same both ways.
 * input: 12321 4510 7 1221 123456
 */
#include <stdio.h>

int main(void)
{
    long n, rest, rev;

    while (scanf("%ld", &n) == 1) {
        rest = n;
        rev = 0;

        /* Build the reversed number one digit at a time: shift what we
           have one place left (times 10) and drop the next digit into the
           units place. For 4510 the digits come off the right: 0, 1, 5, 4,
           so rev goes 0, 1, 15, 154. The trailing zero of 4510 became a
           leading zero of rev, and leading zeros vanish. */
        while (rest > 0) {
            rev = rev * 10 + rest % 10;
            rest /= 10;
        }

        printf("%7ld reversed is %-7ld %s\n", n, rev,
               rev == n ? "palindrome" : "");
    }
    return 0;
}
