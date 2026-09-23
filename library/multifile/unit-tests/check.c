#include <stdio.h>
#include "check.h"

int checks_run = 0;
int checks_failed = 0;

void check_report(int ok, const char *text, const char *file, int line)
{
    checks_run++;
    if (!ok) {
        checks_failed++;
        printf("  FAIL %s:%d: %s\n", file, line, text);
    }
}
