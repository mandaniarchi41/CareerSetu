const { Hercai } = require('hercai');
const herc = new Hercai({});

// ── JSON extractor ─────────────────────────────────────────────────────────
const extractJSON = (text) => {
  try {
    const jsonStr = text.replace(/```json/i, '').replace(/```/g, '').trim();
    const startIndex = jsonStr.indexOf('{');
    const endIndex = jsonStr.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      return JSON.parse(jsonStr.substring(startIndex, endIndex + 1));
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', text?.substring(0, 300));
    throw new Error('Failed to parse AI output');
  }
};

// ── Guarantee every step has ≥2 YouTube resource links ────────────────────
const ensureYouTubeResources = (roadmapData, goal) => {
  if (!roadmapData || !roadmapData.phases) return roadmapData;
  roadmapData.phases = roadmapData.phases.map(phase => {
    phase.steps = (phase.steps || []).map(step => {
      const hasYT = step.resources && step.resources.some(
        r => r.link && (r.link.includes('youtube.com') || r.link.includes('youtu.be'))
      );
      if (!hasYT) {
        const q1 = encodeURIComponent(`${step.title} ${goal} tutorial`).replace(/%20/g, '+');
        const q2 = encodeURIComponent(`${step.title} full course for beginners`).replace(/%20/g, '+');
        step.resources = [
          { title: `${step.title} — Tutorial`, link: `https://www.youtube.com/results?search_query=${q1}`, type: 'video' },
          { title: `${step.title} — Full Course`, link: `https://www.youtube.com/results?search_query=${q2}`, type: 'video' }
        ];
      } else if (step.resources.length < 2) {
        const q = encodeURIComponent(`${step.title} ${goal} project`).replace(/%20/g, '+');
        step.resources.push({
          title: `${step.title} — Project Walkthrough`,
          link: `https://www.youtube.com/results?search_query=${q}`,
          type: 'video'
        });
      }
      return step;
    });
    return phase;
  });
  return roadmapData;
};

exports.youtubeSearchUrl = (topic) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(topic).replace(/%20/g, '+')}`;

// ── AI caller with model fallback chain ───────────────────────────────────
const askAI = async (prompt) => {
  const models = ['v3', 'llama3', 'turbo'];
  for (const model of models) {
    try {
      console.log(`Asking Hercai AI (${model})...`);
      const response = await herc.chat.completions.create({ model, content: prompt });
      if (response && response.reply && response.reply.trim().length > 20) {
        return response.reply;
      }
    } catch (err) {
      console.error(`Model ${model} failed, trying next...`);
    }
  }
  throw new Error('All AI models failed');
};

// ── Smart fallback: compute personalized suggestions from actual skill data ─
const computeCareerSuggestions = (skills = [], experience = '') => {
  const domains = [
    {
      role: 'Frontend Developer',
      coreKeywords: ['react', 'vue', 'angular', 'next.js', 'svelte'],    // high weight
      supportKeywords: ['html', 'css', 'javascript', 'typescript', 'tailwind', 'figma', 'ui', 'ux'],
    },
    {
      role: 'Backend Developer',
      coreKeywords: ['node.js', 'express', 'django', 'flask', 'spring', 'fastapi', 'go', 'java'],
      supportKeywords: ['postgresql', 'mysql', 'redis', 'graphql', 'rest', 'api', 'mongodb', 'php', 'ruby'],
    },
    {
      role: 'Full Stack Developer',
      coreKeywords: ['react', 'node.js', 'javascript', 'typescript'],
      supportKeywords: ['mongodb', 'postgresql', 'mysql', 'express', 'next.js', 'docker', 'html', 'css', 'vue'],
    },
    {
      role: 'Data Scientist',
      coreKeywords: ['python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn'],
      supportKeywords: ['pandas', 'numpy', 'jupyter', 'statistics', 'data analysis', 'matplotlib', 'sql'],
    },
    {
      role: 'Machine Learning Engineer',
      coreKeywords: ['tensorflow', 'pytorch', 'mlops', 'nlp', 'computer vision', 'transformers'],
      supportKeywords: ['python', 'keras', 'cuda', 'scikit-learn', 'hugging face', 'docker', 'kubernetes'],
    },
    {
      role: 'DevOps / Cloud Engineer',
      coreKeywords: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'ci/cd'],
      supportKeywords: ['linux', 'bash', 'jenkins', 'ansible', 'monitoring', 'devops', 'nginx'],
    },
    {
      role: 'Mobile Developer',
      coreKeywords: ['react native', 'flutter', 'swift', 'kotlin', 'dart'],
      supportKeywords: ['android', 'ios', 'xcode', 'expo', 'firebase', 'mobile'],
    },
    {
      role: 'Cybersecurity Engineer',
      coreKeywords: ['penetration testing', 'ethical hacking', 'cybersecurity', 'kali linux', 'owasp'],
      supportKeywords: ['networking', 'encryption', 'firewall', 'soc', 'siem', 'linux', 'python'],
    },
    {
      role: 'Data Engineer',
      coreKeywords: ['apache spark', 'kafka', 'airflow', 'etl', 'data pipeline', 'hadoop'],
      supportKeywords: ['python', 'sql', 'redshift', 'bigquery', 'snowflake', 'dbt', 'docker'],
    },
    {
      role: 'UI/UX Designer',
      coreKeywords: ['figma', 'sketch', 'adobe xd', 'prototyping', 'wireframing', 'user research'],
      supportKeywords: ['design systems', 'accessibility', 'ui design', 'ux design', 'css', 'html'],
    },
  ];

  // Normalize skill names for matching (exact word boundary check)
  const normalizedSkills = skills.map(s => ({
    name: (typeof s === 'string' ? s : s.name || '').toLowerCase().trim(),
    level: typeof s === 'object' ? (s.level || 50) : 50
  }));
  const expLower = (experience || '').toLowerCase();

  const matchSkill = (keyword) => {
    return normalizedSkills.find(s => {
      // Exact match or one clearly contains the other (min 3 chars)
      const kw = keyword.toLowerCase();
      return s.name === kw ||
        (kw.length >= 3 && s.name.includes(kw)) ||
        (s.name.length >= 3 && kw.includes(s.name));
    });
  };

  const scored = domains.map(domain => {
    let coreScore = 0;
    let supportScore = 0;
    let matchedSkillNames = [];

    // Core keywords — weighted 3x
    domain.coreKeywords.forEach(kw => {
      const match = matchSkill(kw);
      if (match) {
        coreScore += match.level * 3;
        matchedSkillNames.push(match.name);
      } else if (expLower.includes(kw)) {
        coreScore += 120; // experience mention = moderate match
      }
    });

    // Support keywords — weighted 1x
    domain.supportKeywords.forEach(kw => {
      const match = matchSkill(kw);
      if (match) {
        supportScore += match.level;
        if (!matchedSkillNames.includes(match.name)) matchedSkillNames.push(match.name);
      } else if (expLower.includes(kw)) {
        supportScore += 30;
      }
    });

    const totalPossible = (domain.coreKeywords.length * 100 * 3) + (domain.supportKeywords.length * 100);
    const rawScore = coreScore + supportScore;
    // Normalize to 60-97% range (never show 0% or 100%)
    const matchPct = rawScore === 0 ? 0 : Math.min(97, Math.round(60 + (rawScore / totalPossible) * 37));

    return { role: domain.role, rawScore, matchPct, matchedSkillNames };
  });

  // Sort by raw score, take top 3 that actually have some match
  const top3 = scored
    .filter(d => d.rawScore > 0)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 3);

  // If fewer than 3 have matches, fill with best remaining
  const extras = scored.filter(d => d.rawScore === 0).slice(0, 3 - top3.length);
  const results = [...top3, ...extras].slice(0, 3);

  return {
    suggestions: results.map((d, i) => {
      const topSkills = d.matchedSkillNames.slice(0, 3);
      const displayScore = d.rawScore > 0 ? d.matchPct : Math.max(30 - i * 8, 15);
      return {
        role: d.role,
        reason: topSkills.length > 0
          ? `Your ${topSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')} ${topSkills.length === 1 ? 'skill' : 'skills'} make you a strong candidate for this role.`
          : 'This role aligns with your general tech background.',
        matchScore: displayScore
      };
    })
  };
};


// ── Smart fallback: compute gap analysis from actual skills ───────────────
const computeSkillGap = (userSkills = [], targetRole = '') => {
  const roleLower = targetRole.toLowerCase();
  const normalizedUserSkills = userSkills.map(s =>
    (typeof s === 'string' ? s : s.name || '').toLowerCase()
  );

  // Role → required skill sets
  const roleRequirements = {
    'frontend': ['React', 'TypeScript', 'CSS', 'HTML', 'Next.js', 'Testing (Jest)', 'Accessibility'],
    'backend': ['Node.js', 'Express', 'PostgreSQL', 'REST APIs', 'Authentication', 'Caching', 'System Design'],
    'full stack': ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'Docker', 'TypeScript', 'CI/CD'],
    'data scientist': ['Python', 'Pandas', 'Scikit-learn', 'Statistics', 'SQL', 'Data Visualization', 'Machine Learning'],
    'machine learning': ['Python', 'TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'MLOps', 'Mathematics'],
    'devops': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Linux', 'Monitoring'],
    'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'APIs', 'App Store Deployment'],
    'data engineer': ['Python', 'SQL', 'Apache Spark', 'Kafka', 'ETL', 'Airflow', 'Cloud Storage'],
    'security': ['Network Security', 'Penetration Testing', 'OWASP', 'Linux', 'Cryptography', 'SIEM'],
  };

  // Find the best matching role category
  let requirements = ['System Design', 'Testing', 'CI/CD', 'Cloud Services', 'Performance Optimization'];
  for (const [key, reqs] of Object.entries(roleRequirements)) {
    if (roleLower.includes(key)) {
      requirements = reqs;
      break;
    }
  }

  const missingSkills = requirements.filter(req =>
    !normalizedUserSkills.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))
  );

  const weakSkills = userSkills
    .filter(s => typeof s === 'object' && (s.level || 50) < 60)
    .map(s => s.name);

  // Determine level based on skill count and avg level
  const avgLevel = userSkills.length > 0
    ? userSkills.reduce((sum, s) => sum + (typeof s === 'object' ? (s.level || 50) : 50), 0) / userSkills.length
    : 30;
  const currentLevel = avgLevel >= 75 ? 'Advanced' : avgLevel >= 50 ? 'Intermediate' : 'Beginner';

  return {
    missingSkills: missingSkills.slice(0, 6),
    weakSkills,
    priorityOrder: [...missingSkills.slice(0, 4), ...weakSkills.slice(0, 2)],
    currentLevel
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTED PROMPT FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

exports.extractSkillsPrompt = async (resumeText) => {
  const prompt = `
You are an expert resume parser and career analyst.
Extract ONLY information present in this resume text. Do NOT invent or assume anything.

RESUME TEXT:
"""
${resumeText}
"""

Extract and return STRICT JSON ONLY:
{
  "skills": [
    { "name": "Skill Name", "level": <integer 10-100 based on evidence in resume> }
  ],
  "experience": "<summary of work experience from the resume>",
  "education": "<highest degree and institution from the resume>"
}

Rules:
- Level 90-100 = extensive experience (5+ years, multiple projects mentioned)
- Level 70-89 = solid experience (2-5 years or clearly listed as primary skill)
- Level 50-69 = moderate (1-2 years or listed as secondary skill)
- Level 30-49 = basic (mentioned once or as a tool)
- Only include skills explicitly mentioned in the resume text
- Return ONLY JSON, no explanation
`;
  try {
    const reply = await askAI(prompt);
    return extractJSON(reply);
  } catch (err) {
    console.warn('AI extraction failed. Computing from raw text...');
    // Smart text-based extraction from resume text
    const techKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby',
      'React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'Git',
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SCSS',
      'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
      'GraphQL', 'REST', 'gRPC', 'WebSockets', 'Kafka', 'RabbitMQ',
      'Swift', 'Kotlin', 'Flutter', 'React Native',
    ];
    const detectedSkills = techKeywords
      .filter(kw => resumeText.toLowerCase().includes(kw.toLowerCase()))
      .map(kw => {
        // Rough level: count how many times mentioned
        const count = (resumeText.match(new RegExp(kw, 'gi')) || []).length;
        return { name: kw, level: Math.min(90, 40 + count * 15) };
      });

    const experienceMatch = resumeText.match(/(\d+)\s*years?/i);
    return {
      skills: detectedSkills.length > 0 ? detectedSkills : [{ name: 'Programming', level: 50 }],
      experience: experienceMatch ? `${experienceMatch[1]} years of experience` : 'Experience details extracted from resume',
      education: resumeText.toLowerCase().includes('university') || resumeText.toLowerCase().includes('degree')
        ? 'University degree (see resume for details)' : 'Education details in resume'
    };
  }
};

exports.skillGapAnalysisPrompt = async (userSkills, targetRole) => {
  const skillsStr = userSkills.map(s =>
    typeof s === 'object' ? `${s.name} (${s.level || 50}%)` : s
  ).join(', ');

  const prompt = `
You are a senior technical hiring manager and career coach.
A candidate wants to become a "${targetRole}".

Their CURRENT SKILLS with proficiency levels:
${skillsStr}

Your task:
1. Identify skills that ${targetRole} roles REQUIRE but this candidate LACKS
2. Identify skills they have but at LOW proficiency (under 70%) that need strengthening
3. Determine their overall readiness level for this role
4. Prioritize what they should learn first

Return STRICT JSON ONLY (no explanation, no markdown):
{
  "missingSkills": ["skill1", "skill2", "skill3"],
  "weakSkills": ["skill4", "skill5"],
  "priorityOrder": ["most important first", "..."],
  "currentLevel": "Beginner|Intermediate|Advanced",
  "readinessNote": "One sentence about their current readiness for this role"
}
`;
  try {
    const reply = await askAI(prompt);
    return extractJSON(reply);
  } catch (err) {
    console.warn('Gap analysis AI failed. Using computed fallback...');
    return computeSkillGap(userSkills, targetRole);
  }
};

exports.suggestCareerPathPrompt = async (profileData) => {
  const skills = profileData.skills || [];
  const skillsStr = skills.map(s =>
    typeof s === 'object' ? `${s.name} (${s.level || 50}% proficiency)` : s
  ).join(', ');

  const prompt = `
You are an expert career advisor with deep knowledge of the tech industry.
Based on this candidate's ACTUAL profile, recommend the 3 most suitable career paths.

CANDIDATE PROFILE:
Skills: ${skillsStr || 'Not specified'}
Experience: ${profileData.experience || 'Not specified'}
Education: ${profileData.education || 'Not specified'}
Source: Profile from ${profileData.extractedFrom || 'manual entry'}

INSTRUCTIONS:
- Recommendations MUST be based on the actual skills listed above
- Match scores MUST reflect real alignment with their skills
- Reasons MUST reference specific skills from their profile
- DO NOT give generic suggestions — tailor to THIS specific profile

Return STRICT JSON ONLY:
{
  "suggestions": [
    {
      "role": "Specific Role Title",
      "reason": "Because you have [specific skills from their profile], you are well-suited for...",
      "matchScore": <integer 60-99 based on actual skill alignment>
    }
  ]
}
`;
  try {
    const reply = await askAI(prompt);
    const result = extractJSON(reply);
    // Validate — if suggestions look generic, use computed fallback
    if (result.suggestions && result.suggestions.length >= 2) {
      return result;
    }
    throw new Error('Invalid suggestion format');
  } catch (err) {
    console.warn('Career suggestions AI failed. Using computed profile-based fallback...');
    return computeCareerSuggestions(skills, profileData.experience || '');
  }
};

exports.generateLearningPathPrompt = async (goal, currentLevel, missingSkills, skillsWithLevels = [], timeCommitment = '5-10 hours per week') => {
  const strongSkills = skillsWithLevels.filter(s => (s.level || 0) >= 70).map(s => `${s.name} (${s.level}%)`);
  const weakSkills = skillsWithLevels.filter(s => (s.level || 0) > 0 && (s.level || 0) < 70).map(s => `${s.name} (${s.level}%)`);
  const allSkillsStr = skillsWithLevels.map(s => `${s.name}: ${s.level}%`).join(', ') || 'Not specified';

  const prompt = `
You are an expert career mentor AI. Generate a HIGHLY PERSONALIZED learning path.
DO NOT generate a generic roadmap. EVERY step must reference this specific user's data.

# USER PROFILE
Target Role: "${goal}"
Experience Level: ${currentLevel}
Available Time: ${timeCommitment}

Current Skills (with proficiency):
${allSkillsStr}

Strong Skills (already knows — SKIP basics for these):
${strongSkills.length > 0 ? strongSkills.join(', ') : 'None'}

Weak Skills (needs reinforcement — ADD focused steps for these):
${weakSkills.length > 0 ? weakSkills.join(', ') : 'None'}

Missing Skills (highest priority — MUST include dedicated steps):
${missingSkills.join(', ')}

# STRICT INSTRUCTIONS
1. PERSONALIZE every step — mention why it's needed FOR THIS USER based on their actual skill levels.
2. SKIP basics for skills where the user is already at 70%+. Jump straight to advanced usage.
3. FOCUS extra steps on weak skills (below 70%).
4. PRIORITIZE missing skills with dedicated, multiple steps.
5. Adjust step difficulty and pace based on "${timeCommitment}" availability.
6. Generate 20 to 40 steps total divided into Beginner (if needed), Intermediate, and Advanced phases.
7. For resources, use YouTube search query URLs: https://www.youtube.com/results?search_query=TOPIC

# OUTPUT (STRICT JSON ONLY — no markdown, no explanation text)
{
  "phases": [
    {
      "phase": "Beginner",
      "steps": [
        {
          "title": "Step title",
          "description": "What to learn and do",
          "reason": "Why this step is important SPECIFICALLY for this user given their skill levels",
          "estimatedTime": "X weeks",
          "difficulty": "Easy|Medium|Hard",
          "project": "Hands-on project task",
          "resources": [
            { "title": "YouTube video title", "link": "https://www.youtube.com/results?search_query=topic", "type": "video" }
          ]
        }
      ]
    }
  ]
}
`;

  try {
    const reply = await askAI(prompt);
    const parsed = extractJSON(reply);
    return ensureYouTubeResources(parsed, goal);
  } catch (err) {
    console.warn('Path generation AI failed. Using computed personalized fallback...');
    // Build a truly personalized fallback from user's actual data
    return ensureYouTubeResources({
      phases: [
        {
          phase: currentLevel === 'Advanced' ? 'Intermediate' : 'Beginner',
          steps: [
            {
              title: `${missingSkills[0] || goal} Foundations`,
              description: `Learn the core fundamentals of ${missingSkills[0] || goal}. This is your highest-priority gap.`,
              reason: `${missingSkills[0] || goal} is identified as your most critical missing skill for the ${goal} role.`,
              estimatedTime: '2 weeks',
              difficulty: 'Easy',
              project: `Build a starter project demonstrating ${missingSkills[0] || goal} basics`,
              resources: []
            },
            {
              title: weakSkills.length > 0 ? `Strengthen ${weakSkills[0]}` : `${goal} Core Concepts`,
              description: weakSkills.length > 0
                ? `Improve your ${weakSkills[0]} proficiency from its current level to production-ready standard.`
                : `Master the fundamental concepts required for the ${goal} role.`,
              reason: weakSkills.length > 0
                ? `You have ${weakSkills[0]} in your profile but at a low proficiency — this will unlock better job opportunities.`
                : `Core knowledge is essential before advancing.`,
              estimatedTime: '1-2 weeks',
              difficulty: 'Easy',
              project: `Complete 3 practical exercises using ${weakSkills[0] || goal}`,
              resources: []
            }
          ]
        },
        {
          phase: 'Intermediate',
          steps: [
            ...missingSkills.slice(0, 3).map((skill, i) => ({
              title: `Master ${skill}`,
              description: `Deep dive into ${skill} — a required skill for ${goal} that you currently don't have.`,
              reason: `${skill} is listed as a missing skill in your gap analysis. Mastering it directly increases your job readiness.`,
              estimatedTime: '2-3 weeks',
              difficulty: 'Medium',
              project: `Build a portfolio project using ${skill}`,
              resources: []
            })),
            {
              title: `Build a Real-World ${goal} Project`,
              description: `Combine your skills to build a complete, portfolio-worthy project matching ${goal} requirements.`,
              reason: `Employers want proof of ability, not just theoretical knowledge.`,
              estimatedTime: '3 weeks',
              difficulty: 'Medium',
              project: `Deploy a complete ${goal} project to GitHub with documentation`,
              resources: []
            }
          ]
        },
        {
          phase: 'Advanced',
          steps: [
            {
              title: 'System Design & Architecture',
              description: `Learn to architect production-grade systems required for senior ${goal} positions.`,
              reason: `Essential for clearing technical interviews and handling real-world ${goal} responsibilities.`,
              estimatedTime: '4 weeks',
              difficulty: 'Hard',
              project: 'Design and document a scalable system architecture diagram',
              resources: []
            },
            {
              title: 'Interview Preparation & Portfolio',
              description: `Prepare for ${goal} technical interviews, polish your portfolio, and practice coding challenges.`,
              reason: 'The final step to converting your learning into a job offer.',
              estimatedTime: '2 weeks',
              difficulty: 'Medium',
              project: `Complete 30 LeetCode problems relevant to ${goal} roles and deploy 2 portfolio projects`,
              resources: []
            }
          ]
        }
      ]
    }, goal);
  }
};

exports.careerRecommendationEnginePrompt = async (inputText) => {
  if (!inputText || inputText.trim().length < 50) {
    return "Not enough data to give accurate recommendation";
  }

  const prompt = `
You are an expert AI Career Recommendation Engine.

INPUT PROFILE DATA:
"""
${inputText}
"""

TASK:
1. Extract ALL relevant information: Technical skills, Tools & technologies, Projects, Experience level, Domain exposure (AI, Web, Cloud, etc.)
2. Assign a WEIGHT (0–10) to each skill based on Frequency in text, Project usage, and Experience level mentioned.
3. Based ONLY on the extracted data (DO NOT GUESS), generate top 3 career paths.
4. Each recommendation MUST include:
   - role: Role name
   - match: Match percentage (calculated, e.g. "85%", not random)
   - reason: Reason based on actual extracted skills
   - missing_skills: Array of gap analysis missing skills

STRICT RULES:
- If input is weak or lacks sufficient detail to extract skills or match roles properly, simply output the exact string: "Not enough data to give accurate recommendation", and nothing else.
- DO NOT give the same output for different inputs.
- Recommendations must CHANGE based on input.
- Avoid generic explanations.
- DO NOT default to Full Stack / Backend / Data Scientist unless strongly justified by the skills.

OUTPUT FORMAT:
Return strictly a JSON object (if data is sufficient) with the exact structure below. Do not include markdown code block formatting like \`\`\`json.
{
  "skills": [
    {"name": "SkillName", "weight": <0-10>}
  ],
  "recommendations": [
    {
      "role": "RoleName",
      "match": "XX%",
      "reason": "Detailed reason...",
      "missing_skills": ["Skill1", "Skill2"]
    }
  ]
}
`;

  try {
    const reply = await askAI(prompt);

    // Check if the AI determined it wasn't enough data
    const trimmedReply = reply.trim().replace(/"/g, '');
    if (trimmedReply.includes("Not enough data to give accurate recommendation")) {
      return "Not enough data to give accurate recommendation";
    }

    const result = extractJSON(reply);

    // Ensure the structure is correct
    if (!result || !result.skills || !result.recommendations) {
      throw new Error('Invalid JSON structure returned from AI');
    }

    return result;
  } catch (err) {
    console.error('Error with careerRecommendationEnginePrompt AI request:', err.message);

    // Fallback logic in case Hercai times out or returns malformed data
    // This provides a fallback calculation just using keyword matching
    const keywords = ['react', 'node', 'python', 'java', 'sql', 'aws', 'docker', 'machine learning', 'javascript', 'typescript', 'mongodb', 'c++', 'c#', 'php'];
    let extractedSkills = [];
    const lowerText = inputText.toLowerCase();

    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        extractedSkills.push({ name: kw.charAt(0).toUpperCase() + kw.slice(1), weight: 6 });
      }
    }

    if (extractedSkills.length === 0) {
      return "Not enough data to give accurate recommendation";
    }

    // A simple basic fallback role based on extracted skills
    let primaryRole = "Software Engineer";
    if (extractedSkills.some(s => s.name === "Python" || s.name === "Machine learning")) primaryRole = "Data Engineer / ML";
    if (extractedSkills.some(s => s.name === "React" || s.name === "Javascript")) primaryRole = "Frontend Developer";

    return {
      skills: extractedSkills,
      recommendations: [
        {
          role: primaryRole,
          match: "75%",
          reason: `Based on your keyword skills like ${extractedSkills[0].name}, this role fits your background well.`,
          missing_skills: ["System Design", "Cloud Infrastructure"]
        }
      ]
    };
  }
};
