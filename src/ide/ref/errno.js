/* The C reference: <errno.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  errno: {
    header: 'errno.h',
    kind: 'variable',
    sig: 'extern int errno;',
    text: 'errno is an int that library functions set to a positive error number when something goes wrong: ENOENT when a file does not exist, ERANGE when a number does not fit, and so on. strerror(errno) turns the number into a message, and perror prints that message for you.\n\nNo library function ever sets errno to 0, and a function that succeeds may still change it. So errno only means something right after a call that reported failure through its return value (fopen returned NULL, strtol returned LONG_MAX). For functions like strtol and the math functions, whose return value cannot signal an error by itself, set errno = 0 just before the call and test it just after.\n\nSave errno in a variable if you need it later: a printf in between may change it. And read it in a separate statement from the call that sets it, because the order in which a function\'s arguments are evaluated is unspecified.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    FILE *f = fopen("/no/such/file.txt", "r");
    int saved;

    if (f == NULL) {
        saved = errno;
        printf("fopen failed: errno %d, %s\\n", saved, strerror(saved));
    }
    return 0;
}
`,
    see: ['strerror', 'perror', 'ENOENT', 'ERANGE', 'EDOM'],
  },
  EPERM: {
    text: 'EPERM (1), "Operation not permitted": the operation is forbidden for this program regardless of file permissions, typically something only the system administrator may do. Compare EACCES, which is about the permissions of a particular file.\n\nNo function in See\'s library sets it; it is here because programs written for Unix test for it.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    printf("EPERM = %d: %s\\n", EPERM, strerror(EPERM));
    return 0;
}
`,
    see: ['EACCES', 'errno', 'strerror'],
  },
  ENOENT: {
    text: 'ENOENT (2), "No such file or directory": a file name given to fopen (for reading), remove or rename does not exist, or one of the folders in its path does not.\n\nIt is the error you get most often. Check the spelling, and whether the path is relative to the current folder or absolute.',
    example: `#include <stdio.h>
#include <errno.h>

int main(void)
{
    if (fopen("/missing.txt", "r") == NULL && errno == ENOENT)
        printf("no file called /missing.txt\\n");
    return 0;
}
`,
    see: ['fopen', 'remove', 'perror', 'errno'],
  },
  EIO: {
    text: 'EIO (5), "Input/output error": the device itself failed while reading or writing, for example a disk error. The program can do little about it except report it.\n\nSee\'s file system never fails this way, so you will only see it in programs that set it themselves.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    printf("EIO = %d: %s\\n", EIO, strerror(EIO));
    return 0;
}
`,
    see: ['errno', 'ferror'],
  },
  EBADF: {
    text: 'EBADF (9), "Bad file descriptor": the stream cannot do what was asked of it. In See you get it when writing to a stream opened only for reading, reading from one opened only for writing, or calling ftell or fseek on the terminal.\n\nThe stream\'s error indicator is set as well, so ferror reports it.',
    example: `#include <stdio.h>
#include <errno.h>

int main(void)
{
    FILE *f = fopen("/data/numbers.txt", "r");

    if (f == NULL)
        return 1;
    errno = 0;
    if (fputc('x', f) == EOF && errno == EBADF)
        printf("cannot write to a stream opened with \\"r\\"\\n");
    fclose(f);
    return 0;
}
`,
    see: ['fopen', 'ferror', 'ftell'],
  },
  ENOMEM: {
    text: 'ENOMEM (12), "Cannot allocate memory": there is not enough memory for the request. In See, malloc, calloc and realloc set it when they return NULL.\n\nThe C standard does not require malloc to set errno at all, so the portable test is the NULL return value.',
    example: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int main(void)
{
    void *p;

    errno = 0;
    p = malloc(2000000000u);
    if (p == NULL)
        printf("malloc failed%s\\n", errno == ENOMEM ? ": out of memory" : "");
    free(p);
    return 0;
}
`,
    see: ['malloc', 'calloc', 'realloc', 'heap'],
  },
  EACCES: {
    text: 'EACCES (13), "Permission denied": the file exists but the program is not allowed to do this to it, such as opening a read-only file for writing or creating a file in a read-only folder.\n\nIn See the /locked folder is read-only, so you can try it there.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    FILE *f = fopen("/locked/readme.txt", "w");

    if (f == NULL)
        printf("errno %d: %s\\n", errno, errno == EACCES ? "permission denied" : "other error");
    return 0;
}
`,
    see: ['fopen', 'EPERM', 'remove'],
  },
  EEXIST: {
    text: 'EEXIST (17), "File exists": the operation would create something that is already there.\n\nIn C89 neither fopen nor rename is required to report it: fopen with "w" simply truncates an existing file, and what rename does when the new name exists is implementation-defined.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    printf("EEXIST = %d: %s\\n", EEXIST, strerror(EEXIST));
    return 0;
}
`,
    see: ['rename', 'fopen', 'errno'],
  },
  ENOTDIR: {
    text: 'ENOTDIR (20), "Not a directory": a part of a path that should be a folder is an ordinary file, as in /data/numbers.txt/x.\n\nSee\'s fopen reports this case as ENOENT instead, which is also a reasonable reading: the file does not exist.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    printf("ENOTDIR = %d: %s\\n", ENOTDIR, strerror(ENOTDIR));
    return 0;
}
`,
    see: ['ENOENT', 'EISDIR', 'fopen'],
  },
  EISDIR: {
    text: 'EISDIR (21), "Is a directory": the program tried to open a folder as if it were a file. fopen("/data", "r") gives it in See.\n\nC89 has no functions for listing folders; they come from the operating system (opendir on Unix).',
    example: `#include <stdio.h>
#include <errno.h>

int main(void)
{
    if (fopen("/data", "r") == NULL && errno == EISDIR)
        printf("/data is a folder, not a file\\n");
    return 0;
}
`,
    see: ['fopen', 'ENOTDIR'],
  },
  EINVAL: {
    text: 'EINVAL (22), "Invalid argument": an argument made no sense. In See: an fopen mode that is not one of r, w, a with optional + and b, an fseek whence that is not SEEK_SET, SEEK_CUR or SEEK_END, or a seek to before the start of a file.',
    example: `#include <stdio.h>
#include <errno.h>

int main(void)
{
    FILE *f = fopen("/data/numbers.txt", "r");

    if (f == NULL)
        return 1;
    errno = 0;
    if (fseek(f, -10L, SEEK_SET) != 0 && errno == EINVAL)
        printf("cannot seek before the start of the file\\n");
    fclose(f);
    return 0;
}
`,
    see: ['fseek', 'fopen'],
  },
  EMFILE: {
    text: 'EMFILE (24), "Too many open files": the program has reached the limit on streams open at the same time. In See that limit is FOPEN_MAX, 20 streams, and stdin, stdout and stderr count among them, so 17 files can be open at once.\n\nIt nearly always means a file is opened in a loop and never closed. Every fopen needs an fclose.',
    example: `#include <stdio.h>
#include <errno.h>

int main(void)
{
    FILE *fs[40];
    int i, n;

    for (n = 0; n < 40; n++)
        if ((fs[n] = fopen("/data/numbers.txt", "r")) == NULL)
            break;
    if (n < 40 && errno == EMFILE)
        printf("fopen failed after %d files: too many open\\n", n);
    for (i = 0; i < n; i++)
        fclose(fs[i]);
    return 0;
}
`,
    see: ['fopen', 'fclose', 'FOPEN_MAX'],
  },
  ENOSPC: {
    text: 'ENOSPC (28), "No space left on device": a write failed because the disk is full. In See the browser file system has a limit on total size and on the number of files.\n\nBecause output is buffered, the failure may only show up at fflush or fclose, so check their return values when writing important data.',
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    printf("ENOSPC = %d: %s\\n", ENOSPC, strerror(ENOSPC));
    return 0;
}
`,
    see: ['fclose', 'fflush', 'ferror'],
  },
  EDOM: {
    text: 'EDOM (33), "Numerical argument out of domain": a math function was given an argument for which it has no answer, such as sqrt(-1.0), log(-1.0) or acos(2.0). The function returns a NaN, which printf shows as nan.\n\nSet errno to 0 before the call and test it afterwards; the return value alone does not say an error happened.',
    example: `#include <stdio.h>
#include <math.h>
#include <errno.h>

int main(void)
{
    double r;

    errno = 0;
    r = sqrt(-4.0);
    if (errno == EDOM)
        printf("sqrt(-4) is outside the domain, result %f\\n", r);
    return 0;
}
`,
    see: ['ERANGE', 'sqrt', 'log', 'errno'],
  },
  ERANGE: {
    text: 'ERANGE (34), "Numerical result out of range": a result is too large (or too small) to represent. The math functions return HUGE_VAL on overflow; strtol returns LONG_MAX or LONG_MIN and strtoul ULONG_MAX; strtod returns HUGE_VAL or 0.\n\nThose return values are also legitimate results, so the only reliable test is errno: set it to 0 before the call and check it afterwards.',
    example: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <errno.h>

int main(void)
{
    long v;

    errno = 0;
    v = strtol("99999999999", NULL, 10);
    if (errno == ERANGE)
        printf("too big for a long; strtol gave %ld (LONG_MAX is %ld)\\n", v, LONG_MAX);
    return 0;
}
`,
    see: ['EDOM', 'strtol', 'HUGE_VAL', 'LONG_MAX'],
  },
});
