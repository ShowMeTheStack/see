/*
 * title: A const lookup table for CRC-8
 * level: 3
 * about: Builds a CRC-8 table once at start-up, then checksums messages through a const pointer to it so the table cannot be damaged.
 */
#include <stdio.h>
#include <string.h>

static unsigned char table_storage[256];

/*
 * The rest of the program sees the table only through this pointer to
 * const. The storage is writable so that init can fill it, but after
 * init no other code can write to it by mistake.
 */
static const unsigned char *crc_table = table_storage;

void crc_init(void)
{
    int i, bit;
    unsigned char c;
    for (i = 0; i < 256; i++) {
        c = (unsigned char)i;
        for (bit = 0; bit < 8; bit++)
            c = (unsigned char)((c & 0x80) ? (c << 1) ^ 0x07 : (c << 1));   /* polynomial x^8+x^2+x+1 */
        table_storage[i] = c;
    }
}

/* One table lookup per byte instead of eight shifts. */
unsigned char crc8(const char *msg, size_t len)
{
    unsigned char crc = 0;
    size_t i;
    for (i = 0; i < len; i++)
        crc = crc_table[crc ^ (unsigned char)msg[i]];
    /* crc_table[0] = 1;   error: assignment of read-only location 'crc_table[0]' */
    return crc;
}

int main(void)
{
    const char *msgs[4];
    char tampered[32];
    int i;

    msgs[0] = "123456789";       /* the standard check string: CRC-8 is 0xf4 */
    msgs[1] = "hello";
    msgs[2] = "hellp";
    msgs[3] = "";

    crc_init();
    printf("table starts: %02x %02x %02x %02x\n", crc_table[0], crc_table[1], crc_table[2], crc_table[3]);

    for (i = 0; i < 4; i++)
        printf("crc8(\"%s\") = 0x%02x\n", msgs[i], crc8(msgs[i], strlen(msgs[i])));

    /* Flip one letter and the checksum changes completely. */
    strcpy(tampered, msgs[0]);
    tampered[4] = '0';
    printf("crc8(\"%s\") = 0x%02x\n", tampered, crc8(tampered, strlen(tampered)));
    return 0;
}
