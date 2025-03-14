import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  BookOpen, 
  CheckCircle, 
  ArrowRight,  
  BarChart3, 
  Award, 
  FileText,
  Layers
} from 'lucide-react';

export function GuidePage() {
  const [section1Ref, section1InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section2Ref, section2InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section3Ref, section3InView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [section4Ref, section4InView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-black text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-[#FF0000]" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              CoreTrack Assessment Guide
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Everything you need to know to get the most out of your talent assessment process
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/assessment" 
                className="bg-[#FF0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#FF0000]/90 transition-colors flex items-center justify-center gap-2"
              >
                Take Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#table-of-contents" 
                className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                View Guide
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <div id="table-of-contents" className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Table of Contents</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <a 
                href="#getting-started" 
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#FF0000]/30 transition-all flex gap-4"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Getting Started</h3>
                  <p className="text-gray-600">Learn the basics of CoreTrack Assessment</p>
                </div>
              </a>
              
              <a 
                href="#assessment-process" 
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#FF0000]/30 transition-all flex gap-4"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Layers className="w-6 h-6 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Assessment Process</h3>
                  <p className="text-gray-600">How the assessment works</p>
                </div>
              </a>
              
              <a 
                href="#understanding-results" 
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#FF0000]/30 transition-all flex gap-4"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Understanding Results</h3>
                  <p className="text-gray-600">How to interpret assessment results</p>
                </div>
              </a>
              
              <a 
                href="#implementation-guide" 
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#FF0000]/30 transition-all flex gap-4"
              >
                <div className="w-12 h-12 bg-[#FF0000]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#FF0000]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Implementation Guide</h3>
                  <p className="text-gray-600">How to use insights in your hiring process</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <motion.div 
        id="getting-started" 
        className="py-16 bg-white"
        ref={section1Ref}
        initial="hidden"
        animate={section1InView ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <h2 className="text-3xl font-bold">Getting Started</h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p>
                CoreTrack Assessment is designed to help small and medium-sized businesses identify candidates
                with the right mindset and personality traits that align with their company culture and role requirements.
              </p>
              
              <h3>Key Benefits</h3>
              <ul>
                <li>
                  <strong>Science-backed methodology</strong> - Our assessment is based on peer-reviewed research in
                  industrial-organizational psychology.
                </li>
                <li>
                  <strong>Easy to implement</strong> - Simply send the assessment link to candidates, and we'll handle
                  the rest.
                </li>
                <li>
                  <strong>Clear results</strong> - Receive straightforward reports that highlight a candidate's strengths
                  and potential areas of concern.
                </li>
                <li>
                  <strong>Reduce hiring bias</strong> - Get objective insights that help mitigate unconscious bias in
                  your hiring process.
                </li>
              </ul>
              
              <h3>Before You Start</h3>
              <p>
                To get the most out of CoreTrack Assessment, we recommend:
              </p>
              <ol>
                <li>Defining the key traits most important for success in your organization</li>
                <li>Creating an account to manage multiple candidate assessments</li>
                <li>Familiarizing yourself with the four core traits (Critical Thinking, Independence, Passion, Role Clarity)</li>
                <li>Setting up your team members who will be involved in the hiring process</li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assessment Process */}
      <motion.div 
        id="assessment-process" 
        className="py-16 bg-gray-50"
        ref={section2Ref}
        initial="hidden"
        animate={section2InView ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <h2 className="text-3xl font-bold">Assessment Process</h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p>
                The CoreTrack Assessment takes approximately 15-20 minutes to complete and consists of a series of
                scenario-based questions designed to evaluate four key traits.
              </p>
              
              <h3>Assessment Flow</h3>
              <ol>
                <li>
                  <strong>Candidate Invitation</strong> - Send an email invitation with a unique assessment link to your candidate.
                </li>
                <li>
                  <strong>Assessment Completion</strong> - The candidate completes the assessment at their convenience.
                </li>
                <li>
                  <strong>Automatic Analysis</strong> - Our algorithm analyzes the responses to generate a comprehensive profile.
                </li>
                <li>
                  <strong>Results Dashboard</strong> - Access the results through your administrator dashboard.
                </li>
              </ol>
              
              <h3>The Four Core Traits</h3>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#FF0000]/10 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#FF0000]" />
                    </div>
                    Critical Thinking
                  </h4>
                  <p>
                    Measures how a candidate approaches problem-solving, evaluates information, and makes decisions.
                    High scores indicate strong analytical abilities and thoughtful decision-making processes.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#FF0000]/10 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#FF0000]" />
                    </div>
                    Independence
                  </h4>
                  <p>
                    Evaluates a candidate's ability to work autonomously, take initiative, and navigate challenges with
                    minimal supervision. High scores suggest self-starters who thrive with greater autonomy.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#FF0000]/10 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#FF0000]" />
                    </div>
                    Passion
                  </h4>
                  <p>
                    Gauges a candidate's intrinsic motivation, enthusiasm for learning, and commitment to excellence in
                    their work. High scores indicate candidates who are likely to be engaged and dedicated.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#FF0000]/10 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-[#FF0000]" />
                    </div>
                    Role Clarity
                  </h4>
                  <p>
                    Assesses how a candidate understands their responsibilities, manages boundaries, and aligns their
                    work with organizational goals. High scores suggest candidates who excel with clear expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Understanding Results */}
      <motion.div 
        id="understanding-results" 
        className="py-16 bg-white"
        ref={section3Ref}
        initial="hidden"
        animate={section3InView ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <h2 className="text-3xl font-bold">Understanding Results</h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p>
                The CoreTrack Assessment provides comprehensive insights into a candidate's traits and working style.
                Here's how to interpret the results effectively:
              </p>
              
              <h3>Results Dashboard</h3>
              <p>
                Your results dashboard displays:
              </p>
              <ul>
                <li>Overall fit score for your organization</li>
                <li>Individual scores for each of the four core traits</li>
                <li>Detailed analysis of specific strengths and potential areas for development</li>
                <li>Role recommendations based on the candidate's profile</li>
              </ul>
              
              <h3>Score Interpretation</h3>
              <p>
                Scores are presented on a scale of 0-100 for each trait:
              </p>
              <ul>
                <li><strong>85-100:</strong> Exceptional - The candidate demonstrates strong mastery of this trait</li>
                <li><strong>70-84:</strong> Strong - The candidate performs well in this area</li>
                <li><strong>50-69:</strong> Moderate - The candidate shows some capability in this area</li>
                <li><strong>Below 50:</strong> Developing - The candidate may need support in this area</li>
              </ul>
              
              <div className="bg-[#FF0000]/5 border border-[#FF0000]/20 p-6 rounded-lg my-8">
                <h4 className="font-bold text-lg mb-2">Important Note</h4>
                <p className="mb-0">
                  The CoreTrack Assessment should be used as one component of your hiring process, not as the sole
                  determining factor. Always combine these insights with interviews, reference checks, and other
                  evaluation methods for a comprehensive candidate assessment.
                </p>
              </div>
              
              <h3>Sample Report</h3>
              <p>
                Here's what a typical candidate report looks like:
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-4 border-b border-gray-200">
                  <h4 className="font-bold m-0">Candidate Profile: Jane Smith</h4>
                </div>
                <div className="p-4">
                  <p className="font-medium">Overall Fit Score: 78%</p>
                  <div className="space-y-4 mt-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Critical Thinking</span>
                        <span>82%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-[#FF0000] h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Independence</span>
                        <span>74%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-[#FF0000] h-2 rounded-full" style={{ width: '74%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Passion</span>
                        <span>88%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-[#FF0000] h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Role Clarity</span>
                        <span>68%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div className="bg-[#FF0000] h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Implementation Guide */}
      <motion.div 
        id="implementation-guide" 
        className="py-16 bg-gray-50"
        ref={section4Ref}
        initial="hidden"
        animate={section4InView ? "visible" : "hidden"}
        variants={fadeIn}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <h2 className="text-3xl font-bold">Implementation Guide</h2>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <p>
                Here's how to effectively implement CoreTrack Assessment in your hiring process:
              </p>
              
              <h3>Best Practices</h3>
              <ol>
                <li>
                  <strong>Introduce it early</strong> - Send the assessment after initial resume screening but before
                  investing significant time in interviews.
                </li>
                <li>
                  <strong>Set expectations</strong> - Let candidates know why you're using the assessment and how the
                  results will be used.
                </li>
                <li>
                  <strong>Use results to guide interviews</strong> - Structure interview questions to explore areas
                  highlighted in the assessment results.
                </li>
                <li>
                  <strong>Compare with role requirements</strong> - Match the candidate's trait profile with what's
                  needed for success in the specific position.
                </li>
              </ol>
              
              <h3>Common Applications</h3>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg mb-2">Recruitment Optimization</h4>
                  <p className="mb-0">
                    Use CoreTrack Assessment to efficiently identify candidates who align with your company culture and
                    role requirements, reducing time-to-hire and improving quality of hire.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg mb-2">Team Composition</h4>
                  <p className="mb-0">
                    Build balanced teams by identifying complementary trait profiles, ensuring you have a mix of critical
                    thinkers, independent workers, passionate contributors, and role-focused team members.
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-lg mb-2">Employee Development</h4>
                  <p className="mb-0">
                    Use assessment insights to create personalized development plans that leverage strengths and address
                    areas for growth, improving employee satisfaction and retention.
                  </p>
                </div>
              </div>
              
              <h3>Measuring Success</h3>
              <p>
                Track these metrics to evaluate the effectiveness of CoreTrack Assessment in your hiring process:
              </p>
              <ul>
                <li>Reduction in turnover rates</li>
                <li>Improvement in time-to-productivity for new hires</li>
                <li>Increase in hiring manager satisfaction with candidates</li>
                <li>Enhanced team performance metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <div className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Hiring Process?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join hundreds of SMBs that have improved their hiring success with CoreTrack Assessment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/assessment" 
                className="bg-[#FF0000] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#FF0000]/90 transition-colors flex items-center justify-center gap-2"
              >
                Take Assessment
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/signup" 
                className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
