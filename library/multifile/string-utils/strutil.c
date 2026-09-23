/* strutil.c - the bodies of the helpers declared in strutil.h.
 * Each function takes a char pointer: the caller's array is changed
 * directly, nothing is copied and nothing is allocated. */
#include <ctype.h>
#include <string.h>
#include "strutil.h"

/* Swap from both ends towards the middle. In See, watch i and j close in. */
void str_reverse(char *s)
{
    size_t i = 0;
    size_t j = strlen(s);
    char t;

    if (j == 0) {
        return;
    }
    j--;
    while (i < j) {
        t = s[i];
        s[i] = s[j];
        s[j] = t;
        i++;
        j--;
    }
}

void str_upper(char *s)
{
    for (; *s != '\0'; s++) {
        *s = (char)toupper((unsigned char)*s);
    }
}

/* Cut trailing spaces by moving the terminator, skip leading ones by
 * returning a pointer further into the same array. Nothing moves. */
char *str_trim(char *s)
{
    char *end;

    while (*s != '\0' && isspace((unsigned char)*s)) {
        s++;
    }
    end = s + strlen(s);
    while (end > s && isspace((unsigned char)end[-1])) {
        end--;
    }
    *end = '\0';
    return s;
}

/* A word starts wherever a non-space follows a space (or the start). */
int str_count_words(const char *s)
{
    int count = 0;
    int in_word = 0;

    for (; *s != '\0'; s++) {
        if (isspace((unsigned char)*s)) {
            in_word = 0;
        } else if (!in_word) {
            in_word = 1;
            count++;
        }
    }
    return count;
}

int str_replace_char(char *s, char from, char to)
{
    int n = 0;

    for (; *s != '\0'; s++) {
        if (*s == from) {
            *s = to;
            n++;
        }
    }
    return n;
}

/* Letters only, case ignored: "Never odd or even" counts. */
int str_is_palindrome(const char *s)
{
    const char *a = s;
    const char *b = s + strlen(s);

    while (a < b) {
        if (!isalpha((unsigned char)*a)) { a++; continue; }
        if (!isalpha((unsigned char)b[-1])) { b--; continue; }
        if (tolower((unsigned char)*a) != tolower((unsigned char)b[-1])) {
            return 0;
        }
        a++;
        b--;
    }
    return 1;
}
