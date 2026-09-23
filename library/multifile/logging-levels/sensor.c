/* sensor.c - a second user of the log module. It never touches the level;
 * main.c decides how chatty the whole program is. */
#include "log.h"
#include "sensor.h"

int sensor_read_all(const int *raw, int n)
{
    int i;
    int sum = 0;
    int good = 0;

    log_set_tag("sensor");
    for (i = 0; i < n; i++) {
        log_msg(LOG_DEBUG, "reading %d is %d", i, raw[i]);
        if (raw[i] < 0) {
            log_msg(LOG_ERROR, "sensor %d failed (code %d)", i, raw[i]);
        } else if (raw[i] > 90) {
            log_msg(LOG_WARN, "sensor %d running hot: %d", i, raw[i]);
            sum += raw[i];
            good++;
        } else {
            sum += raw[i];
            good++;
        }
    }
    log_set_tag("main");
    return good > 0 ? sum / good : 0;
}
