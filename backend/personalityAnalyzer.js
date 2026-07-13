const CONFIG = {
  THRESHOLDS: {
    speed: { low: 40, medium: 60, high: 80 },
    accuracy: { low: 50, medium: 70, high: 85 },
    variety: { low: 30, medium: 50, high: 70 },
    persistence: { low: 30, medium: 60, high: 80 },
    topicScore: { low: 40, medium: 60, high: 80 },
  },
  TRAIT_WEIGHTS: {
    speed: 0.25,
    accuracy: 0.25,
    variety: 0.15,
    persistence: 0.2,
    topicProficiency: 0.15,
  },
};

export class CodingPersonalityAnalyzer {
  constructor(userData) {
    this.userData = userData || {};
    this.metrics = null;
    this.traits = [];
    this.cachedResult = null;
  }

  analyze() {
    if (this.cachedResult) {
      return this.cachedResult;
    }

    const metrics = this.calculateMetrics();
    this.metrics = metrics;

    const traits = this.getTraits(metrics);
    this.traits = traits;

    const result = {
      traits,
      metrics,
      description: this.generateDescription(traits, metrics),
      summary: this.generateSummary(traits, metrics),
      recommendations: this.generateRecommendations(traits, metrics),
    };

    this.cachedResult = result;
    return result;
  }

  calculateMetrics() {
    const { submissions = [], topics = [], streak = 0 } = this.userData;

    return {
      speed: this.getSpeed(submissions),
      accuracy: this.getAccuracy(submissions),
      variety: this.getVariety(topics),
      persistence: this.getPersistence(streak),
      graphProficiency: this.getTopicScore(topics, 'graph'),
      mathProficiency: this.getTopicScore(topics, 'math'),
      patternProficiency: this.getTopicScore(topics, 'pattern'),
      optimization: this.getOptimizationScore(submissions),
      consistency: this.getConsistencyScore(submissions),
    };
  }

  getSpeed(submissions) {
    if (!submissions || submissions.length === 0) return 50;
    const avgTime = submissions.reduce((sum, s) => sum + (s.time || 0), 0) / submissions.length;
    if (avgTime < 10) return 90;
    if (avgTime < 30) return 75;
    if (avgTime < 60) return 60;
    if (avgTime < 120) return 40;
    return 25;
  }

  getAccuracy(submissions) {
    if (!submissions || submissions.length === 0) return 50;
    const correct = submissions.filter((s) => s.correct === true).length;
    return Math.round((correct / submissions.length) * 100);
  }

  getVariety(topics) {
    if (!topics || topics.length === 0) return 50;
    const uniqueTopics = new Set(topics.map((t) => t.category || t));
    return Math.min(100, (uniqueTopics.size / 10) * 100);
  }

  getPersistence(streak) {
    if (streak > 30) return 90;
    if (streak > 15) return 70;
    if (streak > 7) return 50;
    if (streak > 3) return 30;
    return 20;
  }

  getTopicScore(topics, topicName) {
    if (!topics || topics.length === 0) return 50;
    const relevant = topics.filter(
      (t) =>
        (t.category && t.category.toLowerCase().includes(topicName)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(topicName)))
    );
    const score = (relevant.length / Math.min(topics.length, 20)) * 100;
    return Math.min(100, Math.round(score * 0.8 + 20));
  }

  getOptimizationScore(submissions) {
    if (!submissions || submissions.length === 0) return 50;
    const optimized = submissions.filter((s) => s.optimized === true).length;
    return Math.round((optimized / submissions.length) * 100);
  }

  getConsistencyScore(submissions) {
    if (!submissions || submissions.length < 5) return 50;
    const scores = submissions.map((s) => s.score || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.min(100, 100 - stdDev * 2));
  }

  getTraits(metrics) {
    const traits = [];
    const m = metrics;

    if (m.speed > CONFIG.THRESHOLDS.speed.high && m.accuracy > CONFIG.THRESHOLDS.accuracy.medium) {
      traits.push({
        name: 'Fast Solver',
        icon: '🚀',
        desc: 'Solves problems quickly and efficiently',
        score: Math.round((m.speed + m.accuracy) / 2),
      });
    }

    if (m.accuracy > CONFIG.THRESHOLDS.accuracy.high) {
      traits.push({
        name: 'Logical Thinker',
        icon: '🧠',
        desc: 'High accuracy approach to problem solving',
        score: m.accuracy,
      });
    }

    if (m.graphProficiency > CONFIG.THRESHOLDS.topicScore.high) {
      traits.push({
        name: 'Graph Enthusiast',
        icon: '🌳',
        desc: 'Loves graph problems and excels at them',
        score: m.graphProficiency,
      });
    }

    if (m.optimization > CONFIG.THRESHOLDS.topicScore.high) {
      traits.push({
        name: 'Optimization Expert',
        icon: '⚡',
        desc: 'Optimizes solutions for better performance',
        score: m.optimization,
      });
    }

    if (
      m.speed > CONFIG.THRESHOLDS.speed.medium &&
      m.accuracy > CONFIG.THRESHOLDS.accuracy.medium &&
      m.variety > CONFIG.THRESHOLDS.variety.medium
    ) {
      traits.push({
        name: 'Interview Ready',
        icon: '🎯',
        desc: 'Well-rounded performer with balanced skills',
        score: Math.round((m.speed + m.accuracy + m.variety) / 3),
      });
    }

    if (m.mathProficiency > CONFIG.THRESHOLDS.topicScore.high) {
      traits.push({
        name: 'Math Ninja',
        icon: '🧮',
        desc: 'Strong in mathematical concepts',
        score: m.mathProficiency,
      });
    }

    if (m.patternProficiency > CONFIG.THRESHOLDS.topicScore.high) {
      traits.push({
        name: 'Pattern Master',
        icon: '🎨',
        desc: 'Excellent at recognizing patterns',
        score: m.patternProficiency,
      });
    }

    if (m.persistence > CONFIG.THRESHOLDS.persistence.high) {
      traits.push({
        name: 'Persistent Learner',
        icon: '💪',
        desc: 'Never gives up on difficult problems',
        score: m.persistence,
      });
    }

    if (m.consistency > CONFIG.THRESHOLDS.accuracy.high) {
      traits.push({
        name: 'Consistent Performer',
        icon: '📊',
        desc: 'Maintains consistent performance across problems',
        score: m.consistency,
      });
    }

    return traits.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  generateDescription(traits, metrics) {
    if (!traits || traits.length === 0) {
      return "You're developing your coding skills. Keep practicing to discover your personality traits!";
    }

    const topTrait = traits[0];
    const secondTrait = traits[1];
    const thirdTrait = traits[2];

    let desc = `Your coding personality shows you are a ${topTrait.name}.`;

    if (secondTrait) {
      desc += ` You also demonstrate ${secondTrait.name} tendencies.`;
    }

    if (thirdTrait) {
      desc += ` Additionally, you show traits of a ${thirdTrait.name}.`;
    }

    if (metrics.speed > 70 && metrics.accuracy > 70) {
      desc += ' You are a well-balanced problem solver.';
    } else if (metrics.speed > 70) {
      desc += ' You prioritize speed over accuracy.';
    } else if (metrics.accuracy > 70) {
      desc += ' You prioritize accuracy over speed.';
    }

    return desc;
  }

  generateSummary(traits, metrics) {
    const primaryTrait = traits.length > 0 ? traits[0] : null;
    const totalScore = Object.values(CONFIG.TRAIT_WEIGHTS).reduce((sum, w) => sum + w, 0);
    const weightedScore =
      ((metrics.speed || 0) * CONFIG.TRAIT_WEIGHTS.speed +
        (metrics.accuracy || 0) * CONFIG.TRAIT_WEIGHTS.accuracy +
        (metrics.variety || 0) * CONFIG.TRAIT_WEIGHTS.variety +
        (metrics.persistence || 0) * CONFIG.TRAIT_WEIGHTS.persistence +
        ((metrics.graphProficiency + metrics.mathProficiency + metrics.patternProficiency) / 3) *
          CONFIG.TRAIT_WEIGHTS.topicProficiency) /
      totalScore;

    let level = 'Beginner';
    if (weightedScore >= 80) level = 'Expert';
    else if (weightedScore >= 60) level = 'Advanced';
    else if (weightedScore >= 40) level = 'Intermediate';

    return {
      level,
      weightedScore: Math.round(weightedScore),
      primaryTrait: primaryTrait ? primaryTrait.name : 'Balanced',
      traitsCount: traits.length,
    };
  }

  generateRecommendations(traits, metrics) {
    const recommendations = [];

    if (metrics.speed < CONFIG.THRESHOLDS.speed.medium) {
      recommendations.push('Practice solving problems with time constraints to improve speed');
    }

    if (metrics.accuracy < CONFIG.THRESHOLDS.accuracy.medium) {
      recommendations.push('Focus on understanding problems fully before writing code');
    }

    if (metrics.variety < CONFIG.THRESHOLDS.variety.medium) {
      recommendations.push('Explore different problem categories to increase variety');
    }

    if (metrics.persistence < CONFIG.THRESHOLDS.persistence.medium) {
      recommendations.push('Try to solve problems without looking at solutions immediately');
    }

    if (metrics.graphProficiency < CONFIG.THRESHOLDS.topicScore.medium) {
      recommendations.push('Practice more graph problems to improve proficiency');
    }

    if (metrics.mathProficiency < CONFIG.THRESHOLDS.topicScore.medium) {
      recommendations.push('Review mathematical concepts and their applications');
    }

    if (metrics.patternProficiency < CONFIG.THRESHOLDS.topicScore.medium) {
      recommendations.push('Study common problem patterns and their solutions');
    }

    if (metrics.optimization < CONFIG.THRESHOLDS.topicScore.medium) {
      recommendations.push('Practice optimizing your solutions for better performance');
    }

    return recommendations.slice(0, 5);
  }

  invalidateCache() {
    this.cachedResult = null;
    this.metrics = null;
    this.traits = [];
  }

  getMetrics() {
    if (!this.metrics) {
      this.analyze();
    }
    return this.metrics;
  }

  getTraitsList() {
    if (this.traits.length === 0) {
      this.analyze();
    }
    return this.traits;
  }
}

export default CodingPersonalityAnalyzer;
