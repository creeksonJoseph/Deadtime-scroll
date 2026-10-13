-- Seed sample bounty data for testing
-- Run this after the main migration

-- Insert sample bounties (using existing profile IDs)
INSERT INTO bounties (
  creator_id,
  title,
  description,
  requirements,
  reward_amount,
  deadline,
  status,
  category,
  max_submissions
) VALUES
-- Open bounty
(
  (SELECT id FROM profiles LIMIT 1),
  'Build a Web3 Task Manager',
  'Create a decentralized task management application where users can create, assign, and track tasks using blockchain technology. The app should include wallet connection, task NFTs, and reward distribution.',
  '- React/TypeScript frontend\n- Smart contract integration\n- MetaMask wallet support\n- Task creation and assignment\n- NFT rewards for completed tasks\n- Responsive design\n- GitHub repository with README',
  2.5,
  NOW() + INTERVAL '30 days',
  'open',
  'Web3',
  5
),
-- Judging bounty
(
  (SELECT id FROM profiles OFFSET 1 LIMIT 1),
  'AI-Powered Code Review Tool',
  'Develop an AI assistant that can review code pull requests and provide intelligent feedback on code quality, security vulnerabilities, and best practices.',
  '- Python/Node.js backend\n- AI/ML integration (OpenAI API)\n- GitHub API integration\n- Code analysis algorithms\n- Web dashboard for results\n- API documentation\n- Docker deployment',
  5.0,
  NOW() + INTERVAL '45 days',
  'judging',
  'AI/ML',
  3
),
-- Completed bounty
(
  (SELECT id FROM profiles OFFSET 2 LIMIT 1),
  'Mobile Crypto Portfolio Tracker',
  'Build a mobile app that tracks cryptocurrency portfolios across multiple wallets and exchanges with real-time price updates and analytics.',
  '- React Native or Flutter\n- Multi-wallet support\n- Real-time price feeds\n- Portfolio analytics\n- Push notifications\n- Secure key management\n- App store ready',
  1.8,
  NOW() - INTERVAL '5 days',
  'completed',
  'Mobile',
  1
),
-- High reward bounty
(
  (SELECT id FROM profiles OFFSET 3 LIMIT 1),
  'Decentralized Social Media Platform',
  'Create a censorship-resistant social media platform using IPFS for content storage and blockchain for user identity and content verification.',
  '- Full-stack web application\n- IPFS integration for content\n- Blockchain identity system\n- Content moderation tools\n- Mobile responsive design\n- Scalable architecture\n- Security audit report',
  10.0,
  NOW() + INTERVAL '60 days',
  'open',
  'Social',
  10
),
-- Quick bounty
(
  (SELECT id FROM profiles OFFSET 4 LIMIT 1),
  'Smart Contract Security Audit',
  'Perform a comprehensive security audit of our DeFi lending protocol smart contracts and provide a detailed report with recommendations.',
  '- Solidity expertise required\n- Security audit experience\n- Automated testing tools\n- Manual code review\n- Detailed vulnerability report\n- Remediation recommendations\n- Final audit certificate',
  3.2,
  NOW() + INTERVAL '14 days',
  'open',
  'Security',
  2
);

-- Insert sample submissions for the judging bounty
INSERT INTO bounty_submissions (
  bounty_id,
  developer_id,
  title,
  description,
  github_url,
  demo_url,
  is_winner,
  submission_rank,
  payout_amount
) VALUES
-- Winner submission
(
  (SELECT id FROM bounties WHERE status = 'judging' LIMIT 1),
  (SELECT id FROM profiles OFFSET 1 LIMIT 1),
  'CodeReview AI - Intelligent PR Analysis',
  'A comprehensive AI-powered code review tool that analyzes pull requests for security vulnerabilities, code quality issues, and best practice violations. Features include real-time analysis, detailed reports, and integration with popular CI/CD pipelines.',
  'https://github.com/example/codereview-ai',
  'https://codereview-ai-demo.vercel.app',
  true,
  1,
  4.5
),
-- Second place submission
(
  (SELECT id FROM bounties WHERE status = 'judging' LIMIT 1),
  (SELECT id FROM profiles OFFSET 2 LIMIT 1),
  'SmartReviewer - ML Code Analysis',
  'Machine learning-based code review assistant that provides contextual feedback on code changes. Includes custom rule engine and supports multiple programming languages.',
  'https://github.com/example/smart-reviewer',
  'https://smartreviewer-demo.netlify.app',
  true,
  2,
  0.5
);

-- Insert sample submissions for completed bounty
INSERT INTO bounty_submissions (
  bounty_id,
  developer_id,
  title,
  description,
  github_url,
  demo_url,
  is_winner,
  submission_rank,
  payout_amount
) VALUES
(
  (SELECT id FROM bounties WHERE status = 'completed' LIMIT 1),
  (SELECT id FROM profiles OFFSET 3 LIMIT 1),
  'CryptoTracker Pro - Portfolio Management',
  'Feature-rich mobile application for tracking cryptocurrency portfolios with advanced analytics, price alerts, and multi-exchange support. Built with React Native and includes biometric security.',
  'https://github.com/example/crypto-tracker-pro',
  'https://apps.apple.com/app/crypto-tracker-pro',
  true,
  1,
  1.8
);

-- Insert sample submissions for open bounties (no winners yet)
INSERT INTO bounty_submissions (
  bounty_id,
  developer_id,
  title,
  description,
  github_url,
  demo_url
) VALUES
(
  (SELECT id FROM bounties WHERE title = 'Build a Web3 Task Manager' LIMIT 1),
  (SELECT id FROM profiles OFFSET 4 LIMIT 1),
  'TaskChain - Decentralized Task Management',
  'Blockchain-based task management system with NFT rewards and DAO governance. Features include task creation, assignment, progress tracking, and automatic reward distribution.',
  'https://github.com/example/taskchain',
  'https://taskchain-demo.vercel.app'
),
(
  (SELECT id FROM bounties WHERE title = 'Decentralized Social Media Platform' LIMIT 1),
  (SELECT id FROM profiles OFFSET 1 LIMIT 1),
  'DecentraBook - Censorship-Resistant Social Network',
  'Fully decentralized social media platform using IPFS for content storage and Ethereum for identity management. Includes content moderation through community voting.',
  'https://github.com/example/decentrabook',
  'https://decentrabook-beta.ipfs.io'
);

-- Insert sample comments
INSERT INTO bounty_comments (
  bounty_id,
  author_id,
  content
) VALUES
(
  (SELECT id FROM bounties WHERE title = 'Build a Web3 Task Manager' LIMIT 1),
  (SELECT id FROM profiles OFFSET 1 LIMIT 1),
  'Great bounty! I''m working on a solution using React and Hardhat. Will have a demo ready soon.'
),
(
  (SELECT id FROM bounties WHERE title = 'Build a Web3 Task Manager' LIMIT 1),
  (SELECT id FROM bounties WHERE title = 'Build a Web3 Task Manager' LIMIT 1),
  'Looking forward to seeing the submissions! Make sure to include comprehensive testing and documentation.'
),
(
  (SELECT id FROM bounties WHERE title = 'Decentralized Social Media Platform' LIMIT 1),
  (SELECT id FROM profiles OFFSET 2 LIMIT 1),
  'This is an ambitious project! Are you open to using alternative storage solutions like Arweave alongside IPFS?'
);

-- Insert submission comments
INSERT INTO bounty_comments (
  submission_id,
  author_id,
  content
) VALUES
(
  (SELECT id FROM bounty_submissions WHERE title = 'CodeReview AI - Intelligent PR Analysis' LIMIT 1),
  (SELECT creator_id FROM bounties WHERE status = 'judging' LIMIT 1),
  'Excellent work! The AI analysis is very thorough and the integration with GitHub is seamless. This is exactly what we were looking for.'
),
(
  (SELECT id FROM bounty_submissions WHERE title = 'SmartReviewer - ML Code Analysis' LIMIT 1),
  (SELECT creator_id FROM bounties WHERE status = 'judging' LIMIT 1),
  'Good implementation with solid ML foundations. The custom rule engine is a nice touch. Consider adding more language support for future versions.'
);