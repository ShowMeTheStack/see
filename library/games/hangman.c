/*
 * title: Hangman with a drawn gallows
 * level: 2
 * about: Picks a secret word with a fixed seed, reads letter guesses, reveals matches and draws one more piece of the gallows for each miss.
 * input: e\na\nt\no\ne\n7\nr\nc\nx\nm\np\ni\nl\n
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>

#define MAXMISS 6

/* Each body part is printed as itself once enough misses have piled up,
   and as a space before that, so the figure grows one piece per miss. */
static void draw(int misses)
{
    printf("  +---+\n");
    printf("  |   %c\n", misses > 0 ? 'O' : ' ');
    printf("  |  %c%c%c\n", misses > 2 ? '/' : ' ', misses > 1 ? '|' : ' ', misses > 3 ? '\\' : ' ');
    printf("  |  %c %c\n", misses > 4 ? '/' : ' ', misses > 5 ? '\\' : ' ');
    printf(" ===\n");
}

int main(void)
{
    static const char *words[] = { "pointer", "compiler", "variable", "function", "structure" };
    const char *secret;
    char shown[16];         /* the word as the player sees it: c_m_ile_ */
    char tried[27] = "";    /* every letter guessed so far */
    char line[16];
    int misses = 0, len, i, found, left;
    int c;

    srand(11);
    secret = words[rand() % 5];
    len = (int)strlen(secret);

    for (i = 0; i < len; i++)
        shown[i] = '_';
    shown[len] = '\0';

    while (misses < MAXMISS && strchr(shown, '_') != NULL) {
        printf("\n%s   tried: %s\n", shown, tried);
        printf("letter: ");
        if (fgets(line, sizeof line, stdin) == NULL) {
            printf("\n(no more input)\n");
            break;
        }
        c = tolower((unsigned char)line[0]);
        printf("%c\n", c);
        if (!isalpha(c)) {
            printf("That is not a letter.\n");
            continue;
        }
        if (strchr(tried, c) != NULL) {
            printf("You already tried %c.\n", c);
            continue;
        }
        left = (int)strlen(tried);
        tried[left] = (char)c;
        tried[left + 1] = '\0';

        /* Uncover every copy of the letter, not just the first. */
        found = 0;
        for (i = 0; i < len; i++) {
            if (secret[i] == c) {
                shown[i] = (char)c;
                found++;
            }
        }
        if (found)
            printf("Yes, %d of them.\n", found);
        else {
            misses++;
            printf("No %c. Misses: %d of %d\n", c, misses, MAXMISS);
            draw(misses);
        }
    }

    if (strchr(shown, '_') == NULL)
        printf("\n%s - you saved him with %d misses!\n", secret, misses);
    else
        printf("\nHanged! The word was %s.\n", secret);
    return 0;
}
