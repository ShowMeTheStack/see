/*
 * log.c - the body of the logging module.
 */
#include <stdio.h>
#include "log.h"

static int written = 0;

void log_write(int level, const char *file, int line, const char *msg, int value)
{
    static const char *names[] = { "?", "ERROR", "WARN", "INFO", "TRACE" };
    written++;
    printf("%-5s %s:%d  %s %d\n", names[level], file, line, msg, value);
}

int log_count(void)
{
    return written;
}
