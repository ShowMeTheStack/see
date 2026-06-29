#include <stdio.h>
#include <stdarg.h>
int sum(int n, ...)
{
    va_list ap;
    int s = 0;
    va_start(ap, n);
    while (n-- > 0) s += va_arg(ap, int);
    va_end(ap);
    return s;
}
double avg(int n, ...)
{
    va_list ap;
    double s = 0;
    int i;
    va_start(ap, n);
    for (i = 0; i < n; i++) s += va_arg(ap, double);
    va_end(ap);
    return s / n;
}
void logf2(const char *fmt, ...)
{
    va_list ap;
    va_start(ap, fmt);
    printf("[log] ");
    vprintf(fmt, ap);
    va_end(ap);
}
int main(void)
{
    char buf[40];
    printf("%d\n", sum(4, 1, 2, 3, 4));
    printf("%.2f\n", avg(3, 1.0, 2.0, 4.5));
    logf2("%s=%d\n", "x", 5);
    sprintf(buf, "%s|%c|%5.1f", "ok", 'y', 2.5f);
    puts(buf);
    return 0;
}
/* OUTPUT
10
2.50
[log] x=5
ok|y|  2.5
*/
