// src/userInputs.ts

//--------------------------------------------
// CONTEXT -----------------------------------
//--------------------------------------------

// export const companyContext = `
//   Nativish is an AI-powered application and chrome extension that helps language learners improve a written text in any language.
//   It takes a text as input and leverage LLMs to output a revised version that is more fluent, and natural-sounding.
// `;

export const productContext = `
  Nativish is an AI-powered application and chrome extension that helps language learners improve a written text in any language.
  It takes a text as input and leverage LLMs to output a revised version that is more fluent, and natural-sounding.
`;

//--------------------------------------------
// BLOG  -------------------------------------
//--------------------------------------------

export const blogStrategy = `
  We use our blog for SEO purposes and to attract new language learners to our platform.
  We generally target common keywords people are likely to search for when leaning another language, like "Write a resume in English" or "May I vs Can I".
  We cover most languages, but the blog posts for now are in English, even if they are about another language.
  Blog posts should be educative and provide value to the reader. Most of them should not be about our product, but we do include some examples of how Nativish could help.
`;


const copyGuidelines = `
  • Make sure to adapt the content to the target audience.
  • Do not call out the target audience directly.
  • Flesh-Kincaid reading level: 8th grade
  • Overall tone: Conversational, informative, and slightly humorous
  • Sentence complexity: Mix of simple and compound sentences
  • Average sentence length: 15-25 words
  • Paragraph structure: Short paragraphs, clear topic sentences, smooth transitions
  • Vocabulary level: Accessible with occasional advanced terms explained
  • Use of jargon: Minimal, with explanations when used
  • Information density: Moderate, balanced facts and explanations
  • Use of rhetorical devices: Occasional rhetorical questions and analogies
  • Active vs. passive voice: Strong preference for active voice
  • Use of examples: Frequent, relatable examples and anecdotes
  • Formatting elements: Frequent use of subheadings and bullet points
  • Use of humor: Light, occasional humor and wit
  • Emotional appeal: Moderate, focusing on reader's needs and challenges
  • Information repetition: Very limited repetition, focus on new insights
  • Introduction style: Engaging with a hook and clear thesis. Can be a little witty
  • Conclusion style: Summary with call to action to product
`;

const outlineGuidelines = `
  • Open with a brief, relatable anecdote or problem statement
  • Use section headers (3 or 4 sections)
  • Use subheadings to break up content into digestible chunks, but only if there is enough content in each section
  • Do not use headers for the introduction or conclusion
  • Use bullet points and short paragraphs for easy scanning
  • Incorporate examples
  • Short conclusion that doesn't repeat too much information from the body
`;

export const generateBlogPostOutline = {
  userID: 1,
  contentType: "blog_post_outline",
  // componentType: "outline",
  contentSubType: "default_blog_post",
  config: {
    topic: "Common mistakes in French for French learners",
    targetAudience: "French language learners",
    expertise: "French grammar teaching to non-native speakers",
    outlineGuidelines: outlineGuidelines,
    copyGuidelines: copyGuidelines,
    formattingGuidelines: "The output should be in markdown format.",
    // userProvidedAngles: "- use of gendered nouns, - confusion of accents, - double negatives",
  }
};

export const generateBlogPostCopy = {
  userID: 1,
  contentType: "blog_post_copy",
  // componentType: "full_content",
  contentSubType: "default_blog_post",
  config: {
    topic: "Common mistakes in German for German learners",
    targetAudience: "German language learners",
    expertise: "German grammar teaching to non-native speakers",
    outlineGuidelines: outlineGuidelines,
    copyGuidelines: copyGuidelines,
    formattingGuidelines: "The output should be in markdown format.",
    // outline: 13
    outline: "Declinations, word order, and false friends",
    // userProvidedAngles: "- use of gendered nouns, - confusion of accents, - double negatives",
  }
};

//--------------------------------------------
// TWITTER -----------------------------------
//--------------------------------------------

export const twitterStrategy = `
  We use Twitter to showcase how Nativish works.
  Usually the post points out a language quirk (in any language) in an engaging way, and we add a screenshot of Nativish with an input text (not optimally fluent) and the output text (fluent).'
`;

export const twitterExamples = `
  Example 1:
  - Post: "Nativish can help tighten up your communication even in technical writing, without turning it into AI slop."
  - Screenshot input: "When orbiting Mars, the perigee is the lowest point in the orbit."
  - Screenshot output: "When orbiting Mars, the periapsis is the lowest point in the orbit."
  Example 2:
  - Post: "Did you know? In French, the expletive “ne,” typically used to convey a negative meaning, is also used with conjunctions like “avant que,” “à moins que,” and “de peur que.” There’s no negation there, but it’s necessary for the sentence to be correct!"
  - Screenshot input: "Allons au supermarché avant qu'il ferme".
  - Screenshot output: "Allons au supermarché avant qu'il ne ferme".
`;

const twitterAdditionalInstructions = `
  Only include posts for language quirks that lead to frequent mistakes by language learners.
  Focus on the English language and vary the types of quirks.
`;

export const generateTwitterPostIdeas = {
  userID: 1,
  contentType: "twitter_post_ideas",
  contentSubType: "default_twitter_post_ideas",
  config: {
    productContext: productContext,
    twitterStrategy: twitterStrategy,
    twitterExamples: twitterExamples,
    additionalInstructions: twitterAdditionalInstructions,
    expertise: "all languages"
  }
};

export const generateTwitterPost = {
  userID: 1,
  contentType: "twitter_post",
  // contentSubType: "nativish_twitter_post",
  contentSubType: "default_twitter_post",
  config: {
    action: "write_topic",
    // action can be "write_topic", "write_outline", "promote_content", "repurpose_content", "promote_product", 
    topic: "Subjunctive mood in turkish",
    targetAudience: "turkish learners",
    tone: "Informative and thought-provoking",
    characterLimit: 280,
    expertise: "turkish grammar teaching to non-native speakers"
  }
};

//--------------------------------------------
// LINKEDIN ----------------------------------
//--------------------------------------------

export const generateLinkedinPost = {
  userID: 1,
  contentType: "linkedin_post",
  contentSubType: "default_linkedin_post",
  // contentSubType: "aiGuru_linkedin_post",
  config: {
    action: "write_topic",
    topic: "The need for human review in AI-generated content",
    ideas: `
      - AI-generated content is easy to spot, it starts always the same ("in the rapidly evolving landscape...")
      - some signs are industry specific - for example, in marketing, it's the use of "leverage" and "synergy"
      - other are universal
      - you need a workflow to review AI-generated content and remove these signs
      - you can actually add AI steps in the workflow with prompts to make the content more human
      - the human touch is still needed, AI won't catch everything
    `,
    targetAudience: "marketing professionals and executive",
    tone: "Informative and thought-provoking",
    expertise: "LLMs and their application for marketing"
  }
};



//--------------------------------------------
// NATIVISH SCREENSHOT -----------------------
//--------------------------------------------

export const nativishExamples = `
  Example 1:
  - Text to illustrate: "Did you know? In French, the expletive “ne,” typically used to convey a negative meaning, is also used with conjunctions like “avant que,” “à moins que,” and “de peur que.” There’s no negation there, but it’s necessary for the sentence to be correct!"
  - Version with mistake: "Allons au supermarché avant qu'il ferme".
  - Revised version, perfectly fluent: "Allons au supermarché avant qu'il ne ferme".
  Example 2:
  - Text to illustrate: "Common confusion between 'affect' and 'effect' in English."
  - Version with mistake: "The new law will positively effect the economy."
  - Revised version, perfectly fluent: "The new law will positively affect the economy."
`;

export const screenshotTweetExamples = `
  Example 1: "‘Who’ or ‘Whom’ in English questions? Tricky question! Nativish can help ;)"
  Example 2: "Ever feel like writing apps take the soul out of your text? Not Nativish! Nativish keeps your unique style while making the necessary edits. Check it out."
  Example 3: "Did you know? In French, the expletive “ne,” typically used to convey a negative meaning, is also used with conjunctions like “avant que,” “à moins que,” and “de peur que.” There’s no negation there, but it’s necessary for the sentence to be correct!"
  Example 4: "Some words really don’t have direct translations in most languages! For example, the Spanish word ‘sobremesa’ describes the time spent chatting at the table after a meal. 🍽️ It’s a beloved tradition! Do you have a favorite untranslatable word? Share it with us!
  `;

export const nativishCreateInputTextFromTopic = {
  userID: 1,
  contentType: "nativish_input_text",
  contentSubType: "nativish_input_text",
  config: {
    topic: "Incorrect use of subjunctive mood in Portuguese",
    language: "Portuguese",
  }
};

export const nativishScreenshot = {
  userID: 1,
  contentType: "nativish_screenshot",
  contentSubType: "nativish_screenshot",
  config: {
    inputText: "Ben mutluyum ve ben eve gidiyorum.",
    topic: "Overusing personal pronouns in Turkish",
    language: "Turkish",
    examples: screenshotTweetExamples
  }
};


//--------------------------------------------
// GUIDELINES -------------------------------
//--------------------------------------------

export const guidelinesUserInput = {
  userID: 1,
  contentType: "guidelines",
  contentSubType: "guidelines",
  config: {
    contentType: "blog posts",
    contentExamplesFiles: ["index.md", "index 2.md", "index 3.md"],
    expertise: "content strategy"
  }
};

//--------------------------------------------
// SEED THE PROGRAM --------------------------
//--------------------------------------------

// input here the user input you want to use the program with

// export const userInput = nativishScreenshot;
// export const userInput = nativishCreateInputTextFromTopic;
// export const userInput = generateTwitterPostIdeas;
export const userInput = generateTwitterPost;
// export const userInput = generateLinkedinPost;
// export const userInput = generateBlogPostCopy;
// export const userInput = generateBlogPostOutline;
