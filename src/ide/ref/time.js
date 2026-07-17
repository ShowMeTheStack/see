/* The C reference: <time.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  clock_t: {
    text: 'clock_t is the arithmetic type that clock() returns: processor time measured in "clock ticks". Here it is a long.\n\nDivide a difference of two clock_t values by CLOCKS_PER_SEC to get seconds, and do the division in floating point, (double)(end - start) / CLOCKS_PER_SEC, or a short interval rounds down to 0.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    clock_t start = clock();
    long i, sum = 0;

    for (i = 0; i < 100000L; i++)
        sum += i % 7;
    printf("sum %ld after %ld ticks\\n", sum, (long)(clock() - start));
    return 0;
}
`,
    see: ['clock', 'CLOCKS_PER_SEC', 'time_t'],
  },
  time_t: {
    text: 'time_t is the arithmetic type that holds a calendar time, as returned by time(). Here it is a long counting the seconds since 1 January 1970, 00:00:00 UTC (the Unix epoch), but the C standard does not promise that, so portable code converts with localtime or gmtime and subtracts with difftime.\n\nA 32-bit signed time_t runs out in January 2038.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t t = 0;

    printf("time_t 0 is %s", asctime(gmtime(&t)));
    printf("a time_t has %d bytes here\\n", (int)sizeof(time_t));
    return 0;
}
`,
    see: ['time', 'difftime', 'gmtime', 'localtime', 'tm'],
  },
  tm: {
    header: 'time.h',
    kind: 'type',
    sig: 'struct tm { int tm_sec, tm_min, tm_hour, tm_mday, tm_mon, tm_year, tm_wday, tm_yday, tm_isdst; };',
    text: 'struct tm holds a calendar time broken into its parts. localtime and gmtime fill one in; mktime, asctime and strftime read one.\n\nThe fields have surprising origins: tm_mon counts months from 0 (January is 0, December 11), tm_year counts years since 1900 (2024 is 124), tm_wday counts days since Sunday (0 to 6) and tm_yday days since 1 January (0 to 365). tm_mday is the only one that starts at 1. tm_sec can be 60 for a leap second. tm_isdst is positive when daylight saving time is in effect, 0 when it is not and negative when unknown.\n\nWhen you build one yourself, set every field (struct tm t = {0}; is a quick way) and set tm_isdst to -1 to let mktime decide. In See\'s memory picture a struct tm is nine ints in a row, 36 bytes.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    struct tm t = {0};

    t.tm_year = 2000 - 1900;
    t.tm_mon = 11;
    t.tm_mday = 25;
    t.tm_isdst = -1;
    mktime(&t);
    printf("25 December 2000 was day %d of the year, weekday %d\\n", t.tm_yday + 1, t.tm_wday);
    return 0;
}
`,
    see: ['mktime', 'localtime', 'gmtime', 'strftime', 'asctime'],
  },
  CLOCKS_PER_SEC: {
    text: 'CLOCKS_PER_SEC is the number of clock_t ticks in one second of processor time. Here it is 1000000, so one tick is a microsecond.\n\nIt is a long, so (end - start) / CLOCKS_PER_SEC is an integer division that truncates. Convert to double first for a fractional number of seconds.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    clock_t start = clock();
    double x = 0;
    int i;

    for (i = 1; i < 20000; i++)
        x += 1.0 / i;
    printf("x = %f, took %.6f s of processor time\\n", x, (double)(clock() - start) / CLOCKS_PER_SEC);
    return 0;
}
`,
    see: ['clock', 'clock_t'],
  },
  clock: {
    text: 'clock() returns the processor time the program has used so far, in clock_t ticks, or (clock_t)-1 if it is not available.\n\nThe value at program start is not necessarily 0, so only the difference between two calls means anything. Divide that difference by CLOCKS_PER_SEC for seconds.\n\nIt measures time spent computing, not time on the wall clock: a program waiting for input uses almost none. For calendar time use time().',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    clock_t a, b;
    long i, n = 0;

    a = clock();
    for (i = 0; i < 50000L; i++)
        n += i & 1;
    b = clock();
    printf("%ld odd numbers, %.6f seconds\\n", n, (double)(b - a) / CLOCKS_PER_SEC);
    return 0;
}
`,
    see: ['CLOCKS_PER_SEC', 'clock_t', 'time'],
  },
  difftime: {
    text: 'difftime(time1, time0) returns time1 - time0 in seconds, as a double.\n\nNotice the order: later time first. On this machine subtracting two time_t values directly gives the same answer, but difftime is the portable way since the standard does not say what a time_t counts.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t start = 0, end = 90061;

    printf("%.0f seconds apart\\n", difftime(end, start));
    printf("that is %.2f days\\n", difftime(end, start) / 86400);
    return 0;
}
`,
    see: ['time', 'time_t', 'mktime'],
  },
  mktime: {
    text: 'mktime(&t) converts a struct tm holding local time into a time_t. It returns (time_t)-1 if the time cannot be represented.\n\nIt also normalises the structure: fields out of range are carried over (tm_mday = 32 in January becomes 1 February) and tm_wday and tm_yday are filled in. So it doubles as a calendar calculator: add 100 to tm_mday, call mktime, and read the new date.\n\nIt ignores the incoming tm_wday and tm_yday. Set tm_isdst to -1 so it works out daylight saving time itself.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    struct tm t = {0};
    char buf[40];

    t.tm_year = 2024 - 1900;
    t.tm_mon = 0;
    t.tm_mday = 1 + 100;
    t.tm_hour = 12;
    t.tm_isdst = -1;
    if (mktime(&t) == (time_t)-1)
        return 1;
    strftime(buf, sizeof buf, "%A %d %B %Y", &t);
    printf("100 days after 1 January 2024: %s\\n", buf);
    return 0;
}
`,
    see: ['tm', 'localtime', 'strftime', 'time_t'],
  },
  time: {
    text: 'time(&t) returns the current calendar time as a time_t, and also stores it in t when the pointer is not NULL. time(NULL) is the usual call. It returns (time_t)-1 if the time is not available.\n\nThe value changes from run to run, so programs that print it give different output each time. A classic use is seeding the random number generator: srand((unsigned)time(NULL)).\n\nTo show the time, convert it with localtime and format it with strftime, or use ctime for a quick fixed format.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t now = time(NULL);
    struct tm *lt = localtime(&now);

    printf("seconds since 1970: %ld\\n", (long)now);
    printf("the year is %d\\n", lt->tm_year + 1900);
    return 0;
}
`,
    see: ['localtime', 'ctime', 'difftime', 'srand'],
  },
  asctime: {
    text: 'asctime(&t) converts a struct tm into a string of the fixed form "Sun Sep 16 01:03:52 1973\\n", 26 characters including the newline and the NUL terminator.\n\nThe string lives in a static buffer inside the library. The next call to asctime or ctime overwrites it, so copy it out if you need to keep it, and never free it.\n\nThe string already ends in a newline; printf("%s", asctime(...)) needs no \\n of its own. For any other format use strftime.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    struct tm t = {0};

    t.tm_year = 69;
    t.tm_mon = 6;
    t.tm_mday = 20;
    t.tm_hour = 20;
    t.tm_min = 17;
    t.tm_wday = 0;
    printf("%s", asctime(&t));
    return 0;
}
`,
    see: ['ctime', 'strftime', 'tm'],
  },
  ctime: {
    text: 'ctime(&t) converts a time_t into the same fixed string as asctime, in local time. It is exactly asctime(localtime(&t)).\n\nNote that it takes a pointer to the time_t, not the time_t itself. The result is a static buffer that the next call overwrites, and it ends in a newline.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t t = 1000000000L;

    printf("one billion seconds: %s", ctime(&t));
    return 0;
}
`,
    see: ['asctime', 'localtime', 'time'],
  },
  gmtime: {
    text: 'gmtime(&t) converts a time_t into a struct tm in Coordinated Universal Time (UTC). It returns a pointer to a static struct tm inside the library, or NULL if the time cannot be converted.\n\nThe same static structure is shared with localtime: a call to either one overwrites what the other returned. Copy the structure (struct tm mine = *gmtime(&t);) if you need two at once.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t t = 86400L * 365;
    struct tm u = *gmtime(&t);

    printf("%04d-%02d-%02d %02d:%02d UTC\\n", u.tm_year + 1900, u.tm_mon + 1, u.tm_mday, u.tm_hour, u.tm_min);
    return 0;
}
`,
    see: ['localtime', 'tm', 'mktime', 'asctime'],
  },
  localtime: {
    text: 'localtime(&t) converts a time_t into a struct tm in the local time zone. It returns a pointer to a static structure that the next call to localtime or gmtime overwrites.\n\nRemember the field origins when printing: add 1900 to tm_year and 1 to tm_mon.\n\nThe pointer points into the library\'s own memory, not the heap, so never free it.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t t = 0;
    struct tm *p = localtime(&t);

    printf("the epoch here: %d-%02d-%02d %02d:%02d\\n", p->tm_year + 1900, p->tm_mon + 1, p->tm_mday, p->tm_hour, p->tm_min);
    return 0;
}
`,
    see: ['gmtime', 'mktime', 'strftime', 'tm'],
  },
  strftime: {
    text: 'strftime(s, maxsize, format, &t) formats the time in t into the array s, following format the way printf follows its format. It writes at most maxsize characters including the NUL terminator, and returns the number of characters written not counting the NUL. If the result did not fit it returns 0 and the contents of s are undefined.\n\nCommon conversions: %Y year, %m month 01 to 12, %d day 01 to 31, %H hour 00 to 23, %M minute, %S second, %A and %a weekday name, %B and %b month name, %j day of the year, %p AM or PM, %% a percent sign.\n\nPass sizeof buf as maxsize when s is an array, so the size can never be wrong.',
    example: `#include <stdio.h>
#include <time.h>

int main(void)
{
    time_t t = 1234567890L;
    char buf[64];
    size_t n;

    n = strftime(buf, sizeof buf, "%Y-%m-%d %H:%M:%S, a %A in %B", gmtime(&t));
    printf("%s (%d characters)\\n", buf, (int)n);
    return 0;
}
`,
    see: ['asctime', 'localtime', 'gmtime', 'tm'],
  },
});
