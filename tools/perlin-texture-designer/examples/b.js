Brushes.join([
    Brushes.color(45, 45, 45, BrushDefs.WALL),
    Brushes.colorNoise([
        { seed: 40, factor: 60, threshold: 0.4, force: 0.80 },
        { seed: 40, factor: 30, threshold: 0.5, force: 0.4 },
        { seed: 40, factor: 15, threshold: 0.4, force: 0.2 },
        { seed: 40, factor: 5, threshold: 0.4, force: 0.1 },
    ], 79, 69, 63),
    Brushes.colorNoise([
        { seed: 41, factor: 60, threshold: 0.4, force: 0.80 },
        { seed: 41, factor: 30, threshold: 0.5, force: 0.4 },
        { seed: 41, factor: 15, threshold: 0.4, force: 0.2 },
        { seed: 41, factor: 5, threshold: 0.4, force: 0.1 },
    ], 35, 35, 35),
]);