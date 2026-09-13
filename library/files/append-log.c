/*
 * title: Appending to a log file
 * level: 1
 * about: Opens a log in append mode three separate times to add entries, then prints the whole log.
 */
#include <stdio.h>

/* Each call opens, writes one line and closes. With "a" every write goes
   to the end of the file, whatever was there before is kept. */
static int log_line(const char *path, int step, const char *message)
{
    FILE *fp = fopen(path, "a");

    if (fp == NULL) {
        perror(path);
        return 0;
    }
    fprintf(fp, "[step %d] %s\n", step, message);
    fclose(fp);
    return 1;
}

int main(void)
{
    const char *path = "/tmp/app.log";
    FILE *fp;
    int c;

    /* Start fresh: "w" truncates the old log to nothing. Without this,
       running the program twice would leave six lines. */
    fp = fopen(path, "w");
    if (fp == NULL) {
        perror(path);
        return 1;
    }
    fprintf(fp, "log started\n");
    fclose(fp);

    log_line(path, 1, "loaded settings");
    log_line(path, 2, "connected to printer");
    log_line(path, 3, "printed 4 pages");

    /* Print the file back exactly as it is stored. */
    fp = fopen(path, "r");
    if (fp == NULL) {
        perror(path);
        return 1;
    }
    while ((c = fgetc(fp)) != EOF)
        putchar(c);
    fclose(fp);
    return 0;
}
