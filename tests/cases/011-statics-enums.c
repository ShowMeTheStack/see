#include <stdio.h>
enum color { RED, GREEN = 5, BLUE };
typedef enum { NO, YES } bool_t;
int next_id(void) { static int id = 100; return id++; }
static const char *names[] = { "red", "green", "blue" };
int table[] = { 1, 2, 3 };
int *tp = &table[1];
char *msg = "static pointer";
struct pt { int x, y; } origin = { 0, 0 }, corner = { 10, 20 };
struct pt *pc = &corner;
int main(void)
{
    enum color c = BLUE;
    bool_t ok = YES;
    printf("%d %d %d %d\n", RED, GREEN, c, ok);
    printf("%d %d %d\n", next_id(), next_id(), next_id());
    printf("%s %d %s %d\n", names[2], *tp, msg, pc->y);
    printf("%d\n", (int)sizeof(enum color));
    return 0;
}
/* OUTPUT
0 5 6 1
102 101 100
blue 2 static pointer 20
4
*/
