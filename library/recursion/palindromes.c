/*
 * title: Palindromes checked from both ends
 * level: 2
 * about: Reads phrases and checks each for being a palindrome by recursively comparing the outermost letters, skipping spaces and punctuation.
 * input: racecar\nA man, a plan, a canal: Panama!\nhello\nWas it a car or a cat I saw?\nNo lemon, no melon\nrecursion\n
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

/* Is s[lo..hi] a palindrome? Compare the two ends, then ask the same
   question about what lies between them. Two base cases: the range is
   empty or a single letter (yes), or the ends differ (no).
   Characters that are not letters or digits are stepped over by
   recursing with a narrower range, without comparing anything. */
int is_pal(const char *s, int lo, int hi, int depth)
{
    if (lo >= hi)
        return 1;
    if (!isalnum((unsigned char)s[lo]))
        return is_pal(s, lo + 1, hi, depth);
    if (!isalnum((unsigned char)s[hi]))
        return is_pal(s, lo, hi - 1, depth);
    printf("%*s%c-%c\n", 4 + depth * 2, "", s[lo], s[hi]);
    if (tolower((unsigned char)s[lo]) != tolower((unsigned char)s[hi]))
        return 0;
    return is_pal(s, lo + 1, hi - 1, depth + 1);
}

/* Reverse the string in place, recursively, using the same two-ends idea. */
void reverse(char *s, int lo, int hi)
{
    char t;

    if (lo >= hi)
        return;
    t = s[lo];
    s[lo] = s[hi];
    s[hi] = t;
    reverse(s, lo + 1, hi - 1);
}

int main(void)
{
    char line[80];
    int c, n, yes;

    for (;;) {
        n = 0;
        while ((c = getchar()) != EOF && c != '\n')
            if (n < 79)
                line[n++] = (char)c;
        line[n] = '\0';
        if (c == EOF && n == 0)
            break;

        printf("\"%s\"\n", line);
        yes = is_pal(line, 0, n - 1, 0);
        reverse(line, 0, n - 1);
        printf("  reversed: \"%s\" -> %s\n", line,
               yes ? "a palindrome" : "not a palindrome");
    }
    return 0;
}
