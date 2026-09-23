#ifndef REPORT_H
#define REPORT_H
#include "student.h"
void report_table(const char *title, const struct student *list, int n);
void report_summary(const struct student *list, int n);
#endif
