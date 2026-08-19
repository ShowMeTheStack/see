/*
 * title: Vigenere cipher with a keyword
 * level: 2
 * about: Encrypts and decrypts with a repeating keyword, so the same letter is shifted by different amounts, and prints the working letter by letter.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* dir is +1 to encrypt, -1 to decrypt. The key position only moves on
   letters, so spaces and punctuation do not use up key letters. */
static void vigenere(const char *in, char *out, const char *key, int dir, int trace)
{
    int klen = (int)strlen(key);
    int ki = 0, shift, base;

    for (; *in; in++, out++) {
        if (!isalpha((unsigned char)*in)) {
            *out = *in;
            continue;
        }
        base = isupper((unsigned char)*in) ? 'A' : 'a';
        shift = toupper((unsigned char)key[ki % klen]) - 'A';
        *out = (char)(base + (*in - base + dir * shift + 26) % 26);
        if (trace)
            printf("  %c + %c(%2d) -> %c\n", *in, key[ki % klen], shift, *out);
        ki++;
    }
    *out = '\0';   /* the loop stopped at in's NUL without copying it */
}

int main(void)
{
    const char *plain = "Attack at dawn";
    const char *key = "LEMON";
    char enc[64], dec[64];

    printf("key: %s\n", key);
    vigenere(plain, enc, key, +1, 1);
    printf("plain:     %s\n", plain);
    printf("encrypted: %s\n", enc);
    vigenere(enc, dec, key, -1, 0);
    printf("decrypted: %s\n", dec);
    /* The two a's in "Attack" become different letters: the trick that
       defeated simple letter-frequency attacks for three centuries. */
    return 0;
}
