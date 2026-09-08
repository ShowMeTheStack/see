/*
 * title: Arithmetic and defined() in #if
 * level: 3
 * about: Lets the preprocessor compute table sizes, check ranges with limits.h, and combine conditions with defined(), &&, || and !.
 */
#include <stdio.h>
#include <limits.h>

/*
 * #if evaluates an integer constant expression: + - * / % << >> & | ^,
 * comparisons, && || !, and ?: all work. Any identifier that is not a
 * macro counts as 0. defined(NAME) is 1 when NAME is a macro.
 */
#define ROWS      6
#define COLS      7
#define CELLS     (ROWS * COLS)
#define USE_COLOUR

/* Pick the smallest type that can hold a cell index. */
#if CELLS <= UCHAR_MAX
   typedef unsigned char cell_index;
#  define INDEX_TYPE "unsigned char"
#elif CELLS <= USHRT_MAX
   typedef unsigned short cell_index;
#  define INDEX_TYPE "unsigned short"
#else
   typedef unsigned long cell_index;
#  define INDEX_TYPE "unsigned long"
#endif

/* defined() lets several macros be tested in one condition. */
#if defined(USE_COLOUR) && !defined(NO_PRINT)
#  define STYLE "colour"
#elif defined(USE_COLOUR) || defined(USE_MONO)
#  define STYLE "plain"
#else
#  define STYLE "none"
#endif

/* An identifier that is not a macro is 0, so this is #if 0 > 3. A
   forgotten #define can therefore slip through quietly. */
#if UNDEFINED_LEVEL > 3
#  define LEVEL_NOTE "high level"
#else
#  define LEVEL_NOTE "UNDEFINED_LEVEL counted as 0"
#endif

/* The preprocessor can even do the work of a small function. */
#define CEIL_DIV(a, b) (((a) + (b) - 1) / (b))
#if CEIL_DIV(CELLS, 8) != 6
#  error "the bitmap size calculation is wrong"
#endif

int main(void)
{
    /* One bit per cell, so the bitmap needs CEIL_DIV(42, 8) = 6 bytes. */
    unsigned char bitmap[CEIL_DIV(CELLS, 8)];
    cell_index i;
    int set = 0;

    printf("%d x %d board, %d cells\n", ROWS, COLS, CELLS);
    printf("cell index type: %s (%d byte)\n", INDEX_TYPE, (int)sizeof(cell_index));
    printf("style: %s\n", STYLE);
    printf("%s\n", LEVEL_NOTE);
    printf("bitmap: %d bytes\n", (int)sizeof bitmap);

    for (i = 0; i < sizeof bitmap; i++)
        bitmap[i] = 0;

    /* Mark every cell whose index is a multiple of 5. */
    for (i = 0; i < CELLS; i++)
        if (i % 5 == 0)
            bitmap[i / 8] |= (unsigned char)(1 << (i % 8));

    for (i = 0; i < CELLS; i++) {
        int on = (bitmap[i / 8] >> (i % 8)) & 1;
        set += on;
        putchar(on ? '#' : '.');
        if ((i + 1) % COLS == 0)
            putchar('\n');
    }
    printf("%d cells marked\n", set);
    return 0;
}
