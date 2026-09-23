/* check.h - a test framework in one macro.
 * CHECK(cond) records a pass or a failure and, on failure, prints the
 * condition as text (#cond), the file and the line. Unlike assert, it
 * keeps going, so one run reports every broken test. */
#ifndef CHECK_H
#define CHECK_H

extern int checks_run;
extern int checks_failed;

void check_report(int ok, const char *text, const char *file, int line);

#define CHECK(cond) check_report((cond) != 0, #cond, __FILE__, __LINE__)

#endif
