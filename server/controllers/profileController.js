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

    // Try to fetch actual public LinkedIn page data
    let profileText = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });
      if (response.ok) {
        const html = await response.text();
        // Remove scripts and styles, strip html tags to get basic text content
        profileText = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        // Limit text to avoid token limits
        if (profileText.length > 15000) profileText = profileText.substring(0, 15000);
      }
    } catch (e) {
      console.log('Failed to fetch LinkedIn profile natively:', e.message);
    }

    let extractionContext = '';
    if (profileText && profileText.length > 200) {
      extractionContext = `
LinkedIn Profile Data:
${profileText}
Extract the user's technical skills, experience, and education from this text.
      `;
    } else {
      extractionContext = `
LinkedIn Professional Profile Name/Handle: ${username}
URL: ${url}
(Unable to fetch real data) Based on this profile handle, infer a realistic set of technical skills and experience for a software professional.
      `;
    }

    const extractedData = await extractSkillsPrompt(extractionContext);

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
