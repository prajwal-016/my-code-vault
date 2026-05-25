-- Enable uuid-ossp extension for uuid generation if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the problems table
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    leetcode_slug TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the code_solutions table
CREATE TABLE IF NOT EXISTS code_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    code TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for quick lookups and sorted listings
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_code_solutions_problem_id ON code_solutions (problem_id);

-- Optional Row Level Security (RLS) setup (disabled by default for ease of local configuration)
-- ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE code_solutions ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow public read access" ON problems FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON problems FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update access" ON problems FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete access" ON problems FOR DELETE USING (true);

-- CREATE POLICY "Allow public read access" ON code_solutions FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert access" ON code_solutions FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update access" ON code_solutions FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete access" ON code_solutions FOR DELETE USING (true);

-- Seed some beautiful mock data (optional, can be deleted)
-- INSERT INTO problems (id, title, description, difficulty) VALUES 
-- ('c1b82e1d-a34f-4d6b-951b-2621c1724d77', 'Two Sum', 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\n### Complexity\n- Time Complexity: $O(N)$ using a hash map\n- Space Complexity: $O(N)$ to store visited elements', 'Easy');

-- INSERT INTO code_solutions (problem_id, title, language, code) VALUES 
-- ('c1b82e1d-a34f-4d6b-951b-2621c1724d77', 'Python - Single Pass Hash Map', 'python', 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []');
