
import { useEffect, useRef } from "react";
import p5 from "p5";
import "./FlowerBackground.css";

export default function FlowerBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const sketch = (p) => {
            let flowers = [];
            let resizeObserver;

            const palettes = {
                extraLight: [
                    "#fbfaf6", "#e2f0e9", "#d5e9df",
                    "#fbe8df", "#edf5ef"
                ],
                light: [
                    "#a9d2c3", "#8fc5b5", "#b8dcd0",
                    "#e9967c", "#f0b49e"
                ],
                medium: [
                    "#258f85", "#6fae9d", "#8dbca8",
                    "#e9967c", "#547d70"
                ],
                dark: [
                    "#194f50", "#264c4b", "#276c65",
                    "#547d70", "#b96750"
                ]
            };

            class PatternFlower {
                constructor(x, y, size) {
                    this.x = x;
                    this.y = y;
                    this.size = size;
                    this.petalCount = p.random([7, 8, 9]);
                    this.rotation = p.random(p.TWO_PI);
                    this.flowerScale = p.random(0.8, 1.1);

                    this.highlightColor = p.random(palettes.extraLight);
                    this.petalColor = p.random(palettes.light);
                    this.centerColor = p.random(palettes.medium);
                    this.innerColor = p.random(palettes.dark);

                    this.petalLengths = Array.from(
                        { length: this.petalCount },
                        () => p.random([2.5, 3, 3.5])
                    );

                    this.centerSize = p.random([3.5, 4, 4.25]);
                    this.innerCenterColor = p.random(palettes.light);
                }

                display() {
                    p.push();
                    p.translate(this.x, this.y);
                    p.rotate(this.rotation);
                    p.scale(this.flowerScale);
                    this.drawFlower();
                    p.pop();
                }

                drawFlower() {
                    const size = this.size;

                    for (let i = 0; i < this.petalCount; i++) {
                        p.push();
                        p.rotate((p.TWO_PI / this.petalCount) * i);

                        p.fill(this.petalColor);
                        p.stroke(this.innerColor);
                        p.strokeWeight(size * 0.018);

                        p.ellipse(
                            0,
                            size / 4,
                            size / 9,
                            size / this.petalLengths[i]
                        );

                        p.noStroke();
                        p.fill(this.highlightColor);
                        p.ellipse(0, size / 4, size / 18, size / 6);

                        p.pop();
                    }

                    p.stroke(this.innerColor);
                    p.strokeWeight(size * 0.02);
                    p.fill(this.centerColor);
                    p.circle(0, 0, size / this.centerSize);

                    p.noStroke();
                    p.fill(this.innerCenterColor);
                    p.circle(0, 0, size * 0.17);
                }
            }

            const createFlowers = () => {
                const w = p.width;
                const h = p.height;
                const baseSize = Math.min(w, h);

                flowers = [
                    // Left side
                    new PatternFlower(w * 0.1, h * 0.18, baseSize * 0.25),
                    new PatternFlower(-w * 0.01, h * 0.48, baseSize * 0.34),
                    new PatternFlower(w * 0.18, h * 0.88, baseSize * 0.22),

                    // Top
                    new PatternFlower(w * 0.27, h * 0.08, baseSize * 0.20),
                    new PatternFlower(w * 0.72, h * 0.10, baseSize * 0.24),

                    // Right side
                    new PatternFlower(w * 1.0, h * 0.22, baseSize * 0.30),
                    new PatternFlower(w * 1.01, h * 0.58, baseSize * 0.25),
                    new PatternFlower(w * 0.83, h * 0.91, baseSize * 0.28),

                    // Bottom
                    new PatternFlower(w * 0.38, h * 1.02, baseSize * 0.22),
                    new PatternFlower(w * 0.58, h * 0.96, baseSize * 0.18)
                ];
            };

            const updateCanvas = () => {
                if (!containerRef.current) return;

                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;

                if (!w || !h) return;

                p.resizeCanvas(w, h);
                createFlowers();
                p.redraw();
            };

            p.setup = () => {
                const w = containerRef.current.clientWidth;
                const h = containerRef.current.clientHeight;

                p.createCanvas(w, h).parent(containerRef.current);
                p.noLoop();

                createFlowers();
                p.redraw();

                resizeObserver = new ResizeObserver(() => {
                    updateCanvas();
                });

                resizeObserver.observe(containerRef.current);
            };

            p.draw = () => {
                p.clear();

                flowers.forEach((flower) => {
                    flower.display();
                });
            };

            p.windowResized = updateCanvas;
        };

        const instance = new p5(sketch);

        return () => {
            instance.remove();
        };
    }, []);

    return (
        <div
            className="flower-background"
            ref={containerRef}
            aria-hidden="true"
        />
    );
}
