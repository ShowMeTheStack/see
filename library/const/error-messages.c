/*
 * title: Returning const strings
 * level: 2
 * about: Maps error codes to messages with a function that returns const char *, so callers can print the text but never edit the shared table.
 */
#include <stdio.h>

enum status { OK, NOT_FOUND, NO_SPACE, BAD_INPUT, N_STATUS };

static const char * const messages[N_STATUS] = {
    "all good",
    "no such item",
    "storage is full",
    "input not understood"
};

/*
 * Returning const char * tells the caller: "this text is not yours to
 * change and not yours to free". Every caller gets a pointer to the SAME
 * characters, so one careless write would corrupt the message for all.
 */
const char *describe(enum status s)
{
    if (s < OK || s >= N_STATUS)
        return "unknown status";
    return messages[s];
}

/* Something that fails in different ways. */
enum status store(int *shelf, int *used, int cap, int item)
{
    int i;
    if (item <= 0)
        return BAD_INPUT;
    for (i = 0; i < *used; i++)
        if (shelf[i] == item)
            return OK;              /* already there */
    if (*used == cap)
        return NO_SPACE;
    shelf[(*used)++] = item;
    return OK;
}

int main(void)
{
    int shelf[3];
    int used = 0;
    int items[6];
    const char *msg;
    int i;

    items[0] = 5; items[1] = -2; items[2] = 7; items[3] = 5; items[4] = 9; items[5] = 11;

    for (i = 0; i < 6; i++)
        printf("store %3d: %s\n", items[i], describe(store(shelf, &used, 3, items[i])));

    /*
     * Keep the result in a const char *. Storing it in a plain char *
     * would warn: initialization discards 'const' qualifier from pointer
     * target type.
     */
    msg = describe(NOT_FOUND);
    printf("looked up: %s\n", msg);
    printf("same pointer twice: %s\n", describe(NOT_FOUND) == msg ? "yes" : "no");
    return 0;
}
