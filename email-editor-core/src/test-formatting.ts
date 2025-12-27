/**
 * Test parseInlineFormatting function
 * Run with: npx ts-node test-formatting.ts
 */

import { parseInlineFormatting } from './renderer/parseInlineFormatting.js';

// Test cases
const testCases = [
  {
    input: 'NOBI Dana Kripto: Solusi Investasi Kripto yang {{bold:#008867}}#SemudahItu{{/bold}}',
    expected: 'NOBI Dana Kripto: Solusi Investasi Kripto yang <span style="color:#008867;font-weight:700;">#SemudahItu</span>',
    description: 'Basic formatting with accent color',
  },
  {
    input: 'Start {{bold:#FF0000}}red text{{/bold}} middle {{bold:#0000FF}}blue text{{/bold}} end',
    expected: 'Start <span style="color:#FF0000;font-weight:700;">red text</span> middle <span style="color:#0000FF;font-weight:700;">blue text</span> end',
    description: 'Multiple formatting tokens',
  },
  {
    input: 'No formatting here',
    expected: 'No formatting here',
    description: 'No tokens present',
  },
  {
    input: 'Invalid {{bold:NOTACOLOR}}text{{/bold}} should stay as is',
    expected: 'Invalid {{bold:NOTACOLOR}}text{{/bold}} should stay as is',
    description: 'Invalid color format ignored',
  },
  {
    input: 'Valid 3-char hex {{bold:#F0F}}text{{/bold}} works',
    expected: 'Valid 3-char hex <span style="color:#F0F;font-weight:700;">text</span> works',
    description: '3-character hex color supported',
  },
  {
    input: 'Visit {{link:https://example.com}}our website{{/link}} for more',
    expected: 'Visit <a href="https://example.com" style="color:#008867;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">our website</a> for more',
    description: 'Basic link with https',
  },
  {
    input: 'Email us {{link:mailto:hello@example.com}}here{{/link}} anytime',
    expected: 'Email us <a href="mailto:hello@example.com" style="color:#008867;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">here</a> anytime',
    description: 'Email link with mailto',
  },
  {
    input: 'Chat {{link:https://wa.me/1234567890}}on WhatsApp{{/link}} now',
    expected: 'Chat <a href="https://wa.me/1234567890" style="color:#008867;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">on WhatsApp</a> now',
    description: 'WhatsApp link with wa.me',
  },
  {
    input: 'Invalid {{link:javascript:alert(1)}}attack{{/link}} blocked',
    expected: 'Invalid attack blocked',
    description: 'JavaScript URLs rejected',
  },
  {
    input: 'Invalid {{link:data:text/html}}data{{/link}} blocked',
    expected: 'Invalid data blocked',
    description: 'Data URLs rejected',
  },
  {
    input: 'Both {{bold:#008867}}bold{{/bold}} and {{link:https://example.com}}link{{/link}} work',
    expected: 'Both <span style="color:#008867;font-weight:700;">bold</span> and <a href="https://example.com" style="color:#008867;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">link</a> work',
    description: 'Both bold and link tokens in same text',
  },
  {
    input: 'Combined {{bold:#FF0000}}bold{{/bold}} {{link:https://example.com}}link{{/link}} test',
    expected: 'Combined <span style="color:#FF0000;font-weight:700;">bold</span> <a href="https://example.com" style="color:#008867;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">link</a> test',
    description: 'Adjacent bold and link tokens',
  },
  {
    input: 'Combined {{link:https://example.com|bold|color:#FF0000}}bold red link{{/link}} test',
    expected: 'Combined <a href="https://example.com" style="color:#FF0000;text-decoration:underline;font-weight:700;" target="_blank" rel="noopener noreferrer">bold red link</a> test',
    description: 'Link with bold and custom color',
  },
  {
    input: 'Just {{link:https://example.com|bold}}bold link{{/link}} no color',
    expected: 'Just <a href="https://example.com" style="color:#008867;text-decoration:underline;font-weight:700;" target="_blank" rel="noopener noreferrer">bold link</a> no color',
    description: 'Link with bold only',
  },
  {
    input: 'Just {{link:https://example.com|color:#0000FF}}colored link{{/link}} no bold',
    expected: 'Just <a href="https://example.com" style="color:#0000FF;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">colored link</a> no bold',
    description: 'Link with color only',
  },
  {
    input: 'Invalid {{link:https://example.com|invalid}}modifier{{/link}} ignored',
    expected: 'Invalid <a href="https://example.com" style="color:#008867;text-decoration:underline;font-weight:600;" target="_blank" rel="noopener noreferrer">modifier</a> ignored',
    description: 'Invalid modifier ignored gracefully',
  },
  {
    input: 'Text with {{style:bold}}strong emphasis{{/style}} word',
    expected: 'Text with <span style="font-weight:700;">strong emphasis</span> word',
    description: 'Style token with bold weight only',
  },
  {
    input: 'Text with {{style:color:#FF0000}}red text{{/style}} here',
    expected: 'Text with <span style="color:#FF0000;">red text</span> here',
    description: 'Style token with color only',
  },
  {
    input: 'Text with {{style:semibold|color:#008867}}styled{{/style}} word',
    expected: 'Text with <span style="color:#008867;font-weight:600;">styled</span> word',
    description: 'Style token with semibold and color',
  },
  {
    input: 'Text with {{style:bold|color:#0000FF}}bold blue{{/style}} text',
    expected: 'Text with <span style="color:#0000FF;font-weight:700;">bold blue</span> text',
    description: 'Style token with bold and custom color',
  },
  {
    input: 'Invalid {{style:invalid}}token{{/style}} ignored',
    expected: 'Invalid token ignored',
    description: 'Invalid style token (no valid options) renders plain text',
  },
];

console.log('Testing parseInlineFormatting function...\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = parseInlineFormatting(testCase.input);
  const isPass = result === testCase.expected;

  if (isPass) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${testCase.description}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${testCase.description}`);
    console.log(`  Input:    ${testCase.input}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Got:      ${result}`);
  }
});

console.log(`\n${passed} passed, ${failed} failed out of ${testCases.length} tests`);
