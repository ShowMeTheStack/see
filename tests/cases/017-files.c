#include <stdio.h>
#include <string.h>
#include <errno.h>
int main(void)
{
    FILE *f;
    int x, sum = 0, n = 0;
    char line[64];
    long size;
    f = fopen("/data/numbers.txt", "r");
    if (f == NULL) { perror("open"); return 1; }
    while (fscanf(f, "%d", &x) == 1) { sum += x; n++; }
    printf("%d numbers, sum %d, eof %d\n", n, sum, feof(f) != 0);
    fclose(f);
    f = fopen("/tmp/out.txt", "w");
    fprintf(f, "line one\n");
    fputs("line two\n", f);
    fputc('!', f);
    fclose(f);
    f = fopen("/tmp/out.txt", "r");
    while (fgets(line, sizeof line, f)) printf("> %s", line);
    printf("\n");
    fseek(f, 0, SEEK_END);
    size = ftell(f);
    rewind(f);
    printf("size %ld first %c\n", size, fgetc(f));
    fclose(f);
    f = fopen("/tmp/out.txt", "a");
    fprintf(f, "\nappended");
    fclose(f);
    f = fopen("/tmp/out.txt", "rb");
    fseek(f, -8, SEEK_END);
    n = fread(line, 1, 8, f);
    line[n] = 0;
    printf("%d [%s]\n", n, line);
    fclose(f);
    f = fopen("/nope/missing.txt", "r");
    printf("%d %s\n", f == NULL, strerror(errno));
    f = fopen("/locked/new.txt", "w");
    printf("%d %d\n", f == NULL, errno == EACCES);
    printf("%d\n", remove("/tmp/out.txt"));
    printf("%d\n", fopen("/tmp/out.txt", "r") == NULL);
    return 0;
}
/* OUTPUT
8 numbers, sum 31, eof 1
> line one
> line two
> !
size 19 first l
8 [appended]
1 No such file or directory
1 1
0
1
*/
