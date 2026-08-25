/*
 * title: Swapping byte order by hand
 * level: 3
 * about: Writes a 32-bit number into a byte buffer in big-endian (network) order with shifts, reads it back, and compares with the machine's own little-endian bytes.
 */
#include <stdio.h>
#include <string.h>

/* Store the most significant byte first, whatever the machine does. */
static void put_be32(unsigned char *out, unsigned long v)
{
    out[0] = (unsigned char)(v >> 24);
    out[1] = (unsigned char)(v >> 16);
    out[2] = (unsigned char)(v >> 8);
    out[3] = (unsigned char)v;
}

static unsigned long get_be32(const unsigned char *in)
{
    return ((unsigned long)in[0] << 24) | ((unsigned long)in[1] << 16)
         | ((unsigned long)in[2] << 8) | (unsigned long)in[3];
}

/* Reverse the four bytes of a value with masks and shifts. */
static unsigned long swap32(unsigned long v)
{
    return ((v & 0x000000FFUL) << 24) | ((v & 0x0000FF00UL) << 8)
         | ((v & 0x00FF0000UL) >> 8)  | ((v & 0xFF000000UL) >> 24);
}

static void show(const char *label, const unsigned char *b)
{
    printf("%-14s %02x %02x %02x %02x\n", label, b[0], b[1], b[2], b[3]);
}

int main(void)
{
    unsigned long value = 0xCAFE1234UL;
    unsigned long native;
    unsigned char wire[4];
    unsigned char raw[4];

    put_be32(wire, value);
    memcpy(raw, &value, 4);

    /*
     * Shifts work on values, not on memory, so put_be32 gives the same bytes
     * on any machine. memcpy copies memory as it is, so raw shows this
     * machine's order. Watch the two byte arrays side by side in See.
     */
    show("big-endian", wire);
    show("this machine", raw);

    printf("read back from wire: 0x%08lx\n", get_be32(wire));
    printf("swap32(0x%08lx) = 0x%08lx\n", value, swap32(value));

    /* Reading the wire bytes as if they were a native long gives the swapped value. */
    memcpy(&native, wire, 4);
    printf("wire bytes as a native long: 0x%08lx\n", native);
    return 0;
}
