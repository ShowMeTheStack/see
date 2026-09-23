/*
 * title: A logging module with levels
 * level: 3
 * about: Logs from two files through one module whose level filter decides which messages appear.
 */

/* The folder holds main.c, log.c and sensor.c (plus their headers).
 * See builds each .c file on its own and links the three together; there is
 * only one copy of log.c's static level, shared by every caller. */
#include <stdio.h>
#include "log.h"
#include "sensor.h"

int main(void)
{
    int raw[6];
    int avg;

    raw[0] = 40; raw[1] = 95; raw[2] = -3;
    raw[3] = 55; raw[4] = 61; raw[5] = 99;

    log_msg(LOG_INFO, "starting with %d sensors", 6);

    /* First pass at the default level, INFO: the DEBUG lines are dropped. */
    avg = sensor_read_all(raw, 6);
    log_msg(LOG_INFO, "average reading %d", avg);

    /* Turn on everything and run again. Nothing in sensor.c changes. */
    printf("-- switching to DEBUG --\n");
    log_set_level(LOG_DEBUG);
    avg = sensor_read_all(raw, 3);
    log_msg(LOG_INFO, "average of first three %d", avg);

    /* Errors only. */
    printf("-- switching to ERROR --\n");
    log_set_level(LOG_ERROR);
    sensor_read_all(raw, 6);
    log_msg(LOG_INFO, "this line is dropped");

    log_summary();
    return 0;
}
