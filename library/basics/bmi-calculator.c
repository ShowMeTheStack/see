/*
 * title: Body mass index
 * level: 1
 * about: Reads a weight in kilograms and a height in centimetres and prints the body mass index with its usual category.
 * input: 72 178
 */
#include <stdio.h>

int main(void)
{
    double weight_kg;
    double height_cm;
    double height_m;
    double bmi;

    printf("Weight (kg) and height (cm): ");
    scanf("%lf %lf", &weight_kg, &height_cm);
    printf("%.1f %.1f\n", weight_kg, height_cm);

    /* The formula wants metres, so convert first. Dividing by 100.0, a
       double, keeps the fraction. */
    height_m = height_cm / 100.0;

    /* BMI is weight divided by the square of the height. */
    bmi = weight_kg / (height_m * height_m);
    printf("BMI = %.1f\n", bmi);

    /*
     * An if / else if chain checks the ranges in order and stops at the
     * first one that fits, so each test only needs an upper limit.
     */
    if (bmi < 18.5) {
        printf("category: underweight\n");
    } else if (bmi < 25.0) {
        printf("category: normal\n");
    } else if (bmi < 30.0) {
        printf("category: overweight\n");
    } else {
        printf("category: obese\n");
    }
    return 0;
}
