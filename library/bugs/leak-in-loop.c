/*
 * title: A leak in every pass of the loop
 * level: 2
 * about: Builds a padded label for each item on the heap and only frees the last one.
 */

/*
 * THE PUZZLE
 * The output is perfect. The program ends normally. And yet it has a
 * bug that See reports when it exits. Count the mallocs and count the
 * frees.
 *
 * HOW TO HUNT IT WITH SEE
 * Run it and read the message at the end: See lists the blocks that
 * were never freed, with the line that allocated each one. Then debug
 * with F5 and step through the loop with F10, watching the heap: each
 * pass adds a new block, and the arrow from label moves on to the new
 * one, leaving the previous block behind with nothing pointing at it.
 * Once no pointer leads to a block, nobody can free it any more. In a
 * short program the operating system takes the memory back at exit;
 * in a server that runs for months, a few bytes per request adds up
 * until it falls over.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char *make_label(const char *name, int width)
{
    char *s = malloc(width + 1);
    int n = (int)strlen(name);
    int i;

    if (s == NULL)
        return NULL;
    for (i = 0; i < width; i++)
        s[i] = i < n ? name[i] : '.';
    s[width] = '\0';
    return s;
}

int main(void)
{
    const char *items[4];
    int prices[4];
    char *label = NULL;
    int i;

    items[0] = "bread";      prices[0] = 120;
    items[1] = "milk";       prices[1] = 89;
    items[2] = "cheese";     prices[2] = 350;
    items[3] = "apples";     prices[3] = 210;

    for (i = 0; i < 4; i++) {
        label = make_label(items[i], 12);
        if (label == NULL)
            return 1;
        printf("%s %d.%02d\n", label, prices[i] / 100, prices[i] % 100);
    }

    free(label);
    return 0;
}

/*
 * THE FIX
 * Free each label once you have finished with it, inside the loop:
 *
 *         printf(...);
 *         free(label);
 *
 * and drop the free after the loop. Every malloc should have exactly
 * one free, and you should be able to point at it.
 */
