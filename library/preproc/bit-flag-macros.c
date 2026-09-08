/*
 * title: Bit flag macros for a set of permissions
 * level: 2
 * about: Uses BIT, SET, CLEAR, TOGGLE and TEST macros to manage file-style permission flags packed into one unsigned int.
 */
#include <stdio.h>

/* BIT(n) is a number with only bit n set: 1, 2, 4, 8 ... */
#define BIT(n)            (1u << (n))

/* These take the flags variable itself, so they can change it. */
#define SET(flags, mask)    ((flags) |= (mask))
#define CLEAR(flags, mask)  ((flags) &= ~(mask))
#define TOGGLE(flags, mask) ((flags) ^= (mask))
#define TEST(flags, mask)   (((flags) & (mask)) != 0)

/* Named bits. Combined masks are made with |. */
#define P_READ    BIT(0)
#define P_WRITE   BIT(1)
#define P_EXEC    BIT(2)
#define P_HIDDEN  BIT(3)
#define P_LOCKED  BIT(4)
#define P_RW      (P_READ | P_WRITE)

static void show(const char *label, unsigned int f)
{
    int i;
    printf("%-22s ", label);
    /* Print the low 5 bits, highest first. */
    for (i = 4; i >= 0; i--)
        putchar(TEST(f, BIT(i)) ? '1' : '0');
    printf("  %c%c%c%s%s\n",
           TEST(f, P_READ) ? 'r' : '-',
           TEST(f, P_WRITE) ? 'w' : '-',
           TEST(f, P_EXEC) ? 'x' : '-',
           TEST(f, P_HIDDEN) ? " hidden" : "",
           TEST(f, P_LOCKED) ? " locked" : "");
}

int main(void)
{
    unsigned int perm = 0;

    show("start", perm);
    SET(perm, P_RW);
    show("set read+write", perm);
    SET(perm, P_EXEC);
    show("set exec", perm);
    CLEAR(perm, P_WRITE);
    show("clear write", perm);
    TOGGLE(perm, P_HIDDEN);
    show("toggle hidden", perm);
    TOGGLE(perm, P_HIDDEN);
    show("toggle hidden again", perm);
    SET(perm, P_LOCKED | P_WRITE);
    show("set locked and write", perm);

    /* All of the flags in a mask, or any of them? */
    printf("has all of rw: %s\n", (perm & P_RW) == P_RW ? "yes" : "no");
    printf("has any of exec/hidden: %s\n", TEST(perm, P_EXEC | P_HIDDEN) ? "yes" : "no");

    /*
     * In See, perm is one 4-byte variable. Hover it or look in the
     * memory view: every change above alters a single bit of the first
     * byte, and the other bytes stay zero.
     */
    printf("perm as a number: %u (0x%02X)\n", perm, perm);
    return 0;
}
