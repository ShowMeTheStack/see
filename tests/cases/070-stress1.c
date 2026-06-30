#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#define N 4
#define SWAP(t, a, b) do { t tmp_ = (a); (a) = (b); (b) = tmp_; } while (0)
#define LONG_MACRO(x) \
    ((x) * 2 + \
     1)
typedef struct node { int v; struct node *left, *right; } Node;
static Node *insert(Node *t, int v)
{
    if (!t) { t = malloc(sizeof *t); t->v = v; t->left = t->right = NULL; return t; }
    if (v < t->v) t->left = insert(t->left, v); else t->right = insert(t->right, v);
    return t;
}
static void walk(const Node *t) { if (!t) return; walk(t->left); printf("%d ", t->v); walk(t->right); }
static void freeall(Node *t) { if (t) { freeall(t->left); freeall(t->right); free(t); } }
int trace(int m[][N], int n) { int i, s = 0; for (i = 0; i < n; i++) s += m[i][i]; return s; }
struct rec { char name[8]; short age; double score; };
int main(void)
{
    int m[N][N] = { { 1, 2 }, { 0, 3 }, { 0 }, { 0, 0, 0, 4 } };
    Node *root = NULL;
    int keys[] = { 50, 30, 70, 20, 40, 60, 80 };
    unsigned i;
    struct rec rs[2] = { { "ann", 31, 9.5 }, { "bob", 27, 7.25 } };
    char line[64], *s;
    int a = 1, b = 2;
    unsigned char uc = 250;
    long big = 2147483647L;
    unsigned long ul = 4294967295UL;
    double d = 1.0 / 3.0;
    float f = 2.5f;
    for (i = 0; i < sizeof keys / sizeof keys[0]; i++) root = insert(root, keys[i]);
    walk(root); printf("\n");
    freeall(root);
    printf("%d %d\n", trace(m, N), LONG_MACRO(5));
    SWAP(int, a, b);
    printf("%d %d\n", a, b);
    printf("%d %d %d\n", (int)sizeof(struct rec), (int)sizeof rs, rs[1].age);
    printf("%-6s|%6.2f|%c\n", rs[0].name, rs[0].score, toupper(rs[1].name[0]));
    uc += 10;
    printf("%u %ld %lu %d\n", uc, big, ul, (int)(big + 1 < 0));
    printf("%.10f %g %e %5.1f%%\n", d, f, 12345.678, 99.5);
    printf("[%*d] [%-*d] [%.*s]\n", 5, 42, 5, 42, 3, "abcdef");
    strcpy(line, "  Hello,   World  ");
    for (s = line; *s && isspace((unsigned char)*s); s++) ;
    printf("<%s>\n", s);
    {
        char buf[32];
        int n = sscanf("12 abc 3.5", "%d %s %lf", &a, buf, &d);
        printf("%d %d %s %.1f\n", n, a, buf, d);
        n = sscanf("key=value;", "%[^=]=%[^;]", buf, line);
        printf("%d %s %s\n", n, buf, line);
    }
    switch (line[0]) { case 'v': puts("v!"); break; default: puts("?"); }
    a = 5;
    a <<= 2; a |= 1; a ^= 3; a %= 7;
    printf("%d %d %d\n", a, -17 / 5, -17 % 5);
    printf("%d\n", 1 ? 2 : 3 ? 4 : 5);
    printf("%x %o %X\n", 0xdeadu, 0777, 255u >> 4);
    return 0;
}
/* OUTPUT
20 30 40 50 60 70 80 
8 11
2 1
24 48 27
ann   |  9.50|B
4 2147483647 4294967295 1
0.3333333333 2.5 1.234568e+04  99.5%
[   42] [42   ] [abc]
<Hello,   World  >
3 12 abc 3.5
2 key value
v!
1 -3 -2
2
dead 777 F
*/
