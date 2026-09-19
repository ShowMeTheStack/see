/*
 * title: expand a-z into the whole alphabet
 * level: 2
 * about: Expands shorthand like a-z and 0-9 in one string into the full list of characters in another (exercise 3-3), taking care with leading and trailing dashes.
 */
#include <stdio.h>
#include <ctype.h>

/* Is a-b a sensible range? Both ends must be the same kind (two
   lower-case letters, two capitals or two digits) and in order. */
static int is_range(int a, int b)
{
    return a <= b &&
           ((islower(a) && islower(b)) ||
            (isupper(a) && isupper(b)) ||
            (isdigit(a) && isdigit(b)));
}

/* Copy s1 into s2, writing out each range in full. s1[i-1], s1[i] and
   s1[i+1] are looked at together: a dash in the middle of a good range
   is replaced by everything between its neighbours. A dash at the
   start or end, or between unlike characters, is copied as it is. */
void expand(const char s1[], char s2[])
{
    int i, j = 0, c;

    for (i = 0; s1[i] != '\0'; i++) {
        if (s1[i] == '-' && i > 0 && s1[i + 1] != '\0' &&
            is_range(s1[i - 1], s1[i + 1])) {
            /* s1[i-1] is already in s2; fill in the ones after it up to
               but not including s1[i+1], which the next pass copies. */
            for (c = s1[i - 1] + 1; c < s1[i + 1]; c++)
                s2[j++] = (char)c;
        } else
            s2[j++] = s1[i];
    }
    s2[j] = '\0';
}

int main(void)
{
    const char *tests[7];
    char result[200];
    int i;

    tests[0] = "a-z";
    tests[1] = "0-9 and A-F";
    tests[2] = "a-b-f";
    tests[3] = "-a-e-";
    tests[4] = "x-a";
    tests[5] = "a-Z";
    tests[6] = "A-Ca-c0-2";

    for (i = 0; i < 7; i++) {
        expand(tests[i], result);
        printf("%-12s -> %s\n", tests[i], result);
    }
    return 0;
}
