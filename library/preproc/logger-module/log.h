/*
 * log.h - a logging module whose verbosity is chosen at compile time.
 *
 * LOG_LEVEL decides which calls exist at all. Any call below the level
 * becomes ((void)0) and costs nothing, not even the evaluation of its
 * arguments. A file may set LOG_LEVEL before including this header;
 * otherwise the default below is used.
 */
#ifndef LOG_H
#define LOG_H

#define LOG_ERROR 1
#define LOG_WARN  2
#define LOG_INFO  3
#define LOG_TRACE 4

#ifndef LOG_LEVEL
#  define LOG_LEVEL LOG_INFO
#endif

/* The one real function. The macros below add the file and line. */
void log_write(int level, const char *file, int line, const char *msg, int value);
int log_count(void);

#if LOG_LEVEL >= LOG_ERROR
#  define LOG_E(msg, v) log_write(LOG_ERROR, __FILE__, __LINE__, (msg), (v))
#else
#  define LOG_E(msg, v) ((void)0)
#endif

#if LOG_LEVEL >= LOG_WARN
#  define LOG_W(msg, v) log_write(LOG_WARN, __FILE__, __LINE__, (msg), (v))
#else
#  define LOG_W(msg, v) ((void)0)
#endif

#if LOG_LEVEL >= LOG_INFO
#  define LOG_I(msg, v) log_write(LOG_INFO, __FILE__, __LINE__, (msg), (v))
#else
#  define LOG_I(msg, v) ((void)0)
#endif

#if LOG_LEVEL >= LOG_TRACE
#  define LOG_T(msg, v) log_write(LOG_TRACE, __FILE__, __LINE__, (msg), (v))
#else
#  define LOG_T(msg, v) ((void)0)
#endif

#endif /* LOG_H */
