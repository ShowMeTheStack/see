/*
 * title: tail - the last N lines with a ring buffer
 * level: 3
 * about: Prints the last four lines of a file in one pass by keeping only the most recent lines in a circular array of heap strings.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define KEEP 4

int main(void)
{
    FILE *fp;
    char line[100];
    char *ring[KEEP];       /* each slot points to a heap copy of a line */
    long total = 0;
    int i, slot, start, count;

    fp = fopen("/tmp/diary.txt", "w");
    if (fp == NULL) {
        perror("/tmp/diary.txt");
        return 1;
    }
    for (i = 1; i <= 10; i++)
        fprintf(fp, "day %2d: %s\n", i, i % 3 == 0 ? "rain" : i % 3 == 1 ? "sun" : "clouds");
    fclose(fp);

    for (i = 0; i < KEEP; i++)
        ring[i] = NULL;

    fp = fopen("/tmp/diary.txt", "r");
    if (fp == NULL) {
        perror("/tmp/diary.txt");
        return 1;
    }

    /* Line number total goes into slot total % KEEP. Once the ring is
       full, the newest line overwrites the oldest, so memory use stays at
       KEEP lines however long the file is. In the memory picture, watch
       the four heap blocks: one is freed and replaced on every line. */
    while (fgets(line, sizeof line, fp) != NULL) {
        slot = (int)(total % KEEP);
        free(ring[slot]);           /* free(NULL) is allowed and does nothing */
        ring[slot] = malloc(strlen(line) + 1);
        if (ring[slot] == NULL) {
            fprintf(stderr, "out of memory\n");
            break;
        }
        strcpy(ring[slot], line);
        total++;
    }
    fclose(fp);

    /* The oldest kept line sits right after the newest one. */
    count = total < KEEP ? (int)total : KEEP;
    start = total < KEEP ? 0 : (int)(total % KEEP);
    printf("last %d of %ld lines:\n", count, total);
    for (i = 0; i < count; i++)
        fputs(ring[(start + i) % KEEP], stdout);

    for (i = 0; i < KEEP; i++)
        free(ring[i]);
    return 0;
}
