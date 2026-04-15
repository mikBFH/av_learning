# AV Learning Prototype

**Context-Aware Language Learning for Automated Vehicles**

Accompanying prototype for our CHI 2026 poster: *"Learning on the Move: Challenges, Opportunities, and Design Recommendations for Education in Automated Vehicles"*

## About the Research

Through interviews with 31 commuters (including educators and automotive experts), we identified key challenges and opportunities for learning in automated vehicles. This prototype implements two of our design recommendations to make them tangible and testable:

- **DR2: Context-Aware Content Delivery** — Vocabulary lessons adapt to landmarks along the route
- **DR3: Multi-Modal Interaction** — Voice commands enable hands-free learning alongside touch controls and audio feedback

## What the Prototype Does

The prototype is a context-aware language learning app designed for use in automated vehicles. It is still under active development. The current version demonstrates:

- Full-screen driving video (YouTube simulation or live webcam/dashcam)
- Landmark-based vocabulary delivery that adapts to the route
- Audio pronunciation with waveform visualization
- Voice commands: "next", "repeat", "I know this", "example", "pause", "continue"
- Auto-advance mode for fully hands-free operation
- Session logging with CSV export for study analysis

The learning content, languages, and routes are configurable and not limited to any specific city or language.

## Running Locally

Requires Node.js >= 18.17.0.

```bash
git clone https://github.com/mikBFH/av_learning.git
cd av_learning
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Next Steps

We will evaluate the prototype with real users in a controlled study to measure:

- **Task performance** — Vocabulary retention with and without context-aware delivery
- **Cognitive load** — Self-reported and physiological measures during simulated driving
- **Interaction preferences** — Voice vs. touch usage patterns and switching behavior
- **Perceived usefulness** — Whether context-linked content feels meaningful to learners

The session logging built into the prototype captures timestamped interaction data for quantitative analysis.

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Voice**: Web Speech API (recognition + synthesis)
- **Camera**: MediaDevices API
- **Styling**: CSS Variables + inline styles

## License

MIT — see [LICENSE](LICENSE) for details.
