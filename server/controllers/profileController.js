const pdfParse = require('pdf-parse');
const { extractSkillsPrompt, suggestCareerPathPrompt } = require('../utils/openai');
const Profile = require('../models/Profile');

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let text = '';
    try {
      if (!req.file.buffer) throw new Error('File buffer is empty');
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    } catch (parseErr) {
      console.error('PDF Parsing Error:', parseErr.message);
      text = ''; // Let extractSkillsPrompt handle the empty case gracefully
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ message: 'No readable text found in PDF. Please upload a text-based PDF.' });
    }

    const extractedData = await extractSkillsPrompt(text);

    let formattedSkills = [];
    if (extractedData.skills && Array.isArray(extractedData.skills)) {
      formattedSkills = extractedData.skills.map(s => {
        if (typeof s === 'string') return { name: s, level: 50 };
        return { name: s.name || 'Unknown', level: s.level || 50 };
      });
    }

    const profileData = {
      userId: req.user.id,
      skills: formattedSkills,
      experience: extractedData.experience || '',
      education: extractedData.education || '',
      extractedFrom: 'Resume'
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileData },
      { new: true, upsert: true }
    );

    // Generate personalized career suggestions from actual extracted skills
    const suggestions = await suggestCareerPathPrompt(profileData);

    res.json({ profile, careerSuggestions: suggestions.suggestions });
  } catch (err) {
    console.error('Resume Upload Error:', err);
    res.status(500).json({ message: 'Error processing resume', error: err.message });
  }
};

exports.analyzeLinkedIn = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    // Extract username from LinkedIn URL for context
    const usernameMatch = url.match(/linkedin\.com\/in\/([^/?]+)/i);
    const username = usernameMatch ? usernameMatch[1].replace(/-/g, ' ') : 'the candidate';

    // Since we cannot scrape LinkedIn, we ask the AI to generate an estimated profile
    // based on the username pattern. User can then adjust levels in SkillReview.
    const pseudoText = `
LinkedIn Professional Profile
Name/Handle: ${username}
URL: ${url}
This professional is on LinkedIn. Based on their profile handle and typical LinkedIn profiles
for software professionals, infer a realistic set of technical skills and experience.
Provide realistic skill levels between 50-85 for a working professional.
Include a mix of programming languages, frameworks, and tools typical for their apparent specialization.
    `;

    const extractedData = await extractSkillsPrompt(pseudoText);

    let formattedSkills = [];
    if (extractedData.skills && Array.isArray(extractedData.skills)) {
      formattedSkills = extractedData.skills.map(s =>
        typeof s === 'string' ? { name: s, level: 55 } : { name: s.name || 'Unknown', level: s.level || 55 }
      );
    }

    // Ensure we have at least some skills if AI returned nothing useful
    if (formattedSkills.length < 2) {
      formattedSkills = [
        { name: 'JavaScript', level: 65 },
        { name: 'HTML/CSS', level: 70 },
        { name: 'Python', level: 55 },
        { name: 'SQL', level: 60 },
        { name: 'Git', level: 75 },
      ];
    }

    const profileData = {
      userId: req.user.id,
      skills: formattedSkills,
      experience: extractedData.experience || `Professional (LinkedIn: ${username})`,
      education: extractedData.education || 'See LinkedIn profile',
      extractedFrom: 'LinkedIn'
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: profileData },
      { new: true, upsert: true }
    );

    const suggestions = await suggestCareerPathPrompt(profileData);

    res.json({
      profile,
      careerSuggestions: suggestions.suggestions,
      note: 'Skills are AI-estimated from your LinkedIn URL. Review and adjust proficiency levels in the next step.'
    });
  } catch (err) {
    console.error('LinkedIn Analysis Error:', err);
    res.status(500).json({ message: 'Error analyzing LinkedIn profile', error: err.message });
  }
};

exports.manualUpdate = async (req, res) => {
  try {
    const { skills, experience, education } = req.body;

    let formattedSkills = skills;
    if (skills && Array.isArray(skills) && typeof skills[0] === 'string') {
      formattedSkills = skills.map(s => ({ name: s, level: 50 }));
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { skills: formattedSkills, experience, education, extractedFrom: 'Manual' } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    console.error('Manual Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.json(null);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};
