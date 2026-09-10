/*
 * title: A printf-style logger with vfprintf and vsprintf
 * level: 3
 * about: Builds log functions that take printf formats, add a level tag and a line counter, keep the last message in a buffer, and pass the arguments on with va_list.
 */
#include <stdio.h>
#include <stdarg.h>
#include <string.h>

enum level { DEBUG, INFO, WARN, ERROR };

static const char *level_names[] = { "debug", "info", "WARN", "ERROR" };
static enum level threshold = INFO;
static int line_no = 0;
static char last_error[120];

/*
 * A function cannot pass its ... on to printf directly. Instead the
 * standard library has a "v" version of each printf function that takes
 * a va_list: vprintf, vfprintf, vsprintf. The logger collects its
 * arguments into a va_list and hands that over.
 */
static void vlog(enum level lv, const char *fmt, va_list ap)
{
    if (lv < threshold)
        return;
    line_no++;
    printf("%03d %-5s ", line_no, level_names[lv]);
    vfprintf(stdout, fmt, ap);
    printf("\n");
}

static void log_msg(enum level lv, const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    vlog(lv, fmt, ap);
    va_end(ap);
}

/*
 * Errors are also kept in last_error. A va_list may be used only once,
 * so the arguments are walked twice with two va_start / va_end pairs.
 * C89 has no vsnprintf, so the buffer must be big enough for anything
 * the format can produce: keep formats for it short and simple.
 */
static void log_error(const char *fmt, ...)
{
    va_list ap;

    va_start(ap, fmt);
    vlog(ERROR, fmt, ap);
    va_end(ap);

    va_start(ap, fmt);
    vsprintf(last_error, fmt, ap);
    va_end(ap);
}

int main(void)
{
    int i, failures = 0;
    double temps[4];

    temps[0] = 21.5; temps[1] = 48.2; temps[2] = 22.0; temps[3] = 95.7;
    strcpy(last_error, "(none)");

    log_msg(INFO, "starting with %d sensors", 4);
    log_msg(DEBUG, "this is below the threshold and is dropped");

    for (i = 0; i < 4; i++) {
        if (temps[i] > 90.0) {
            log_error("sensor %d overheated: %.1f C", i, temps[i]);
            failures++;
        } else if (temps[i] > 40.0)
            log_msg(WARN, "sensor %d running warm: %.1f C", i, temps[i]);
        else
            log_msg(DEBUG, "sensor %d ok", i);
    }

    threshold = DEBUG;
    log_msg(DEBUG, "threshold lowered, debug lines now %s", "appear");
    log_msg(INFO, "%d failure%s; last error was \"%s\"",
            failures, failures == 1 ? "" : "s", last_error);

    /*
     * In See, last_error is a global char array: after the vsprintf
     * line, watch the formatted message appear in it byte by byte.
     */
    return 0;
}
