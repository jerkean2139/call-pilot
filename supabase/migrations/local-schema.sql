-- CoreTrack Local Development Schema

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  completed_at timestamptz DEFAULT now(),
  answers jsonb NOT NULL,
  results jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);

-- Insert sample data for testing
INSERT INTO assessments (user_id, answers, results) VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  '{"question1": "A", "question2": "B", "question3": "C"}',
  '{"primary": "Analyst", "secondary": "Specialist", "scores": {"critical_thinking": 85, "independence": 70, "passion": 65, "role_clarity": 80, "collaboration": 60}}'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  '{"question1": "B", "question2": "A", "question3": "D"}',
  '{"primary": "Catalyst", "secondary": "Connector", "scores": {"critical_thinking": 70, "independence": 75, "passion": 90, "role_clarity": 65, "collaboration": 85}}'
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO coretrack;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO coretrack;
