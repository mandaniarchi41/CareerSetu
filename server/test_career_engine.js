const { careerRecommendationEnginePrompt } = require('./utils/openai');
const fs = require('fs');

async function runTests() {
    let output = { test1: null, test2: null };

    const resumeText = `
    I am an experienced Software Engineer with 5 years of experience specialized in building scalable web applications.
    Skills: Python, Django, React, Redux, PostgreSQL, Docker, AWS.
    Experience:
    - Senior Developer at TechCorp (2020-Present): Led the migration of monolith to microservices using Python and Docker.
    - Frontend Intern (2018-2020): Built UI components in React.
    Recent Projects:
    - E-commerce platform with React frontend and Django backend, deployed on AWS.
  `;
    try {
        output.test1 = await careerRecommendationEnginePrompt(resumeText);
    } catch (e) {
        output.test1 = { error: e.message };
    }

    const weakText = "hello i like computers";
    try {
        output.test2 = await careerRecommendationEnginePrompt(weakText);
    } catch (e) {
        output.test2 = { error: e.message };
    }

    fs.writeFileSync('./test_out.json', JSON.stringify(output, null, 2));
    console.log("Tests completed, wrote to test_out.json");
}

runTests();
