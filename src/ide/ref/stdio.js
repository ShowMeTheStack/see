// Reference texts for <stdio.h>.
SEE.RefText = Object.assign(SEE.RefText || {}, {
  // ---- types and constants ------------------------------------------------------------------------
  FILE: {
    header: 'stdio.h',
    kind: 'type',
    sig: 'typedef struct _iobuf { ... } FILE;',
    text: `The type of a stream: everything the library needs to know about one open file, the terminal input or the terminal output. You never declare a FILE yourself; fopen gives you a FILE *, and stdin, stdout and stderr are FILE * values that are ready when main starts. Every stdio function that works on a stream takes that pointer.\n\nTreat the contents as private to the library. In See the structure is real memory you can look at in the memory picture: _fd is 0, 1 or 2 for the standard streams and 3 and up for files, _flags shows read (1), write (2), end of file (4), error (8) and open (16), _cnt the bytes waiting in the output buffer, _bufmode the buffering mode, and _pos the position in the file. Watch _flags change as a loop reaches the end of a file.\n\nAfter fclose, the FILE * no longer refers to an open stream; using it again is an error that See reports. So is passing NULL, the usual result of not checking fopen.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/file-demo.txt", "w");
    if (fp == NULL) {
        printf("could not open the file\\n");
        return 1;
    }
    fprintf(fp, "hello\\n");
    printf("wrote %ld bytes\\n", ftell(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['fopen', 'fclose', 'stdin', 'stdout', 'stderr'],
  },
  fpos_t: {
    text: `A type that can record a position in a file, filled in by fgetpos and used by fsetpos to go back there. Here it is a long holding the byte offset, but treat it as opaque: on other systems it can be a structure that also records the state of a multibyte encoding, and the only portable thing to do with it is pass it back to fsetpos.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    fpos_t mark;
    char word[16];

    fp = fopen("/tmp/pos-demo.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("alpha beta gamma", fp);
    rewind(fp);
    fscanf(fp, "%15s", word);
    fgetpos(fp, &mark);
    fscanf(fp, "%15s", word);
    printf("read %s\\n", word);
    fsetpos(fp, &mark);
    fscanf(fp, "%15s", word);
    printf("read %s again\\n", word);
    fclose(fp);
    return 0;
}
`,
    see: ['fgetpos', 'fsetpos', 'ftell'],
  },
  size_t: {
    text: `The unsigned integer type of the result of sizeof, and the type used throughout the library for sizes and counts: the argument of malloc, the result of strlen, the counts of fread and fwrite. Here it is unsigned int, 32 bits. It is defined in stddef.h, stdio.h, stdlib.h, string.h and time.h.\n\nBecause it is unsigned, it can never be negative, which leads to two classic bugs. strlen(a) - strlen(b) is a huge positive number when b is longer, and a loop such as for (i = n - 1; i >= 0; i--) with a size_t i never ends, because i >= 0 is always true.\n\nC89 has no printf conversion for size_t; convert to unsigned long and print with %lu.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    size_t n = strlen("hello");
    size_t i;

    printf("length %lu, sizeof(size_t) %lu\\n", (unsigned long)n, (unsigned long)sizeof(size_t));
    for (i = n; i > 0; i--)
        printf("%c", "hello"[i - 1]);
    printf("\\n");
    return 0;
}
`,
    see: ['sizeof', 'strlen', 'malloc'],
  },
  NULL: {
    text: `The null pointer constant: a pointer value that points at no object. Here it is defined as ((void *)0). It is defined in stddef.h, stdio.h, stdlib.h, string.h, time.h and locale.h.\n\nFunctions use NULL to say "no result": fopen when the file cannot be opened, malloc when there is no memory, strchr when the character is not there. Check for it before using the pointer. Dereferencing NULL is undefined behavior; See stops the program and points at the line.\n\nNULL is for pointers. Do not use it as the character '\\0' or the number 0, even though they are all zero in some way.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *s = "hello";
    const char *p;

    p = strchr(s, 'z');
    if (p == NULL)
        printf("no 'z' in %s\\n", s);
    p = strchr(s, 'l');
    if (p != NULL)
        printf("found: %s\\n", p);
    return 0;
}
`,
    see: ['fopen', 'malloc', 'strchr'],
  },
  EOF: {
    text: `A negative int, -1 here, that the input functions return to mean "end of file or error": getchar, getc and fgetc when there is no more input, and scanf when input ends before anything was converted. Some output functions (fputc, fputs, fclose, fflush) also return EOF when they fail.\n\nThe classic trap: getchar returns an int, so that EOF can be told apart from every one of the 256 possible bytes. Storing the result in a char loses that difference: with char c, the byte 255 may compare equal to EOF and end the loop early, or, where char is unsigned, EOF is never seen and the loop never ends. Always use int c.\n\nEOF is not a character stored in the file. To tell end of file from a read error after a loop ends, call feof or ferror. At the terminal, the user signals end of input with Ctrl+D.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int c, n = 0;

    fp = fopen("/tmp/eof-demo.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("abc\\n", fp);
    rewind(fp);
    while ((c = getc(fp)) != EOF)
        n++;
    printf("%d characters, then EOF (%d); feof says %d\\n", n, EOF, feof(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['getchar', 'fgetc', 'feof', 'ferror', 'scanf'],
  },
  BUFSIZ: {
    text: `The size of the buffer that setbuf expects, 1024 bytes here. An array given to setbuf must be at least BUFSIZ bytes. It is also a reasonable size for a buffer used to copy a file in chunks with fread and fwrite.`,
    example: `#include <stdio.h>

int main(void)
{
    char buf[BUFSIZ];

    printf("BUFSIZ is %d\\n", BUFSIZ);
    sprintf(buf, "%d bytes is plenty for a line", (int)sizeof buf);
    printf("%s\\n", buf);
    return 0;
}
`,
    see: ['setbuf', 'setvbuf', 'fread'],
  },
  FOPEN_MAX: {
    text: `The number of streams that can be open at the same time, including stdin, stdout and stderr. Here it is 20, so a program can open 17 files of its own; one more fopen fails with errno set to EMFILE until something is closed. Closing files you no longer need avoids hitting the limit.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *f[FOPEN_MAX];
    int n = 0, i;

    while (n < FOPEN_MAX) {
        f[n] = tmpfile();
        if (f[n] == NULL)
            break;
        n++;
    }
    printf("opened %d files (FOPEN_MAX is %d)\\n", n, FOPEN_MAX);
    for (i = 0; i < n; i++)
        fclose(f[i]);
    return 0;
}
`,
    see: ['fopen', 'fclose', 'tmpfile'],
  },
  FILENAME_MAX: {
    text: `The size an array needs to hold the longest file name the system can open, including the NUL: 256 here. Use it to size arrays that hold a path built at run time.`,
    example: `#include <stdio.h>

int main(void)
{
    char path[FILENAME_MAX];

    sprintf(path, "/tmp/%s.%d.txt", "report", 3);
    printf("%s fits in %d bytes\\n", path, FILENAME_MAX);
    return 0;
}
`,
    see: ['fopen', 'L_tmpnam'],
  },
  L_tmpnam: {
    text: `The size an array needs to hold a name made by tmpnam, including the NUL: 20 here. Pass tmpnam an array of at least L_tmpnam characters.`,
    example: `#include <stdio.h>

int main(void)
{
    char name[L_tmpnam];

    tmpnam(name);
    printf("%s (array of %d)\\n", name, L_tmpnam);
    return 0;
}
`,
    see: ['tmpnam', 'TMP_MAX'],
  },
  TMP_MAX: {
    text: `The number of different names tmpnam is guaranteed to be able to produce, 10000 here (the standard asks for at least 25). Calling tmpnam more often than that may give names that were already used.`,
    example: `#include <stdio.h>

int main(void)
{
    printf("tmpnam can make at least %d different names\\n", TMP_MAX);
    return 0;
}
`,
    see: ['tmpnam', 'L_tmpnam'],
  },
  SEEK_SET: {
    text: `The whence argument for fseek meaning "from the start of the file": fseek(fp, n, SEEK_SET) moves to byte n. Its value is 0. fseek(fp, 0L, SEEK_SET) goes back to the start, like rewind but with a result you can check.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/seek-demo.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("0123456789", fp);
    fseek(fp, 4L, SEEK_SET);
    printf("byte 4 is '%c'\\n", getc(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['fseek', 'SEEK_CUR', 'SEEK_END'],
  },
  SEEK_CUR: {
    text: `The whence argument for fseek meaning "from the current position": the offset is added to where the stream is now, and may be negative to move back. Its value is 1.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/seek-demo.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("0123456789", fp);
    fseek(fp, 2L, SEEK_SET);
    fseek(fp, 3L, SEEK_CUR);
    printf("now at %ld: '%c'\\n", ftell(fp), getc(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['fseek', 'SEEK_SET', 'SEEK_END'],
  },
  SEEK_END: {
    text: `The whence argument for fseek meaning "from the end of the file": fseek(fp, 0L, SEEK_END) moves just past the last byte, and a negative offset moves back from there. Its value is 2.\n\nfseek to the end followed by ftell is the usual way to find the size of a file opened in binary mode.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    long size;

    fp = fopen("/tmp/seek-demo.txt", "w+b");
    if (fp == NULL)
        return 1;
    fputs("0123456789", fp);
    fseek(fp, 0L, SEEK_END);
    size = ftell(fp);
    fseek(fp, -3L, SEEK_END);
    printf("size %ld, last three start with '%c'\\n", size, getc(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['fseek', 'ftell', 'SEEK_SET'],
  },
  _IOFBF: {
    header: 'stdio.h',
    kind: 'constant',
    sig: '#define _IOFBF 0',
    text: `The mode for setvbuf meaning fully buffered: output is collected and written only when the buffer is full, when fflush is called, or when the stream is closed. This is the normal mode for files, and the fastest. Its value is 0.`,
    example: `#include <stdio.h>

int main(void)
{
    if (setvbuf(stdout, NULL, _IOFBF, BUFSIZ) == 0)
        printf("stdout is now fully buffered\\n");
    fflush(stdout);
    return 0;
}
`,
    see: ['setvbuf', '_IOLBF', '_IONBF'],
  },
  _IOLBF: {
    header: 'stdio.h',
    kind: 'constant',
    sig: '#define _IOLBF 1',
    text: `The mode for setvbuf meaning line buffered: output is written each time a newline is written, as well as when the buffer fills. stdout starts in this mode in See, which is why text without a final \\n can stay invisible until the program reads input, calls fflush or ends. Its value is 1.`,
    example: `#include <stdio.h>

int main(void)
{
    setvbuf(stdout, NULL, _IOLBF, BUFSIZ);
    printf("this line appears when its newline is written\\n");
    return 0;
}
`,
    see: ['setvbuf', '_IOFBF', '_IONBF'],
  },
  _IONBF: {
    header: 'stdio.h',
    kind: 'constant',
    sig: '#define _IONBF 2',
    text: `The mode for setvbuf meaning unbuffered: every character is written at once. stderr is unbuffered so that error messages appear even if the program crashes right after. It is the slowest mode for large output. Its value is 2.`,
    example: `#include <stdio.h>

int main(void)
{
    setvbuf(stdout, NULL, _IONBF, 0);
    printf("each character is written immediately");
    printf("\\n");
    return 0;
}
`,
    see: ['setvbuf', 'setbuf', '_IOFBF', '_IOLBF'],
  },
  stdin: {
    text: `The standard input stream, a FILE * that is open for reading when main starts. In See it reads what you type in the terminal; a program waits there until a line is entered, and Ctrl+D signals end of input. getchar, scanf and gets read from it; with fgetc, fgets or fscanf you name it explicitly.\n\nInput from the terminal arrives a line at a time, so a program that reads one character still waits for Enter, and the newline itself is part of the input: the next read will see it. Before reading, the library flushes stdout so a prompt without a newline appears.\n\nfflush(stdin) is undefined in C (See ignores it and warns); to throw away the rest of a line, read characters until '\\n' or EOF.`,
    example: `#include <stdio.h>

int main(void)
{
    char line[80];

    printf("Type a line (or press Ctrl+D): ");
    if (fgets(line, sizeof line, stdin) != NULL)
        printf("you typed: %s", line);
    else
        printf("\\nno input\\n");
    return 0;
}
`,
    see: ['stdout', 'stderr', 'getchar', 'scanf', 'fgets'],
  },
  stdout: {
    text: `The standard output stream, a FILE * that is open for writing when main starts. printf, puts and putchar write to it; fprintf(stdout, ...) is the same as printf(...). In See it is shown in the terminal.\n\nstdout is line buffered here: text is kept in a buffer until a newline is written, the buffer fills, the program reads from stdin, fflush(stdout) is called, or the program ends. If the program crashes, text still in the buffer is lost, so a debugging printf without \\n can mislead you about how far the program got. In the memory picture, the _cnt field of stdout shows how many bytes are waiting.`,
    example: `#include <stdio.h>

int main(void)
{
    fprintf(stdout, "same as printf\\n");
    printf("working...");
    fflush(stdout);
    printf(" done\\n");
    return 0;
}
`,
    see: ['stdin', 'stderr', 'printf', 'fflush', 'setvbuf'],
  },
  stderr: {
    text: `The standard error stream, a FILE * open for writing when main starts, meant for error messages and diagnostics. Write to it with fprintf(stderr, ...) or fputs(msg, stderr); perror writes there too.\n\nstderr is unbuffered, so each message appears at once, even if the program crashes on the next line. Keeping errors off stdout also means that when the output of a program is redirected to a file, the error messages still reach the screen.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/no/such/config.txt", "r");
    if (fp == NULL) {
        fprintf(stderr, "warning: no config file, using defaults\\n");
    } else {
        fclose(fp);
    }
    printf("running with defaults\\n");
    return EXIT_SUCCESS;
}
`,
    see: ['stdout', 'perror', 'fprintf'],
  },

  // ---- files -------------------------------------------------------------------------------------
  remove: {
    text: `Deletes the file called filename. It returns 0 on success and a non-zero value on failure, with errno saying why (ENOENT if there is no such file, EACCES if it may not be removed).\n\nIn See the file disappears from the file tree. Close a file before removing it.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/old.txt", "w");
    if (fp != NULL)
        fclose(fp);
    if (remove("/tmp/old.txt") == 0)
        printf("removed\\n");
    if (remove("/tmp/old.txt") != 0)
        perror("second remove");
    printf("done\\n");
    return 0;
}
`,
    see: ['rename', 'fopen', 'tmpfile'],
  },
  rename: {
    text: `Changes the name of the file old to new. It returns 0 on success and a non-zero value on failure, setting errno. Whether a file already called new is replaced depends on the system; remove it first if you need to be sure.\n\nA common pattern for updating a file safely is to write the new contents to a temporary name and then rename it over the old one, so the file is never left half-written.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/draft.txt", "w");
    if (fp == NULL)
        return 1;
    fputs("final text\\n", fp);
    fclose(fp);
    remove("/tmp/final.txt");
    if (rename("/tmp/draft.txt", "/tmp/final.txt") == 0)
        printf("renamed draft.txt to final.txt\\n");
    else
        perror("rename");
    return 0;
}
`,
    see: ['remove', 'fopen'],
  },
  tmpfile: {
    text: `Creates a temporary file, opens it in "wb+" mode (binary, for writing and reading) and returns a FILE * for it, or NULL if it cannot be created. The file is removed automatically when it is closed or when the program ends normally.\n\nIt is useful as scratch space: write data, rewind, and read it back. In See the file lives in /tmp while it is open.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *tmp;
    int a, b;

    tmp = tmpfile();
    if (tmp == NULL)
        return 1;
    fprintf(tmp, "%d %d", 12, 30);
    rewind(tmp);
    if (fscanf(tmp, "%d %d", &a, &b) == 2)
        printf("read back %d and %d, sum %d\\n", a, b, a + b);
    fclose(tmp);
    return 0;
}
`,
    see: ['tmpnam', 'fopen', 'rewind'],
  },
  tmpnam: {
    text: `Makes a file name that is not the name of an existing file, for use as a temporary file. If s is not NULL it must point to an array of at least L_tmpnam characters, and the name is stored there and s is returned. If s is NULL, the name is stored in a static array inside the library and a pointer to it is returned; the next call overwrites it.\n\ntmpnam only makes a name; it does not create the file. Another program could create a file with the same name between the call and your fopen, which is why tmpfile is usually the better choice. In See the names look like /tmp/tmp00001.`,
    example: `#include <stdio.h>

int main(void)
{
    char name[L_tmpnam];
    FILE *fp;

    tmpnam(name);
    fp = fopen(name, "w");
    if (fp == NULL)
        return 1;
    fputs("scratch\\n", fp);
    fclose(fp);
    printf("used %s\\n", name);
    remove(name);
    return 0;
}
`,
    see: ['tmpfile', 'L_tmpnam', 'TMP_MAX'],
  },
  fclose: {
    text: `Flushes any output still buffered for the stream, closes the file and frees the FILE. It returns 0 on success and EOF if an error was detected, either now or earlier on the stream.\n\nAfter fclose the pointer must not be used again, not even for a second fclose; See reports it as a FILE that is not open. Files that are never closed are flushed and closed by exit when the program ends normally, but not after a crash, so data can be lost. Closing promptly also frees one of the FOPEN_MAX slots.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/close-demo.txt", "w");
    if (fp == NULL)
        return 1;
    fputs("saved\\n", fp);
    if (fclose(fp) != 0)
        printf("error while closing\\n");
    else
        printf("closed cleanly\\n");
    fp = NULL;
    return 0;
}
`,
    see: ['fopen', 'fflush', 'exit'],
  },
  fflush: {
    text: `Writes out any data waiting in the buffer of the output stream. It returns 0 on success and EOF on a write error. fflush(NULL) flushes every output stream.\n\nUse fflush(stdout) when output must appear now: after a prompt without a newline, before a long computation, or before a point where the program might crash. Reading from stdin already flushes stdout in See.\n\nfflush is only defined for output streams. fflush(stdin), often seen as a way to discard typed input, is undefined behavior; See ignores it and warns.`,
    example: `#include <stdio.h>

int main(void)
{
    long i, sum = 0;

    printf("computing");
    fflush(stdout);
    for (i = 1; i <= 10000L; i++)
        sum += i;
    printf(" done: %ld\\n", sum);
    return 0;
}
`,
    see: ['setvbuf', 'stdout', 'fclose'],
  },
  fopen: {
    text: `Opens the file called filename and returns a FILE * for it, or NULL if it cannot be opened, with errno saying why (ENOENT: no such file or directory; EACCES: not allowed; EISDIR: it is a directory; EMFILE: too many open files). Always check for NULL; passing NULL to another stdio function crashes.\n\nThe mode string: "r" reads an existing file. "w" creates the file, or empties it if it exists, and writes. "a" appends: every write goes to the end, and the file is created if needed. Adding + ("r+", "w+", "a+") allows both reading and writing; "r+" still requires the file to exist and "w+" still empties it. Adding b ("rb", "wb+", "r+b") opens in binary mode, which makes no difference here or on Unix but matters on Windows.\n\nWhen a stream is open for both reading and writing, call fflush, fseek, fsetpos or rewind between a write and a following read, and fseek, fsetpos or rewind between a read and a following write.\n\nIn See, relative names are relative to the folder of the program, and files appear in the file tree, where you can open them. Folders brought in from your computer may be read-only or ask before the program writes to them.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    char line[64];
    int n = 0;

    fp = fopen("/tmp/list.txt", "w");
    if (fp == NULL) {
        perror("/tmp/list.txt");
        return 1;
    }
    fprintf(fp, "eggs\\nmilk\\nbread\\n");
    fclose(fp);

    fp = fopen("/tmp/list.txt", "r");
    if (fp == NULL) {
        perror("/tmp/list.txt");
        return 1;
    }
    while (fgets(line, sizeof line, fp) != NULL)
        printf("%d: %s", ++n, line);
    fclose(fp);
    return 0;
}
`,
    see: ['fclose', 'freopen', 'perror', 'FILE', 'fgets', 'fprintf'],
  },
  freopen: {
    text: `Closes the stream (ignoring errors) and opens filename with the given mode on the same FILE, returning stream on success or NULL on failure. The mode string is as for fopen.\n\nIts main use is redirecting a standard stream to a file: after freopen("out.txt", "w", stdout), everything printf writes goes to out.txt. C89 has no portable way to undo that afterwards.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    char line[64];

    fp = fopen("/tmp/redirect.txt", "w");
    if (fp == NULL)
        return 1;
    if (freopen("/tmp/redirect.txt", "w", fp) == NULL)
        return 1;
    fprintf(fp, "written after freopen\\n");
    fclose(fp);

    fp = fopen("/tmp/redirect.txt", "r");
    if (fp != NULL && fgets(line, sizeof line, fp) != NULL)
        printf("file holds: %s", line);
    if (fp != NULL)
        fclose(fp);
    return 0;
}
`,
    see: ['fopen', 'fclose', 'stdout'],
  },
  setbuf: {
    text: `Sets the buffer of a stream. With buf pointing to an array of at least BUFSIZ characters, it is like setvbuf(stream, buf, _IOFBF, BUFSIZ); with buf NULL, it turns buffering off, like setvbuf(stream, NULL, _IONBF, 0). In See, setbuf with an array keeps stdout line buffered.\n\nCall it before any other operation on the stream. The array must stay alive while the stream uses it: a local array in a function that returns before the stream is closed is a bug. setbuf returns nothing, so use setvbuf if you need to know whether it worked.`,
    example: `#include <stdio.h>

int main(void)
{
    setbuf(stdout, NULL);
    printf("stdout is unbuffered now\\n");
    return 0;
}
`,
    see: ['setvbuf', 'BUFSIZ', 'fflush'],
  },
  setvbuf: {
    text: `Chooses how the stream is buffered. mode is _IOFBF (fully buffered), _IOLBF (line buffered) or _IONBF (unbuffered). If buf is not NULL, it is an array of size bytes that the stream uses as its buffer; if it is NULL, the library provides one. It returns 0 on success and non-zero if the mode is invalid or the request cannot be honored.\n\nCall it after opening the stream and before any other operation on it. As with setbuf, an array passed as buf must outlive the stream's use of it. In See the buffering mode shows in the _bufmode field of the FILE.`,
    example: `#include <stdio.h>

int main(void)
{
    if (setvbuf(stdout, NULL, _IOLBF, BUFSIZ) != 0)
        printf("setvbuf failed\\n");
    printf("line buffered output\\n");
    printf("bad mode gives %d\\n", setvbuf(stdout, NULL, 7, 0) != 0);
    return 0;
}
`,
    see: ['setbuf', '_IOFBF', '_IOLBF', '_IONBF', 'fflush'],
  },

  // ---- formatted output --------------------------------------------------------------------------
  printf: {
    text: `Writes text to stdout, converting the arguments after the format according to the conversion specifications in it. It returns the number of characters written, or a negative value on an output error. Ordinary characters in the format are copied as they are; %% writes one %.\n\nEach specification has the form %[flags][width][.precision][length]conversion. The conversions: d and i print an int in decimal; u, o, x and X print an unsigned int in decimal, octal, hex with a-f, and hex with A-F; c prints an int as a character; s prints a string (a char * to a NUL-terminated array); f prints a double as [-]ddd.dddddd; e and E print it as d.dddddde+dd; g and G use e style when the exponent is below -4 or at least the precision, and f style otherwise, without trailing zeros; p prints a pointer (a void *); n prints nothing but stores the number of characters written so far into the int * argument.\n\nFlags: - left-justifies within the width (the default is right). + always prints a sign for signed conversions. A space puts a space where a plus sign would go. 0 pads numbers with leading zeros instead of spaces (ignored with - and, for integers, when a precision is given). # selects an alternative form: a leading 0 for o, 0x or 0X for non-zero x and X, and for e, f and g a decimal point always (g also keeps its trailing zeros).\n\nWidth is the minimum number of characters; the output is padded but never cut. Precision means: the minimum number of digits for d, i, o, u, x, X (zeros are added; a value of 0 with precision 0 prints nothing); the digits after the point for e, E and f (default 6); the significant digits for g and G; the maximum number of characters taken from a string for s. Either can be * to take the value from an int argument before the value being printed; a negative * width means - with that width. Length: h makes d, i, o, u, x, X take a short (and n a short *), l makes them take a long (and n a long *), and L makes e, f, g take a long double. There is no length for double: %f prints both float and double, because a float argument is promoted to double.\n\nThe arguments must match the conversions in number and type. printf cannot check; a mismatch such as %d with a double, %s with an int, or too few arguments is undefined behavior and prints garbage or crashes. Never pass user text as the format (printf(s)); write printf("%s", s). In See, %s with a NULL pointer prints (null) with a warning, and %p prints a pointer in hex, or (nil) for NULL.`,
    example: `#include <stdio.h>

int main(void)
{
    int n = 42, count;
    double pi = 3.14159265;
    const char *name = "Ada";

    printf("[%d] [%5d] [%-5d] [%05d] [%+d] [%.4d]\\n", n, n, n, n, n, n);
    printf("[%x] [%X] [%#x] [%o] [%#o] [%u]\\n", 255, 255, 255, 8, 8, 3000000000u);
    printf("[%f] [%.2f] [%8.3f] [%e] [%g] [%g]\\n", pi, pi, pi, pi, 0.0001, 1e10);
    printf("[%s] [%8s] [%-8s] [%.2s] [%c]\\n", name, name, name, name, name[0]);
    printf("[%*d] [%.*f] [%ld] [%%]\\n", 6, n, 1, pi, 123456789L);
    printf("hello%n\\n", &count);
    printf("\\"hello\\" is %d characters\\n", count);
    return 0;
}
`,
    see: ['fprintf', 'sprintf', 'vprintf', 'puts', 'putchar', 'scanf'],
  },
  fprintf: {
    text: `Writes formatted text to the given stream, exactly like printf does to stdout; printf(...) is fprintf(stdout, ...). The format and arguments follow the same rules, described under printf. It returns the number of characters written, or a negative value on an output error.\n\nTypical uses are writing to a file opened with fopen and writing error messages to stderr. The stream must be open for writing: fprintf to a file opened with "r" fails and sets the error indicator, which ferror reports.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int i;
    char line[64];

    fp = fopen("/tmp/squares.txt", "w+");
    if (fp == NULL) {
        fprintf(stderr, "cannot open file\\n");
        return 1;
    }
    for (i = 1; i <= 3; i++)
        fprintf(fp, "%d squared is %d\\n", i, i * i);
    rewind(fp);
    while (fgets(line, sizeof line, fp) != NULL)
        printf("%s", line);
    fclose(fp);
    return 0;
}
`,
    see: ['printf', 'fscanf', 'fputs', 'stderr'],
  },
  sprintf: {
    text: `Formats exactly like printf, but stores the characters in the array s instead of writing them, and adds a terminating NUL. It returns the number of characters stored, not counting the NUL. The format rules are described under printf.\n\nsprintf has no idea how big s is. The array must have room for every character the format can produce plus the NUL: for an int that is up to 11 characters ("-2147483648"), and a %s can add any amount. Overflowing the array is a classic security hole; See stops the program at the first byte written past its end. C89 has no snprintf, so size buffers generously, limit strings with a precision such as %.20s, or check strlen of string arguments first.\n\nIt is the usual way to build a string from numbers, such as a file name or a message, and to convert a number to text.`,
    example: `#include <stdio.h>

int main(void)
{
    char buf[64];
    int len;

    len = sprintf(buf, "%s-%03d.txt", "frame", 7);
    printf("%s has %d characters\\n", buf, len);
    sprintf(buf, "%.20s scored %d%%", "Grace", 97);
    printf("%s\\n", buf);
    return 0;
}
`,
    see: ['printf', 'vsprintf', 'sscanf', 'strcpy'],
  },
  vfprintf: {
    text: `Like fprintf, but the arguments come as a va_list instead of a variable argument list. It lets you write your own printf-like function: take ... in your function, call va_start, pass the va_list to vfprintf, then call va_end. It returns the number of characters written, or a negative value on error.\n\nvfprintf uses up the va_list. To format the same arguments twice, call va_end and va_start again in between. In See a va_list is a pointer that walks along the arguments on the stack, which you can watch in the memory picture.`,
    example: `#include <stdio.h>
#include <stdarg.h>

static void error_at(int line, const char *fmt, ...)
{
    va_list ap;

    fprintf(stdout, "line %d: ", line);
    va_start(ap, fmt);
    vfprintf(stdout, fmt, ap);
    va_end(ap);
    fprintf(stdout, "\\n");
}

int main(void)
{
    error_at(12, "expected %d values, found %d", 3, 2);
    error_at(40, "unknown name '%s'", "colour");
    return 0;
}
`,
    see: ['vprintf', 'vsprintf', 'fprintf', 'va_start', 'va_list'],
  },
  vprintf: {
    text: `Like printf, but takes its arguments as a va_list from a variadic function of your own, which must have called va_start first and should call va_end afterwards. It returns the number of characters written, or a negative value on error. See vfprintf for the details.`,
    example: `#include <stdio.h>
#include <stdarg.h>

static int debug_on = 1;

static void debug(const char *fmt, ...)
{
    va_list ap;

    if (!debug_on)
        return;
    printf("[debug] ");
    va_start(ap, fmt);
    vprintf(fmt, ap);
    va_end(ap);
}

int main(void)
{
    debug("x = %d, y = %.1f\\n", 3, 2.5);
    return 0;
}
`,
    see: ['vfprintf', 'vsprintf', 'printf', 'va_start'],
  },
  vsprintf: {
    text: `Like sprintf, but takes its arguments as a va_list. It stores the formatted characters and a NUL in s and returns the number of characters stored, not counting the NUL. As with sprintf, the array must be big enough for the whole result; nothing checks that for you, though See stops the program at the first byte written out of bounds.`,
    example: `#include <stdio.h>
#include <stdarg.h>

static char message[100];

static void set_message(const char *fmt, ...)
{
    va_list ap;

    va_start(ap, fmt);
    vsprintf(message, fmt, ap);
    va_end(ap);
}

int main(void)
{
    set_message("%d of %d tests passed", 9, 10);
    printf("%s\\n", message);
    return 0;
}
`,
    see: ['sprintf', 'vfprintf', 'vprintf', 'va_start'],
  },

  // ---- formatted input ---------------------------------------------------------------------------
  scanf: {
    text: `Reads from stdin, converting text according to the format and storing the results through the pointer arguments. It returns the number of items converted and stored, which can be less than asked for, or EOF if input ended (or a read error occurred) before the first conversion. Always check the return value: if (scanf("%d", &n) != 1) means no number was read, and n is unchanged.\n\nThe arguments are pointers: scanf("%d", &n), not scanf("%d", n). For a char array, its name is already a pointer: scanf("%s", word). Forgetting the & is the classic crash; in See it shows up as a write to a strange address.\n\nWhite space: a space, tab or newline in the format matches any amount of white space in the input, including none. Every conversion except %c, %[ and %n skips leading white space by itself. Any other character in the format must match the next input character exactly, or scanf stops there. So "%d,%d" reads "3,4" but stops at "3 ,4"; "%d ,%d" accepts both.\n\nConversions: %d a decimal int; %i an int in decimal, octal (leading 0) or hex (leading 0x); %u, %o, %x an unsigned int in decimal, octal or hex; %e, %f, %g a float (all three read any floating form); %s a word, up to the next white space, stored with a NUL; %c exactly one character (or as many as the width), without a NUL and without skipping white space; %p a pointer; %n stores the number of characters read so far and does not count as an item; %% matches a %. Length: h before d, i, u, o, x, n means short *; l means long * and, before e, f, g, double *; L before e, f, g means long double *. Using %f for a double is a common mistake: a double needs %lf (in printf, %f is right for both).\n\nA width limits how many characters a conversion reads: always give one with %s and %[ so the input cannot overflow the array, for example %19s for char word[20]. A * after % reads and discards: "%*d" skips a number. A scanset %[...] reads the longest run of characters in the set and stores them with a NUL: %[a-z] reads lowercase letters, %[^,] reads everything up to a comma, %[^\\n] reads the rest of the line. To put ] in the set, write it first: %[]abc] or %[^]].\n\nWhen a conversion fails, the offending character stays in the input. scanf("%d", &n) on the input "abc" returns 0 and leaves "abc" there, so a loop that retries without discarding it spins forever. Mixing scanf with fgets has a similar trap: the newline after a number is still waiting, so the next fgets reads an empty line. Reading whole lines with fgets and converting them with sscanf avoids both.`,
    example: `#include <stdio.h>

int main(void)
{
    int age, r;
    char name[20];

    printf("Enter your name and age (or press Ctrl+D): ");
    r = scanf("%19s %d", name, &age);
    if (r == 2)
        printf("Hello %s, next year you will be %d\\n", name, age + 1);
    else if (r == EOF)
        printf("\\nno input\\n");
    else
        printf("could only read %d item(s)\\n", r);
    return 0;
}
`,
    see: ['sscanf', 'fscanf', 'fgets', 'printf', 'getchar'],
  },
  fscanf: {
    text: `Reads from the given stream and converts the text according to the format, exactly like scanf does for stdin; scanf(...) is fscanf(stdin, ...). It returns the number of items stored, or EOF if input ended before the first conversion. The format rules, white space handling, scansets and traps are described under scanf.\n\nThe usual way to read a file of numbers is a loop that continues while fscanf returns the number of items asked for. Testing feof before reading, as in while (!feof(fp)), is a common mistake: the end of file is only noticed after a read fails, so the last item is processed twice.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int x, sum = 0, count = 0;

    fp = fopen("/tmp/numbers.txt", "w+");
    if (fp == NULL)
        return 1;
    fprintf(fp, "3 1 4 1 5\\n9 2 6\\n");
    rewind(fp);
    while (fscanf(fp, "%d", &x) == 1) {
        sum += x;
        count++;
    }
    printf("%d numbers, sum %d\\n", count, sum);
    fclose(fp);
    return 0;
}
`,
    see: ['scanf', 'sscanf', 'fprintf', 'feof'],
  },
  sscanf: {
    text: `Converts text from the string s according to the format, like scanf does from stdin, and returns the number of items stored, or EOF if s ends before the first conversion. The format rules are described under scanf.\n\nReading does not consume the string: each call starts again at the beginning of s. Use %n to find out how many characters were used if you want to continue from there.\n\nCombined with fgets, sscanf is the safest way to read input: read a whole line, then try to convert it, and if that fails the bad line is already gone and you can simply ask again.`,
    example: `#include <stdio.h>

int main(void)
{
    const char *line = "2024-03-15 temp=21.5C";
    int year, month, day, used;
    double t;
    char key[16];

    if (sscanf(line, "%d-%d-%d", &year, &month, &day) == 3)
        printf("date: %d/%d/%d\\n", day, month, year);
    if (sscanf(line, "%*s %15[^=]=%lf%n", key, &t, &used) == 2)
        printf("%s is %.1f, rest \\"%s\\"\\n", key, t, line + used);
    if (sscanf("abc", "%d", &year) == 0)
        printf("\\"abc\\" is not a number\\n");
    return 0;
}
`,
    see: ['scanf', 'fgets', 'strtol', 'sprintf'],
  },

  // ---- character input and output ----------------------------------------------------------------
  fgetc: {
    text: `Reads the next character from the stream and returns it as an unsigned char converted to int (0 to 255), or EOF at end of file or on a read error. After EOF, use feof and ferror to tell which happened.\n\nStore the result in an int, not a char, or EOF cannot be recognized reliably. getc is the same function, possibly as a macro.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int c, lines = 0, chars = 0;

    fp = fopen("/tmp/count.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("one\\ntwo\\nthree\\n", fp);
    rewind(fp);
    while ((c = fgetc(fp)) != EOF) {
        chars++;
        if (c == '\\n')
            lines++;
    }
    printf("%d characters, %d lines\\n", chars, lines);
    fclose(fp);
    return 0;
}
`,
    see: ['getc', 'getchar', 'fputc', 'ungetc', 'EOF'],
  },
  fgets: {
    text: `Reads a line from the stream into the array s: it stops after a newline (which it keeps), at end of file, or when n - 1 characters have been read, and then adds a NUL. It returns s, or NULL if end of file came before any character was read, or on a read error.\n\nPass the real size of the array as n, usually sizeof line, and fgets will never overflow it. That makes it the safe way to read text, unlike gets.\n\nThe newline stays in the string. Remove it with line[strcspn(line, "\\n")] = '\\0'. If there is no newline at the end, either the line was longer than the array (the rest is waiting for the next call) or the last line of the file had no newline.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    FILE *fp;
    char line[8];

    fp = fopen("/tmp/lines.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("short\\na longer line\\n", fp);
    rewind(fp);
    while (fgets(line, sizeof line, fp) != NULL) {
        int whole = strchr(line, '\\n') != NULL;
        line[strcspn(line, "\\n")] = '\\0';
        printf("[%s]%s\\n", line, whole ? "" : " (continues)");
    }
    fclose(fp);
    return 0;
}
`,
    see: ['gets', 'fputs', 'sscanf', 'strcspn'],
  },
  fputc: {
    text: `Writes the character c, converted to unsigned char, to the stream. It returns the character written, or EOF on error, such as when the stream is not open for writing. putc does the same and may be a macro; putchar(c) is putc(c, stdout).`,
    example: `#include <stdio.h>

int main(void)
{
    const char *s = "copy me";
    int i;

    for (i = 0; s[i] != '\\0'; i++)
        fputc(s[i], stdout);
    fputc('\\n', stdout);
    return 0;
}
`,
    see: ['putc', 'putchar', 'fgetc', 'fputs'],
  },
  fputs: {
    text: `Writes the string s to the stream, without its terminating NUL and without adding a newline. It returns a non-negative value on success, or EOF on error.\n\nNote the difference from puts, which writes to stdout and adds a newline. fputs pairs naturally with fgets, which keeps the newline: copying lines with fgets and fputs gives back exactly the original text.`,
    example: `#include <stdio.h>

int main(void)
{
    fputs("no newline is added, ", stdout);
    fputs("so this continues the line\\n", stdout);
    fputs("errors go to stderr like this\\n", stderr);
    return 0;
}
`,
    see: ['puts', 'fgets', 'fputc', 'fprintf'],
  },
  getc: {
    text: `Reads the next character from the stream and returns it as an int, or EOF at end of file or on error, exactly like fgetc. The standard allows getc to be a macro that evaluates its stream argument more than once, so do not pass an expression with side effects, such as getc(files[i++]).`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int c, vowels = 0;

    fp = fopen("/tmp/getc-demo.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("programming in c", fp);
    rewind(fp);
    while ((c = getc(fp)) != EOF)
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
            vowels++;
    printf("%d vowels\\n", vowels);
    fclose(fp);
    return 0;
}
`,
    see: ['fgetc', 'getchar', 'putc', 'EOF'],
  },
  getchar: {
    text: `Reads the next character from stdin and returns it as an int, or EOF at end of input or on error; it is getc(stdin). The result must go in an int: while ((c = getchar()) != EOF) is the standard loop.\n\nTerminal input arrives a line at a time, so getchar waits until Enter is pressed and then returns the characters of the line one by one, including the '\\n' at the end. That newline is what makes a second getchar after a scanf seem to be skipped. In See, Ctrl+D ends the input.`,
    example: `#include <stdio.h>

int main(void)
{
    int c, n = 0;

    printf("Type some text, then press Ctrl+D:\\n");
    while ((c = getchar()) != EOF)
        if (c != '\\n')
            n++;
    printf("%d characters (not counting newlines)\\n", n);
    return 0;
}
`,
    see: ['getc', 'putchar', 'stdin', 'EOF', 'ungetc'],
  },
  gets: {
    text: `Reads a line from stdin into the array s, replacing the newline with a NUL, and returns s, or NULL at end of input. It has no way to know how big s is, so a long line writes past the end of the array. This cannot be prevented by careful use, which is why gets was removed from the language in C11; See warns whenever it is used.\n\nUse fgets(s, sizeof s, stdin) instead. The only differences are that fgets keeps the newline and never overflows.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[40];

    printf("Your name (or Ctrl+D): ");
    if (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\\n")] = '\\0';
        printf("Hello, %s\\n", line);
    } else {
        printf("\\nno input\\n");
    }
    return 0;
}
`,
    see: ['fgets', 'scanf'],
  },
  putc: {
    text: `Writes the character c to the stream and returns it, or EOF on error, exactly like fputc. Like getc, it may be a macro that evaluates the stream argument more than once, so avoid side effects in that argument.`,
    example: `#include <stdio.h>

int main(void)
{
    int i;

    for (i = 0; i < 5; i++)
        putc('*', stdout);
    putc('\\n', stdout);
    return 0;
}
`,
    see: ['fputc', 'putchar', 'getc'],
  },
  putchar: {
    text: `Writes the character c to stdout and returns it, or EOF on error; it is putc(c, stdout). The argument is an int and is converted to unsigned char, so putchar(65) prints A.\n\nRemember that stdout is line buffered: characters written with putchar appear when a newline is written or the buffer is flushed.`,
    example: `#include <stdio.h>

int main(void)
{
    int c;

    for (c = 'a'; c <= 'z'; c++)
        putchar(c);
    putchar('\\n');
    return 0;
}
`,
    see: ['putc', 'getchar', 'puts'],
  },
  puts: {
    text: `Writes the string s to stdout followed by a newline. It returns a non-negative value on success, or EOF on error.\n\nIt is the simplest way to print a line, and safer than printf(s) because a % in the text is not treated as a conversion. Unlike fputs, it adds the newline, so puts("done") and printf("done\\n") print the same.`,
    example: `#include <stdio.h>

int main(void)
{
    puts("first line");
    puts("100% sure: puts does not interpret %");
    puts("");
    puts("after an empty line");
    return 0;
}
`,
    see: ['fputs', 'printf', 'putchar'],
  },
  ungetc: {
    text: `Pushes the character c back onto the input stream, so that the next read returns it. It returns c, or EOF if it could not be pushed back. Pushing back EOF does nothing. Only one character of push-back is guaranteed.\n\nThe file itself is not changed. A successful ungetc clears the end-of-file indicator, and fseek, fsetpos or rewind throw pushed-back characters away. The typical use is reading one character too many while scanning a number or a word and returning it for the next part of the program.`,
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    FILE *fp;
    int c, value = 0;

    fp = fopen("/tmp/unget.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("427x", fp);
    rewind(fp);
    while ((c = getc(fp)) != EOF && isdigit(c))
        value = value * 10 + (c - '0');
    if (c != EOF)
        ungetc(c, fp);
    printf("number %d, next character '%c'\\n", value, getc(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['getc', 'fgetc', 'fseek'],
  },

  // ---- direct input and output -------------------------------------------------------------------
  fread: {
    text: `Reads up to nmemb elements of size bytes each from the stream into the array at ptr, and returns the number of complete elements read. That is less than nmemb only at end of file or on a read error; use feof and ferror to tell which.\n\nfread copies bytes as they are, with no conversion and no NUL added, which makes it the counterpart of fwrite for binary data: arrays, structs, images. Note that the return value counts elements, not bytes. A file written by fwrite on one kind of machine may not read back correctly on another, because the size and byte order of types can differ.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int out[4] = { 10, 20, 30, 40 };
    int in[10];
    size_t got, i;

    fp = fopen("/tmp/ints.bin", "w+b");
    if (fp == NULL)
        return 1;
    fwrite(out, sizeof out[0], 4, fp);
    rewind(fp);
    got = fread(in, sizeof in[0], 10, fp);
    printf("asked for 10, got %lu (feof %d)\\n", (unsigned long)got, feof(fp));
    for (i = 0; i < got; i++)
        printf("%d ", in[i]);
    printf("\\n");
    fclose(fp);
    return 0;
}
`,
    see: ['fwrite', 'feof', 'ferror', 'fseek'],
  },
  fwrite: {
    text: `Writes nmemb elements of size bytes each from the array at ptr to the stream, and returns the number of elements written, which is less than nmemb only on an error.\n\nThe bytes are written exactly as they are in memory, so a struct is written together with its padding, and a pointer member is written as an address that means nothing when read back later. Open files for binary data with a b in the mode ("wb", "rb") so the program also works on systems where text mode changes newlines.`,
    example: `#include <stdio.h>

struct rec { int id; double score; };

int main(void)
{
    FILE *fp;
    struct rec a[2] = { { 1, 9.5 }, { 2, 7.25 } };
    struct rec b;
    size_t n;

    fp = fopen("/tmp/records.bin", "w+b");
    if (fp == NULL)
        return 1;
    n = fwrite(a, sizeof a[0], 2, fp);
    printf("wrote %lu records, %ld bytes\\n", (unsigned long)n, ftell(fp));
    fseek(fp, (long)sizeof b, SEEK_SET);
    if (fread(&b, sizeof b, 1, fp) == 1)
        printf("record 2: id %d score %.2f\\n", b.id, b.score);
    fclose(fp);
    return 0;
}
`,
    see: ['fread', 'fopen', 'fseek'],
  },

  // ---- positioning -------------------------------------------------------------------------------
  fgetpos: {
    text: `Stores the current position of the stream in *pos, for a later fsetpos to return to. It returns 0 on success and non-zero on failure, setting errno; here it fails with EBADF on stdin, stdout and stderr, which are not files.\n\nfgetpos and fsetpos are the counterparts of ftell and fseek for files too large for a long offset; the value in an fpos_t is meant only for fsetpos.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    fpos_t start;
    char word[16];

    fp = fopen("/tmp/getpos.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("first second", fp);
    rewind(fp);
    if (fgetpos(fp, &start) != 0)
        return 1;
    fscanf(fp, "%15s %15s", word, word);
    printf("read up to %s\\n", word);
    fsetpos(fp, &start);
    fscanf(fp, "%15s", word);
    printf("back at the start: %s\\n", word);
    fclose(fp);
    return 0;
}
`,
    see: ['fsetpos', 'fpos_t', 'ftell'],
  },
  fseek: {
    text: `Moves the position of the stream for the next read or write. The new position is offset bytes from the start of the file (whence SEEK_SET), from the current position (SEEK_CUR) or from the end (SEEK_END). It returns 0 on success and non-zero on failure, for example for a position before the start (EINVAL) or a stream that is not a file, such as stdin (EBADF).\n\nA successful fseek clears the end-of-file indicator and discards any characters pushed back with ungetc. It is also what you must call (or fflush) when a stream opened with + switches from writing to reading or back.\n\nFor files opened in text mode, the standard only promises that fseek works with an offset of 0 or with a value returned by ftell and SEEK_SET; arbitrary byte offsets are portable only in binary mode. Seeking past the end is allowed; a write there extends the file.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    char buf[6];

    fp = fopen("/tmp/fseek.txt", "w+b");
    if (fp == NULL)
        return 1;
    fputs("Hello, world", fp);
    fseek(fp, 7L, SEEK_SET);
    fread(buf, 1, 5, fp);
    buf[5] = '\\0';
    printf("from 7: %s\\n", buf);
    fseek(fp, 0L, SEEK_SET);
    fputc('J', fp);
    fseek(fp, -12L, SEEK_END);
    fread(buf, 1, 5, fp);
    printf("after the change: %s\\n", buf);
    printf("seeking before the start: %d\\n", fseek(fp, -1L, SEEK_SET));
    fclose(fp);
    return 0;
}
`,
    see: ['ftell', 'rewind', 'fsetpos', 'SEEK_SET', 'SEEK_CUR', 'SEEK_END'],
  },
  fsetpos: {
    text: `Moves the stream to the position stored in *pos by an earlier fgetpos on the same stream. It returns 0 on success and non-zero on failure, setting errno. Like fseek, it clears the end-of-file indicator and discards characters pushed back with ungetc.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    fpos_t p;
    int c;

    fp = fopen("/tmp/setpos.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("ABCDEF", fp);
    rewind(fp);
    getc(fp);
    getc(fp);
    fgetpos(fp, &p);
    while (getc(fp) != EOF)
        ;
    fsetpos(fp, &p);
    c = getc(fp);
    printf("after fsetpos: '%c', feof %d\\n", c, feof(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['fgetpos', 'fseek', 'fpos_t'],
  },
  ftell: {
    text: `Returns the current position of the stream as a long: for a binary stream, the number of bytes from the start of the file. On failure it returns -1L and sets errno; here that happens for stdin, stdout and stderr (EBADF), which are not files.\n\nFor a text stream the value is only meant to be passed back to fseek with SEEK_SET. A common use is finding a file's size: fseek(fp, 0L, SEEK_END), then size = ftell(fp).`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/ftell.txt", "w+");
    if (fp == NULL)
        return 1;
    printf("at the start: %ld\\n", ftell(fp));
    fputs("twelve bytes", fp);
    printf("after writing: %ld\\n", ftell(fp));
    rewind(fp);
    getc(fp);
    printf("after one getc: %ld\\n", ftell(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['fseek', 'rewind', 'fgetpos'],
  },
  rewind: {
    text: `Moves the stream back to the start of the file and clears both its end-of-file and its error indicators. It is (void)fseek(stream, 0L, SEEK_SET) followed by clearerr(stream), except that it returns nothing, so you cannot find out whether it worked.\n\nIt is handy after writing a file opened with "w+" to read back what was written.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    char line[32];

    fp = fopen("/tmp/rewind.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("written, then read back\\n", fp);
    rewind(fp);
    if (fgets(line, sizeof line, fp) != NULL)
        printf("%s", line);
    fclose(fp);
    return 0;
}
`,
    see: ['fseek', 'clearerr', 'ftell'],
  },

  // ---- errors ------------------------------------------------------------------------------------
  clearerr: {
    text: `Clears the end-of-file and error indicators of the stream. Once set, an indicator stays set until clearerr, rewind, or (for end of file) a successful fseek, fsetpos or ungetc. Use it when a stream should be read again after reaching its end, for example after the user pressed Ctrl+D at the terminal.\n\nIn See you can watch the end-of-file (4) and error (8) bits in the _flags field of the FILE go on and off.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/clearerr.txt", "w+");
    if (fp == NULL)
        return 1;
    while (getc(fp) != EOF)
        ;
    printf("feof before: %d\\n", feof(fp));
    clearerr(fp);
    printf("feof after:  %d\\n", feof(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['feof', 'ferror', 'rewind'],
  },
  feof: {
    text: `Returns non-zero if the end-of-file indicator of the stream is set, and 0 otherwise. The indicator is set when a read tries to go past the end of the file, not when the last byte is read.\n\nThat is why while (!feof(fp)) { read; use; } is a classic bug: after the last real item, feof is still 0, the next read fails, and the loop uses the stale value once more. Loop on the result of the read instead (!= EOF, != NULL, == 1) and call feof afterwards to find out why it stopped.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;
    int x, n = 0;

    fp = fopen("/tmp/feof.txt", "w+");
    if (fp == NULL)
        return 1;
    fputs("1 2 3", fp);
    rewind(fp);
    while (fscanf(fp, "%d", &x) == 1)
        n++;
    if (feof(fp))
        printf("read %d numbers, stopped at end of file\\n", n);
    else if (ferror(fp))
        printf("read error\\n");
    else
        printf("stopped at something that is not a number\\n");
    fclose(fp);
    return 0;
}
`,
    see: ['ferror', 'clearerr', 'EOF'],
  },
  ferror: {
    text: `Returns non-zero if the error indicator of the stream is set, and 0 otherwise. The indicator is set when a read or write fails, for example writing to a stream opened only for reading, and stays set until clearerr or rewind.\n\nAfter a loop that stops on EOF, check ferror to make sure the data was not cut short by an error. For output, checking ferror (or the result of fclose) before reporting success catches problems such as a full disk.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/ferror.txt", "w");
    if (fp != NULL)
        fclose(fp);
    fp = fopen("/tmp/ferror.txt", "r");
    if (fp == NULL)
        return 1;
    fputc('x', fp);
    printf("ferror after writing to a read-only stream: %d\\n", ferror(fp) != 0);
    clearerr(fp);
    printf("after clearerr: %d\\n", ferror(fp));
    fclose(fp);
    return 0;
}
`,
    see: ['feof', 'clearerr', 'perror'],
  },
  perror: {
    text: `Writes a message for the current value of errno to stderr: the string s, a colon and a space, the text that strerror(errno) gives, and a newline. If s is NULL or empty, only the message is written. For example perror("data.txt") might print data.txt: No such file or directory.\n\nCall it right after the call that failed, because other library calls may change errno. Only call it when a function has reported failure (fopen returned NULL, for example): errno is not reset on success, so its value at other times is meaningless.`,
    example: `#include <stdio.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/no-such-dir/data.txt", "r");
    if (fp == NULL) {
        perror("/tmp/no-such-dir/data.txt");
        printf("the message above went to stderr\\n");
        return 0;
    }
    fclose(fp);
    return 0;
}
`,
    see: ['strerror', 'errno', 'stderr'],
  },
});
