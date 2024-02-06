Brushes.join([
    Brushes.color(155, 155, 155, BrushDefs.WALL),
    Brushes.colorNoise([
        { seed: 40, factor: 60, threshold: 0.4, force: 0.80 },
        { seed: 40, factor: 30, threshold: 0.5, force: 0.4 },
        { seed: 40, factor: 15, threshold: 0.4, force: 0.2 },
        { seed: 40, factor: 5, threshold: 0.4, force: 0.1 },
    ], 135, 135, 135),
    Brushes.colorNoise([
        { seed: 41, factor: 60, threshold: 0.4, force: 0.80 },
        { seed: 41, factor: 30, threshold: 0.5, force: 0.4 },
        { seed: 41, factor: 15, threshold: 0.4, force: 0.2 },
        { seed: 41, factor: 5, threshold: 0.3, force: 0.1 },
    ], 130, 130, 130)
]);