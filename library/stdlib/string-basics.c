/*
 * title: The everyday string.h functions
 * level: 1
 * about: Builds a full name with strlen, strcpy, strcat, strncat and strcmp, checking buffer sizes and avoiding the strncpy trap.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char first[16];
    char last[16];
    char full[40];
    char initials[4];
    char short3[4];
    const char *names[3];
    int i, c;

    /* strcpy copies a string, including its closing '\0'. The target
       must be big enough; strcpy never checks. */
    strcpy(first, "Grace");
    strcpy(last, "Hopper");

    /* strlen counts characters up to, not including, the '\0'. */
    printf("first has %d letters in a %d-byte array\n",
           (int)strlen(first), (int)sizeof first);

    /*
     * Build "Hopper, Grace" in full. strcat finds the end of what is
     * already there and copies onto it. Check the room first: the two
     * names, ", " and the '\0'.
     */
    if (strlen(last) + 2 + strlen(first) + 1 <= sizeof full) {
        strcpy(full, last);
        strcat(full, ", ");
        strcat(full, first);
    }
    printf("full: \"%s\" (%d chars)\n", full, (int)strlen(full));

    /*
     * strncpy looks like the safe strcpy, but it is not: when the source
     * is n characters or longer it copies n and adds no '\0', leaving
     * something that is not a string. strncat is the better tool for
     * "copy at most n": it always adds the '\0'. Here a 4-byte array
     * gets the first 3 letters of the surname.
     */
    short3[0] = '\0';
    strncat(short3, last, sizeof short3 - 1);
    printf("first three letters: %s\n", short3);

    initials[0] = first[0];
    initials[1] = '.';
    initials[2] = last[0];
    initials[3] = '\0';
    printf("initials: %s\n", initials);

    /*
     * strcmp returns a negative number, zero or a positive number as
     * the first string sorts before, equal to or after the second.
     * Only the sign matters; the size is not promised.
     */
    names[0] = "Hopper";
    names[1] = "Hop";
    names[2] = "Lovelace";
    for (i = 0; i < 3; i++) {
        c = strcmp(last, names[i]);
        printf("strcmp(\"%s\", \"%s\") is %s\n", last, names[i],
               c < 0 ? "negative" : c > 0 ? "positive" : "zero");
    }

    /* == compares addresses, not contents. Two equal strings in two
       different arrays are different addresses. */
    strcpy(full, "Hopper");
    printf("full == last: %s, strcmp(full, last) == 0: %s\n",
           full == last ? "yes" : "no",
           strcmp(full, last) == 0 ? "yes" : "no");

    /*
     * In See, the arrays first, last, full and initials sit side by side
     * in main's frame. Bytes after each '\0' are left over from earlier
     * contents or still uninitialised: only up to the '\0' is the string.
     */
    return 0;
}
