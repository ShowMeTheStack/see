/*
 * title: Caesar cipher and how to break it
 * level: 1
 * about: Shifts letters round the alphabet to encrypt and decrypt a message, then cracks a secret by trying all 26 shifts.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* Shift every letter by k, wrapping Z round to A. Case is kept and
   anything that is not a letter passes through unchanged. */
static void shift(char *s, int k)
{
    k = ((k % 26) + 26) % 26;   /* turn -3 into 23, so the % below stays positive */
    for (; *s; s++) {
        if (isupper((unsigned char)*s))
            *s = (char)('A' + (*s - 'A' + k) % 26);
        else if (islower((unsigned char)*s))
            *s = (char)('a' + (*s - 'a' + k) % 26);
    }
}

int main(void)
{
    char msg[64] = "Meet me at the Old Bridge, 9pm.";
    char secret[64] = "Wkh fdnh lv d olh";
    char trial[64];
    int k;

    printf("plain:     %s\n", msg);
    shift(msg, 3);
    printf("shift 3:   %s\n", msg);
    shift(msg, -3);   /* decrypting is shifting back */
    printf("shift -3:  %s\n", msg);

    /* Only 26 keys exist, so a computer can simply try them all. A person
       reading the list spots the one that makes sense. */
    printf("\ncracking \"%s\":\n", secret);
    for (k = 1; k < 26; k++) {
        strcpy(trial, secret);
        shift(trial, -k);
        printf("  key %2d: %s\n", k, trial);
    }
    return 0;
}
