/*
 * title: Parsing CSV with quoted fields
 * level: 3
 * about: Splits CSV lines into fields with a small state machine that handles quotes, commas inside quotes and doubled quotes, then totals a column.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXF 6
#define MAXW 32

/* strtok cannot do this job: it treats every comma as a separator, even
   one inside "Smith, Jane", and it skips empty fields. A character-by-
   character loop with an in_quotes flag gets it right.
   Returns the number of fields found. */
static int split_csv(const char *line, char field[][MAXW], int maxf)
{
    int nf = 0, len = 0;
    int in_quotes = 0;
    const char *p = line;

    field[0][0] = '\0';
    for (; *p != '\0' && *p != '\n'; p++) {
        if (in_quotes) {
            if (*p == '"' && p[1] == '"') {
                /* "" inside quotes means one real quote character */
                if (len < MAXW - 1)
                    field[nf][len++] = '"';
                p++;
            } else if (*p == '"') {
                in_quotes = 0;
            } else if (len < MAXW - 1) {
                field[nf][len++] = *p;
            }
        } else if (*p == '"') {
            in_quotes = 1;
        } else if (*p == ',') {
            field[nf][len] = '\0';
            if (nf + 1 >= maxf)
                return nf + 1;      /* too many fields: stop */
            nf++;
            len = 0;
        } else if (len < MAXW - 1) {
            field[nf][len++] = *p;
        }
    }
    field[nf][len] = '\0';
    return nf + 1;
}

int main(void)
{
    FILE *fp;
    char line[128];
    char field[MAXF][MAXW];     /* watch this 2-D array fill row by row */
    int n, i, row = 0;
    double total = 0.0;

    fp = fopen("/tmp/orders.csv", "w");
    if (fp == NULL) {
        perror("/tmp/orders.csv");
        return 1;
    }
    fputs("customer,item,qty,price\n", fp);
    fputs("\"Smith, Jane\",stapler,2,4.50\n", fp);
    fputs("Okafor,\"6\"\" ruler\",3,1.20\n", fp);
    fputs("Lee,,1,9.99\n", fp);
    fputs("\"Ruiz\",\"paper, A4\",5,3.25\n", fp);
    fclose(fp);

    fp = fopen("/tmp/orders.csv", "r");
    if (fp == NULL) {
        perror("/tmp/orders.csv");
        return 1;
    }
    while (fgets(line, sizeof line, fp) != NULL) {
        n = split_csv(line, field, MAXF);
        if (row == 0) {             /* the header row: just show it */
            printf("columns:");
            for (i = 0; i < n; i++)
                printf(" <%s>", field[i]);
            printf("\n");
        } else {
            for (i = 0; i < n; i++)
                printf("[%s] ", field[i]);
            if (n == 4) {
                /* atof and atoi turn the text of a field into numbers */
                double line_total = atoi(field[2]) * atof(field[3]);
                printf("= %.2f", line_total);
                total += line_total;
            }
            printf("\n");
        }
        row++;
    }
    fclose(fp);
    printf("%d orders, total %.2f\n", row - 1, total);
    return 0;
}
