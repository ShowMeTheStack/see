/*
 * title: Two pointers meeting in the middle
 * level: 2
 * about: Reverses an array and tests strings for palindromes by moving one pointer forward and one backward until they meet.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/*
 * lo starts at the front, hi at the back. Pointers into the same array
 * can be compared with <, which asks "is lo still before hi?".
 */
void reverse(int *a, int n)
{
    int *lo = a;
    int *hi = a + n - 1;
    int t;
    while (lo < hi) {
        t = *lo;
        *lo = *hi;
        *hi = t;
        lo++;
        hi--;
    }
}

/* Same shape for a palindrome test, skipping anything that is not a letter. */
int is_palindrome(const char *s)
{
    const char *lo = s;
    const char *hi = s + strlen(s) - 1;
    while (lo < hi) {
        if (!isalpha((unsigned char)*lo)) { lo++; continue; }
        if (!isalpha((unsigned char)*hi)) { hi--; continue; }
        if (tolower((unsigned char)*lo) != tolower((unsigned char)*hi))
            return 0;
        lo++;
        hi--;
    }
    return 1;
}

int main(void)
{
    int a[7];
    int i;
    const char *tests[4];

    for (i = 0; i < 7; i++)
        a[i] = i + 1;

    /* Step into reverse and watch the two arrows walk towards each other. */
    reverse(a, 7);
    for (i = 0; i < 7; i++)
        printf("%d ", a[i]);
    printf("\n");

    tests[0] = "Never odd or even";
    tests[1] = "A man, a plan, a canal: Panama!";
    tests[2] = "pointers";
    tests[3] = "Was it a car or a cat I saw?";
    for (i = 0; i < 4; i++)
        printf("%-34s %s\n", tests[i], is_palindrome(tests[i]) ? "palindrome" : "no");
    return 0;
}
