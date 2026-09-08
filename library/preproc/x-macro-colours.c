/*
 * title: X-macros keep an enum and its names in step
 * level: 3
 * about: Defines a list of colours once and expands it into an enum, a name table and an RGB table that can never drift apart.
 */
#include <stdio.h>
#include <string.h>

/*
 * The problem: an enum of colours plus an array of their names plus
 * an array of their RGB values. Add a colour to one list and forget
 * another, and every name after it is off by one.
 *
 * The X-macro trick: write the list exactly once, as calls to a macro
 * called X that is not defined yet. Each time we need the list, we
 * define X to pick out the part we want, expand COLOURS, and #undef X.
 */
#define COLOURS                      \
    X(RED,     255,   0,   0)        \
    X(ORANGE,  255, 165,   0)        \
    X(YELLOW,  255, 255,   0)        \
    X(GREEN,     0, 128,   0)        \
    X(BLUE,      0,   0, 255)        \
    X(INDIGO,   75,   0, 130)        \
    X(VIOLET,  238, 130, 238)

/* Expansion 1: the enum. Each X(name, ...) becomes "C_name,". */
#define X(name, r, g, b) C_ ## name,
enum colour { COLOURS C_COUNT };
#undef X

/* Expansion 2: the names, as strings made with #. */
#define X(name, r, g, b) #name,
static const char *colour_names[] = { COLOURS };
#undef X

/* Expansion 3: the RGB values, packed into one long each. */
#define X(name, r, g, b) ((long)(r) << 16 | (g) << 8 | (b)),
static const long colour_rgb[] = { COLOURS };
#undef X

/* Look a colour up by name; returns C_COUNT when not found. */
static enum colour find(const char *name)
{
    int i;
    for (i = 0; i < C_COUNT; i++)
        if (strcmp(colour_names[i], name) == 0)
            return (enum colour)i;
    return C_COUNT;
}

int main(void)
{
    int i;
    enum colour c;

    printf("%d colours\n", (int)C_COUNT);
    for (i = 0; i < C_COUNT; i++)
        printf("  %d %-7s #%06lX\n", i, colour_names[i], colour_rgb[i]);

    c = find("INDIGO");
    printf("INDIGO is number %d, blue part %ld\n", (int)c, colour_rgb[c] & 0xFF);
    c = find("PINK");
    printf("PINK %s\n", c == C_COUNT ? "is not in the list" : "was found");

    /*
     * In See's globals pane, colour_names is an array of pointers, each
     * arrow ending at a string literal. Both arrays have exactly
     * C_COUNT entries, because all three came from the same list.
     */
    return 0;
}
