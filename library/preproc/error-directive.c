/*
 * title: Configuration checks with #error
 * level: 2
 * about: Checks build settings and type sizes at compile time, with #error lines that stop the build only when a setting is wrong.
 */
#include <stdio.h>
#include <limits.h>

/*
 * #error stops the compiler with your own message. Placed inside an
 * #if, it only fires when something is misconfigured, so a bad setting
 * is caught before the program can even run.
 *
 * All the checks below pass with the settings given here. To see one
 * fire, change BUFFER_SIZE to 100 (not a power of two) or MODE to 7,
 * and build again.
 */
#define BUFFER_SIZE 64
#define MODE        2      /* 1 = fast, 2 = safe */

#if BUFFER_SIZE < 16
#  error "BUFFER_SIZE must be at least 16"
#endif

/* x & (x - 1) clears the lowest set bit; it is zero only for powers
   of two. The preprocessor can do this arithmetic itself. */
#if (BUFFER_SIZE & (BUFFER_SIZE - 1)) != 0
#  error "BUFFER_SIZE must be a power of two"
#endif

#if MODE != 1 && MODE != 2
#  error "MODE must be 1 (fast) or 2 (safe)"
#endif

/* Check an assumption about the machine. limits.h values can be used
   in #if because they are plain numbers. */
#if INT_MAX < 2147483647
#  error "this program needs 32-bit int"
#endif

/* A forgotten setting is also worth catching. */
#ifndef BUFFER_SIZE
#  error "BUFFER_SIZE is not set"
#endif

/* Because BUFFER_SIZE is a power of two, wrapping round the ring
   buffer is a cheap mask instead of a % operation. */
#define WRAP(i) ((i) & (BUFFER_SIZE - 1))

int main(void)
{
    char ring[BUFFER_SIZE];
    int head = 0, i;
    const char *msg = "ring buffers wrap round. ";

    for (i = 0; i < BUFFER_SIZE; i++)
        ring[i] = '.';

    /* Write 3 copies of the message into the 64-byte ring. Later text
       overwrites the oldest. */
    for (i = 0; i < 3 * 25; i++) {
        ring[WRAP(head)] = msg[i % 25];
        head++;
    }

    printf("mode %s, buffer %d bytes, wrote %d chars\n",
           MODE == 1 ? "fast" : "safe", BUFFER_SIZE, head);
    printf("oldest to newest:\n  ");
    for (i = 0; i < BUFFER_SIZE; i++)
        putchar(ring[WRAP(head + i)]);
    putchar('\n');
    return 0;
}
