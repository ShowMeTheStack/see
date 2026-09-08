/*
 * title: A logging module with compile-time levels
 * level: 3
 * about: Splits a logger and a queue into separate files, where each file chooses its own log level with a macro set before including log.h.
 */
#include <stdio.h>

/*
 * main.c only wants warnings and errors. Its LOG_I and LOG_T calls
 * turn into ((void)0), while queue.c, which set LOG_TRACE, logs
 * everything. Each .c file is preprocessed on its own, so a macro set
 * in one file has no effect on another.
 */
#define LOG_LEVEL LOG_WARN
#include "log.h"
#include "queue.h"

int main(void)
{
    int i, v;

    LOG_I("starting, this line is compiled away", 0);

    for (i = 1; i <= 6; i++)
        queue_put(i * 10);

    for (i = 0; i < 5; i++) {
        if (queue_get(&v))
            LOG_T("main received", v);   /* also compiled away */
    }

    if (log_count() > 5)
        LOG_W("many log lines written:", log_count());

    printf("%d log lines in total\n", log_count());
    return 0;
}
