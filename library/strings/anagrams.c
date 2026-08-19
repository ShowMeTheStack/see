/*
 * title: Are these two words anagrams?
 * level: 2
 * about: Decides whether two phrases use exactly the same letters by counting each letter up for one and down for the other in a 26-slot array.
 * input: listen silent\nDormitory dirty_room\nhello world\nAstronomer moon_starer\nabc abcc\n
 */
#include <stdio.h>
#include <ctype.h>

static int anagrams(const char *a, const char *b)
{
    /* count[0] is for 'a', count[25] for 'z'. Letters of a add one, letters
       of b take one away; they are anagrams exactly when every slot ends at
       zero. Watch the array in See's locals while it runs. */
    int count[26] = { 0 };
    int i;

    for (; *a; a++)
        if (isalpha((unsigned char)*a))
            count[tolower((unsigned char)*a) - 'a']++;
    for (; *b; b++)
        if (isalpha((unsigned char)*b))
            count[tolower((unsigned char)*b) - 'a']--;
    for (i = 0; i < 26; i++)
        if (count[i] != 0)
            return 0;
    return 1;
}

int main(void)
{
    char x[40], y[40];

    /* Each line holds two words; an underscore stands for a space so that
       %39s can read a phrase as one word. Underscores are not letters, so
       they are ignored by the counting anyway. */
    while (scanf("%39s %39s", x, y) == 2)
        printf("%-12s %-12s %s\n", x, y, anagrams(x, y) ? "anagrams" : "not anagrams");
    return 0;
}
