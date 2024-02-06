Brushes.join([
    Brushes.color(155, 155, 155, BrushDefs.WALL),
    Brushes.colorNoise([
        { seed: 40, factor: 40, threshold: 0.4, force: 0.75 },
        { seed: 40, factor: 20, threshold: 0.5, force: 0.4 },
        { seed: 40, factor: 10, threshold: 0.4, force: 0.2 },
        { seed: 40, factor: 5, threshold: 0.4, force: 0.1 },
    ], 135, 135, 135),
    Brushes.colorNoise([
        { seed: 41, factor: 10, threshold: 0.4, force: 0.4 },
        { seed: 41, factor: 6, threshold: 0.3, force: 0.3 },
        { seed: 41, factor: 4, threshold: 0.5, force: 0.3 },
    ], 130, 130, 130)
]);