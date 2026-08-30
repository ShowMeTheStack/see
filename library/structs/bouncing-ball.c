/*
 * title: A bouncing ball with vector structs
 * level: 2
 * about: Simulates a ball thrown across a box under gravity using a 2D vector struct, and plots its path in ASCII.
 */
#include <stdio.h>

#define W 50
#define H 14

typedef struct {
    double x, y;
} Vec2;

/* Small helper functions make vector maths read like the physics formulas. */
Vec2 vec(double x, double y) { Vec2 v; v.x = x; v.y = y; return v; }
Vec2 vadd(Vec2 a, Vec2 b) { return vec(a.x + b.x, a.y + b.y); }
Vec2 vscale(Vec2 a, double k) { return vec(a.x * k, a.y * k); }

typedef struct {
    Vec2 pos;
    Vec2 vel;
    int bounces;
} Ball;

/* One time step of simple Euler integration: velocity changes by gravity,
   position changes by velocity. A pointer lets step() update the ball in place. */
void step(Ball *b, Vec2 gravity, double dt)
{
    b->vel = vadd(b->vel, vscale(gravity, dt));
    b->pos = vadd(b->pos, vscale(b->vel, dt));

    if (b->pos.y < 0.0) {             /* hit the floor: reflect and lose energy */
        b->pos.y = -b->pos.y;
        b->vel.y = -b->vel.y * 0.75;
        b->bounces++;
    }
    if (b->pos.x > W - 1) {           /* hit the right wall */
        b->pos.x = 2 * (W - 1) - b->pos.x;
        b->vel.x = -b->vel.x;
        b->bounces++;
    }
}

int main(void)
{
    char screen[H][W + 1];
    Ball ball;
    Vec2 g = vec(0.0, -9.8);
    int r, c, t;

    for (r = 0; r < H; r++) {
        for (c = 0; c < W; c++)
            screen[r][c] = ' ';
        screen[r][W] = '\0';
    }

    ball.pos = vec(0.0, 12.0);
    ball.vel = vec(9.0, 0.0);
    ball.bounces = 0;

    for (t = 0; t < 120; t++) {
        int col = (int)(ball.pos.x + 0.5);
        int row = H - 1 - (int)(ball.pos.y + 0.5);
        if (row >= 0 && row < H && col >= 0 && col < W)
            screen[row][col] = (char)(ball.bounces < 10 ? '0' + ball.bounces : '*');
        step(&ball, g, 0.05);
    }

    /* Each mark is the number of bounces so far when the ball passed there. */
    for (r = 0; r < H; r++)
        printf("|%s|\n", screen[r]);
    printf("+");
    for (c = 0; c < W; c++)
        putchar('-');
    printf("+\n");
    printf("after 120 steps: pos (%.2f, %.2f) vel (%.2f, %.2f), %d bounces\n",
           ball.pos.x, ball.pos.y, ball.vel.x, ball.vel.y, ball.bounces);
    return 0;
}
