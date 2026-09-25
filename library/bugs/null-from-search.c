/*
 * title: Phone book lookup that finds nobody
 * level: 2
 * about: Searches a small phone book and prints the number it found, without checking for "not found".
 * expect: fault
 */

/*
 * THE PUZZLE
 * find() returns a pointer to the matching entry, or NULL when the name
 * is not there. The first two lookups work. Look at the third name,
 * then at what main does with the result.
 *
 * HOW TO HUNT IT WITH SEE
 * See stops with an invalid access near address 0. Look at e in main's
 * frame: it holds 0 (NULL), drawn without an arrow. The address in the
 * message is 4, not 0, because number sits 4 bytes into the struct, so
 * e->number reads from NULL + 4. Press F8 to go back into the last call
 * of find() and watch it compare against every entry and fall out of
 * the bottom of the loop. You can also type e into the Watch panel and
 * click its eye button: that makes a watchpoint, and the program stops
 * each time e changes, so you see exactly which call handed back NULL.
 */
#include <stdio.h>
#include <string.h>

struct entry {
    const char *name;
    const char *number;
};

static struct entry book[] = {
    { "Ines",   "555-0134" },
    { "Kwame",  "555-0178" },
    { "Ludmila","555-0112" }
};

#define BOOK_SIZE (sizeof book / sizeof book[0])

static struct entry *find(const char *name)
{
    size_t i;

    for (i = 0; i < BOOK_SIZE; i++) {
        if (strcmp(book[i].name, name) == 0)
            return &book[i];
    }
    return NULL;
}

int main(void)
{
    const char *wanted[3];
    struct entry *e;
    int i;

    wanted[0] = "Kwame";
    wanted[1] = "Ines";
    wanted[2] = "Zoltan";

    for (i = 0; i < 3; i++) {
        e = find(wanted[i]);
        printf("%-8s %s\n", wanted[i], e->number);
    }
    return 0;
}

/*
 * THE FIX
 * A function that can return NULL is telling you something; listen:
 *
 *     if (e == NULL)
 *         printf("%-8s not in the book\n", wanted[i]);
 *     else
 *         printf("%-8s %s\n", wanted[i], e->number);
 */
