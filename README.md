# Gym Engine (AI-Driven Hypertrophy System)

An adaptive, machine-learning-powered strength training engine built in TypeScript. 
Instead of relying on static, rigid workout plans, **Gym Engine** dynamically calculates the optimal next exercise to maximize hypertrophy based on real-time individual recovery, performance trends, and biomechanical data.

## Core Concept

The engine operates on a hybrid decision model evaluating a normalized 6-dimensional feature vector for every available exercise before a set:

1. **Performance Trend:** Current 1RM (Estimated 1 Rep Max) trajectory.
2. **Staleness:** Exercise frequency fatigue (prevents CNS burnout from identical movements).
3. **Primary Muscle Recovery:** Time elapsed since the target muscle was last trained.
4. **Synergist Recovery:** Recovery status of assisting muscles (e.g., triceps during chest press).
5. **Antagonist Recovery:** Freshness of opposing muscle groups.
6. **Machine Specific Recovery:** Time since this exact machine was last utilized.

The goal of the engine is to predict and select the exercise that yields the highest positive **$e1RM$ Delta** (performance progression) for the current set.



## Architecture & Data Flow

The system strictly separates static biomechanical facts from dynamic training history.

### 1. Static Biomechanics (exerciseDefinition.ts)
Exercises are defined with immutable biomechanical facts:
- `MuscleGroup` (Primary, Synergists, Antagonists)
- `MuscleFocus` (Stretched vs. Contracted)
- `Fatigue` Level & `MovementPattern`

### 2. Dynamic History (SQLite)
The relational database tracks sessions, sets, and ML training logs:
- `workouts`: The overall training session.
- `ex`: The instance of an exercise within a workout.
- `records`: The individual sets (`weight`, `reps`, `rir`, `is_warmup`).
- `nn_training_logs`: Stores the exact 6D feature vector $X$ and the achieved $e1RM$ delta $Y$ as training data for the neural network.



Because Neural Networks require large datasets to overcome noise, the engine utilizes a two-phase bootstrapping approach:

### Linear Scoring Engine
A hardcoded heuristic algorithm weights the 6 features to calculate a `Priority Score`. As the user works out, the engine records the environmental features *before* the set and the actual performance progression *after* the set into `nn_training_logs`.

### Neural Network Regression 
Once enough data (or generated teacher-student pre-training data) is collected, a Deep Feedforward Neural Network takes over. 
- **Input:** 6D Feature Vector `[0.0, 1.0]`
- **Output:** Predicted $e1RM$ Delta
The engine runs a batched prediction across all available gym machines and recommends the one with the highest predicted performance gain.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone
cd gym_engine

# Install dependencies (including tfjs-node & sqlite3)
npm install

# To test the Engine you can use the CLI Example with:
npm run test:cli