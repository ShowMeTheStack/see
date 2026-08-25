/*
 * title: Packing flags with bit-fields
 * level: 4
 * about: Packs a date and a few flags into bit-fields of one unsigned int, then looks at the raw word through a union to see where each field landed.
 */
#include <stdio.h>

/*
 * day needs 5 bits (1..31), month 4 (1..12), year 7 (0..127 years after
 * 1970), and three yes/no flags one bit each: 19 bits, so one 32-bit word.
 * Which end the first field goes at is up to the compiler; See (like gcc
 * on x86) starts at the low bit.
 */
struct packed {
    unsigned int day : 5;
    unsigned int month : 4;
    unsigned int year : 7;
    unsigned int holiday : 1;
    unsigned int weekend : 1;
    unsigned int booked : 1;
};

struct loose {
    int day, month, year, holiday, weekend, booked;
};

union view {
    struct packed p;
    unsigned int word;
};

static void binary(unsigned int w)
{
    int i;
    for (i = 18; i >= 0; i--) {
        putchar((w >> i) & 1u ? '1' : '0');
        if (i == 18 || i == 17 || i == 16 || i == 9 || i == 5)
            putchar('|');
    }
    putchar('\n');
}

int main(void)
{
    union view v;

    /* Clear the whole word first so the unused high bits are known zeros. */
    v.word = 0;
    v.p.day = 25;
    v.p.month = 12;
    v.p.year = 2026 - 1970;
    v.p.weekend = 0;
    v.p.holiday = 1;
    v.p.booked = 1;

    printf("struct packed is %u bytes, struct loose is %u bytes\n",
           (unsigned)sizeof(struct packed), (unsigned)sizeof(struct loose));
    printf("date %u/%u/%u  holiday %u  weekend %u  booked %u\n",
           (unsigned)v.p.day, (unsigned)v.p.month, 1970u + v.p.year,
           (unsigned)v.p.holiday, (unsigned)v.p.weekend, (unsigned)v.p.booked);
    printf("raw word 0x%05x\n", v.word);
    printf("fields   b|w|h|year   |mon |day   (b booked, w weekend, h holiday)\nbits     ");
    binary(v.word);

    /*
     * A bit-field wraps silently: 33 does not fit in 5 bits and becomes 1.
     * That is unsigned arithmetic, so it is well defined, but it is a quiet
     * way to lose data.
     */
    v.p.day = 33 & 31;
    printf("day set to 33 & 31 reads back as %u\n", (unsigned)v.p.day);
    return 0;
}
