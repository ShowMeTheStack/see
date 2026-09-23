/* log.c - keeps the current level and counters as static data, and uses
 * <stdarg.h> so log_msg can take any arguments printf could. */
#include <stdio.h>
#include <stdarg.h>
#include "log.h"

static enum log_level current = LOG_INFO;
static const char *current_tag = "main";
static int printed[4];      /* static, so these start at zero */
static int dropped;

static const char *level_name(enum log_level level)
{
    switch (level) {
    case LOG_DEBUG: return "DEBUG";
    case LOG_INFO:  return "INFO ";
    case LOG_WARN:  return "WARN ";
    case LOG_ERROR: return "ERROR";
    }
    return "?????";
}

void log_set_level(enum log_level level)
{
    current = level;
}

void log_set_tag(const char *tag)
{
    current_tag = tag;
}

/* The "..." arguments are reached through a va_list. vprintf is printf's
 * twin that takes a va_list instead of the arguments themselves. */
void log_msg(enum log_level level, const char *fmt, ...)
{
    va_list ap;

    if (level < current) {
        dropped++;
        return;
    }
    printed[level]++;
    printf("%s [%-6s] ", level_name(level), current_tag);
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
    printf("\n");
}

void log_summary(void)
{
    printf("logged: %d debug, %d info, %d warn, %d error; %d dropped\n",
           printed[LOG_DEBUG], printed[LOG_INFO], printed[LOG_WARN], printed[LOG_ERROR], dropped);
}
