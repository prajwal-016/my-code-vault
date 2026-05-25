import { NextResponse } from 'next/server';
import TurndownService from 'turndown';

export async function POST(request: Request) {
  try {
    const { titleSlug } = await request.json();

    if (!titleSlug) {
      return NextResponse.json({ error: 'titleSlug is required' }, { status: 400 });
    }

    // Clean up the input in case they pasted the whole URL
    // e.g., "https://leetcode.com/problems/two-sum/" -> "two-sum"
    const cleanedSlug = titleSlug
      .replace('https://leetcode.com/problems/', '')
      .split('/')[0]
      .replace(/\/$/, '') // remove trailing slash
      .trim();

    const graphqlQuery = {
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            title
            titleSlug
            content
            difficulty
            codeSnippets {
              lang
              langSlug
              code
            }
          }
        }
      `,
      variables: { titleSlug: cleanedSlug },
    };

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API replied with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.question) {
      return NextResponse.json({ error: 'Problem not found on LeetCode' }, { status: 404 });
    }

    const question = data.data.question;

    // Convert raw HTML into clean Markdown before saving to Supabase
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Custom rule to preserve code blocks properly
    turndownService.addRule('pre', {
      filter: 'pre',
      replacement: (content) => {
        return `\n\`\`\`\n${content.trim()}\n\`\`\`\n`;
      }
    });

    const markdownDescription = question.content
      ? turndownService.turndown(question.content)
      : 'No description details returned.';

    // Build a map of langSlug -> code for easy lookup on the client
    const snippetMap: Record<string, string> = {};
    if (Array.isArray(question.codeSnippets)) {
      for (const snippet of question.codeSnippets) {
        snippetMap[snippet.langSlug] = snippet.code;
      }
    }

    return NextResponse.json({
      title: question.title,
      titleSlug: cleanedSlug,
      difficulty: question.difficulty, // Returns 'Easy', 'Medium', or 'Hard'
      description: markdownDescription,
      codeSnippets: snippetMap,        // e.g. { java: "...", python3: "...", cpp: "..." }
    });

  } catch (error: any) {
    console.error('LeetCode Fetch Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch from LeetCode' }, { status: 500 });
  }
}
