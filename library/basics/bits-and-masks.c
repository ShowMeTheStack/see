/*
 * title: Bits, masks and shifts
 * level: 3
 * about: Prints numbers in binary and uses &, |, ^, ~, << and >> to set, clear, flip and test single bits in a byte of flags.
 */
#include <stdio.h>

/* Each flag is one bit. Writing them as 1 << n makes the bit number plain. */
#define FLAG_READ    (1 << 0)
#define FLAG_WRITE   (1 << 1)
#define FLAG_EXECUTE (1 << 2)
#define FLAG_HIDDEN  (1 << 7)

/* Prints the low 8 bits of v, highest bit first. (v >> i) & 1 moves bit i
   down to the bottom and masks off everything else. */
static void print_binary(const char *label, unsigned v)
{
    int i;
    printf("%-22s ", label);
    for (i = 7; i >= 0; i--) {
        printf("%u", (v >> i) & 1u);
    }
    printf("  (%3u, 0x%02x)\n", v, v);
}

int main(void)
{
    unsigned flags = 0;
    unsigned x = 0x5A;

    print_binary("x", x);
    print_binary("x << 1 (times 2)", (x << 1) & 0xFFu);
    print_binary("x >> 2 (divide by 4)", x >> 2);
    print_binary("~x (every bit flipped)", ~x & 0xFFu);
    print_binary("x & 0x0F (low half)", x & 0x0Fu);
    print_binary("x | 0x0F (low set)", x | 0x0Fu);
    print_binary("x ^ 0xFF (flip all)", x ^ 0xFFu);

    /*
     * The four everyday operations on a flags word. Step through and watch
     * flags change on the stack; See can show it in hex too.
     *   set:    flags |=  BIT
     *   clear:  flags &= ~BIT
     *   flip:   flags ^=  BIT
     *   test:   (flags & BIT) != 0
     */
    printf("\n");
    flags |= FLAG_READ | FLAG_WRITE;
    print_binary("set read and write", flags);

    flags |= FLAG_HIDDEN;
    print_binary("set hidden", flags);

    flags &= ~FLAG_WRITE;
    print_binary("clear write", flags);

    flags ^= FLAG_EXECUTE;
    print_binary("flip execute", flags);

    printf("\nreadable? %s  writable? %s  executable? %s  hidden? %s\n",
           (flags & FLAG_READ) ? "yes" : "no",
           (flags & FLAG_WRITE) ? "yes" : "no",
           (flags & FLAG_EXECUTE) ? "yes" : "no",
           (flags & FLAG_HIDDEN) ? "yes" : "no");

    /* A neat trick: n & (n - 1) clears the lowest set bit, so it is 0
       exactly when n is a power of two. */
    printf("64 a power of two? %s; 96? %s\n",
           (64 & 63) == 0 ? "yes" : "no", (96 & 95) == 0 ? "yes" : "no");
    return 0;
}
