/*
 * title: A table of unit tests
 * level: 2
 * about: Tests three string functions against a table of cases, each row naming the function to call through a pointer, and reports which cases fail.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* The functions under test all take a string and return an int. */
int count_vowels(const char *s)
{
    int n = 0;
    for (; *s; s++)
        if (strchr("aeiouAEIOU", *s) != NULL)
            n++;
    return n;
}

int is_palindrome(const char *s)
{
    const char *end = s + strlen(s);
    while (s < end) {
        end--;
        if (tolower((unsigned char)*s) != tolower((unsigned char)*end))
            return 0;
        s++;
    }
    return 1;
}

/* Deliberately buggy: it forgets about words separated by more than one space. */
int count_words(const char *s)
{
    int n = 0;
    if (*s != '\0')
        n = 1;
    for (; *s; s++)
        if (*s == ' ')
            n++;
    return n;
}

/*
 * Each test case is a row of data: which function, what input, what
 * answer we expect. Adding a test means adding a row, not code.
 */
struct test {
    const char *fname;
    int (*fn)(const char *);
    const char *input;
    int expected;
};

const struct test tests[] = {
    { "count_vowels",  count_vowels,  "",              0 },
    { "count_vowels",  count_vowels,  "rhythm",        0 },
    { "count_vowels",  count_vowels,  "Education",     5 },
    { "is_palindrome", is_palindrome, "Level",         1 },
    { "is_palindrome", is_palindrome, "abca",          0 },
    { "is_palindrome", is_palindrome, "",              1 },
    { "count_words",   count_words,   "one",           1 },
    { "count_words",   count_words,   "two words",     2 },
    { "count_words",   count_words,   "",              0 },
    { "count_words",   count_words,   "a  double gap", 3 }
};

int main(void)
{
    int i, got, passed = 0;
    int n = sizeof tests / sizeof tests[0];

    for (i = 0; i < n; i++) {
        got = tests[i].fn(tests[i].input);
        if (got == tests[i].expected) {
            passed++;
            printf("pass  %s(\"%s\") = %d\n", tests[i].fname, tests[i].input, got);
        } else {
            printf("FAIL  %s(\"%s\") = %d, expected %d\n",
                   tests[i].fname, tests[i].input, got, tests[i].expected);
        }
    }
    printf("%d of %d tests passed\n", passed, n);
    /*
     * The failing row points straight at the bug in count_words. Fix it
     * (count a word where a non-space follows a space or the start) and
     * run again.
     */
    return 0;
}
