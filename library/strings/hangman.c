/*
 * title: Hangman
 * level: 3
 * about: Plays hangman against typed guesses, keeping the secret word, the revealed pattern and the letters tried in separate char arrays.
 * input: e\na\ne\nt\nr\ns\no\nn\ni\nc\nu\nl\nd\nm\n
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define LIVES 6

static void gallows(int wrong)
{
    /* Each picture row is a string; parts appear as wrong grows. */
    printf("  +---+\n");
    printf("  |   %c\n", wrong > 0 ? 'O' : ' ');
    printf("  |  %c%c%c\n", wrong > 2 ? '/' : ' ', wrong > 1 ? '|' : ' ', wrong > 3 ? '\\' : ' ');
    printf("  |  %c %c\n", wrong > 4 ? '/' : ' ', wrong > 5 ? '\\' : ' ');
    printf(" ===\n");
}

int main(void)
{
    const char *secret = "successor";   /* in the string literal area */
    char shown[16];                    /* on the stack: "________" filling in */
    char tried[27] = "";               /* letters guessed so far, kept as a string */
    int len = (int)strlen(secret);
    int wrong = 0, left = len, i, n, hit;
    char g;

    /* Build the pattern: one underscore per letter, then a NUL. */
    for (i = 0; i < len; i++)
        shown[i] = '_';
    shown[len] = '\0';

    while (wrong < LIVES && left > 0 && scanf(" %c", &g) == 1) {
        g = (char)tolower((unsigned char)g);
        if (!isalpha((unsigned char)g))
            continue;
        /* strchr answers "is this char in that string?" */
        if (strchr(tried, g) != NULL) {
            printf("'%c' again? already tried: %s\n", g, tried);
            continue;
        }
        /* Append g: it goes where the NUL was, and a new NUL follows it.
           26 letters plus the NUL is why tried has 27 bytes. */
        n = (int)strlen(tried);
        tried[n] = g;
        tried[n + 1] = '\0';
        hit = 0;
        for (i = 0; i < len; i++)
            if (secret[i] == g) {
                shown[i] = g;
                hit++;
                left--;
            }
        if (hit)
            printf("'%c': yes (%d)  %s\n", g, hit, shown);
        else {
            wrong++;
            printf("'%c': no       %s   (%d lives left)\n", g, shown, LIVES - wrong);
        }
    }
    gallows(wrong);
    if (left == 0)
        printf("solved \"%s\" with %d wrong guesses\n", secret, wrong);
    else
        printf("the word was \"%s\"\n", secret);
    return 0;
}
