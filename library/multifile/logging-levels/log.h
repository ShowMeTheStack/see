/* log.h - a small logging module with levels.
 * Messages below the current level are dropped, so you can leave debug
 * logging in the code and switch it off in one place. */
#ifndef LOG_H
#define LOG_H

enum log_level { LOG_DEBUG, LOG_INFO, LOG_WARN, LOG_ERROR };

void log_set_level(enum log_level level);
void log_set_tag(const char *tag);
void log_msg(enum log_level level, const char *fmt, ...);
void log_summary(void);

#endif
