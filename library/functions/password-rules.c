/*
 * title: Password rules as yes-or-no functions
 * level: 2
 * about: Checks candidate passwords against several rules, each a small function returning 1 or 0, and explains every rule a password breaks.
 * input: cat\nsunshine\nSunshine1\nS3cure!pass\nAAAAbbbb1!\nGood_Pass_42\n
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* Each rule is a predicate: a function that answers a question with
   1 (yes) or 0 (no). Named predicates make the checking code read
   almost like the rules themselves. */

int long_enough(const char *s)
{
    return strlen(s) >= 8;
}

/* "Does any character satisfy test?" The answer comes back as soon as
   one is found: an early return saves looking at the rest. */
int has_upper(const char *s)
{
    for (; *s != '\0'; s++)
        if (isupper((unsigned char)*s))
            return 1;
    return 0;
}

int has_digit(const char *s)
{
    for (; *s != '\0'; s++)
        if (isdigit((unsigned char)*s))
            return 1;
    return 0;
}

int has_symbol(const char *s)
{
    for (; *s != '\0'; s++)
        if (ispunct((unsigned char)*s))
            return 1;
    return 0;
}

/* No character repeated three or more times in a row, like "aaa". */
int no_long_runs(const char *s)
{
    for (; s[0] != '\0' && s[1] != '\0'; s++)
        if (s[0] == s[1] && s[1] == s[2])
            return 0;
    return 1;
}

/* Runs every rule, prints the ones broken, returns how many. */
int check(const char *pw)
{
    int broken = 0;

    printf("%-14s", pw);
    if (!long_enough(pw))  { printf(" [too short]");        broken++; }
    if (!has_upper(pw))    { printf(" [no capital]");       broken++; }
    if (!has_digit(pw))    { printf(" [no digit]");         broken++; }
    if (!has_symbol(pw))   { printf(" [no symbol]");        broken++; }
    if (!no_long_runs(pw)) { printf(" [repeats 3 times]");  broken++; }
    printf(broken ? "\n" : " accepted\n");
    return broken;
}

int main(void)
{
    char pw[40];
    int good = 0, total = 0;

    while (scanf("%39s", pw) == 1) {
        total++;
        if (check(pw) == 0)
            good++;
    }
    printf("%d of %d passwords accepted\n", good, total);
    return 0;
}
