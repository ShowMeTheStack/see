/*
 * title: A tokenizer that keeps its place, two ways
 * level: 4
 * about: Splits text into words with a strtok-like function that hides its position in a static, shows it breaking when two splits are nested, and fixes it by letting the caller hold the position.
 */
#include <stdio.h>
#include <string.h>

/* Version 1 remembers where it stopped in a static pointer, like the
   library's strtok. Pass the text on the first call and NULL after. */
char *next_word_static(char *text, const char *seps)
{
    static char *place = NULL;
    char *start;

    if (text != NULL)
        place = text;
    if (place == NULL)
        return NULL;
    place += strspn(place, seps);          /* skip separators */
    if (*place == '\0') {
        place = NULL;
        return NULL;
    }
    start = place;
    place += strcspn(place, seps);         /* run to the next separator */
    if (*place != '\0')
        *place++ = '\0';                   /* cut the word off */
    else
        place = NULL;
    return start;
}

/* Version 2 has exactly the same logic, but the position lives in a
   variable the caller owns, passed by address. Two splits can now run
   at the same time, each with its own place. */
char *next_word(char **place, const char *seps)
{
    char *start;

    if (*place == NULL)
        return NULL;
    *place += strspn(*place, seps);
    if (**place == '\0') {
        *place = NULL;
        return NULL;
    }
    start = *place;
    *place += strcspn(*place, seps);
    if (**place != '\0')
        *(*place)++ = '\0';
    else
        *place = NULL;
    return start;
}

int main(void)
{
    char a[64], b[64];
    char *row, *cell, *rows_at, *cells_at;

    /* Split "rows;rows;rows" into rows, then each row into cells. */
    strcpy(a, "red,green;cat,dog,emu;one");
    printf("nested split with the static version:\n");
    row = next_word_static(a, ";");
    while (row != NULL) {
        printf("  row:");
        /* The inner call restarts the static place inside this row ... */
        for (cell = next_word_static(row, ","); cell != NULL; cell = next_word_static(NULL, ","))
            printf(" [%s]", cell);
        printf("\n");
        /* ... so the outer split has lost its position: the place was
           left at NULL by the inner loop, and the other rows are never
           seen. In See, watch next_word_static's static place in the
           globals area being taken over by the inner loop. */
        row = next_word_static(NULL, ";");
    }

    strcpy(b, "red,green;cat,dog,emu;one");
    printf("nested split with caller-owned positions:\n");
    rows_at = b;
    while ((row = next_word(&rows_at, ";")) != NULL) {
        printf("  row:");
        /* cells_at and rows_at are two separate variables in main's
           frame; each split moves only its own. */
        cells_at = row;
        while ((cell = next_word(&cells_at, ",")) != NULL)
            printf(" [%s]", cell);
        printf("\n");
    }
    return 0;
}
