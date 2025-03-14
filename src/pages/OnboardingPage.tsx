import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Building, User, Mail, Key, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Steps in the onboarding flow
const steps = [
  {
    id: 'account',
    title: 'Account Details',
    description: 'Create your CoreTrack account'
  },
  {
    id: 'company',
    title: 'Company Profile',
    description: 'Tell us about your organization'
  },
  {
    id: 'goals',
    title: 'Assessment Goals',
    description: 'Customize your assessment strategy'
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Start using CoreTrack'
  }
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    industry: '',
    size: '',
    assessmentGoal: '',
    candidates: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form onSubmit={handleNext} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm py-3 border"
                  placeholder="John Smith"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm py-3 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm py-3 border"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Password must be at least 8 characters</p>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000]"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        );
      case 1:
        return (
          <form onSubmit={handleNext} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm py-3 border"
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm rounded-md border"
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select
                id="size"
                name="size"
                required
                value={formData.size}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm rounded-md border"
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000]"
              >
                Continue <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleNext} className="space-y-6">
            <div>
              <label htmlFor="assessmentGoal" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Assessment Goal
              </label>
              <select
                id="assessmentGoal"
                name="assessmentGoal"
                required
                value={formData.assessmentGoal}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm rounded-md border"
              >
                <option value="">What are you trying to achieve?</option>
                <option value="hiring">Improve hiring decisions</option>
                <option value="development">Employee development</option>
                <option value="team-building">Team building</option>
                <option value="leadership">Leadership development</option>
                <option value="culture">Culture alignment</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="candidates" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Monthly Candidates
              </label>
              <select
                id="candidates"
                name="candidates"
                required
                value={formData.candidates}
                onChange={handleChange}
                className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-[#FF0000] focus:border-[#FF0000] sm:text-sm rounded-md border"
              >
                <option value="">How many people will take assessments?</option>
                <option value="1-5">1-5 per month</option>
                <option value="6-20">6-20 per month</option>
                <option value="21-50">21-50 per month</option>
                <option value="51-100">51-100 per month</option>
                <option value="100+">100+ per month</option>
              </select>
            </div>
            
            <div className="mt-6">
              <fieldset>
                <legend className="text-base font-medium text-gray-700">Assessment Customization</legend>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="customizations"
                        name="customizations"
                        type="checkbox"
                        className="focus:ring-[#FF0000] h-4 w-4 text-[#FF0000] border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="customizations" className="font-medium text-gray-700">I want to customize the assessment</label>
                      <p className="text-gray-500">We'll contact you to discuss tailoring the assessment to your specific needs</p>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000]"
              >
                Complete Setup <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        );
      case 3:
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-6">Your CoreTrack account is ready to use.</p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Account Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{formData.fullName}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">Company</p>
                  <p className="font-medium">{formData.companyName}</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-500">Industry</p>
                  <p className="font-medium">{formData.industry}</p>
                </div>
              </div>
            </div>
            
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#FF0000] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000]"
            >
              Go to Dashboard <ChevronRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="text-[#FF0000] font-bold text-2xl">CoreTrack</Link>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Set Up Your Account</h1>
            <p className="mt-2 text-lg text-gray-600">Create your CoreTrack account to get started</p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      index < currentStep 
                        ? 'bg-[#FF0000] border-[#FF0000] text-white' 
                        : index === currentStep
                        ? 'border-[#FF0000] text-[#FF0000]'
                        : 'border-gray-300 text-gray-300'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div 
                    key={`line-${step.id}`}
                    className={`w-4 h-0.5 ${index < currentStep ? 'bg-[#FF0000]' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Form Card */}
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow rounded-lg p-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">{steps[currentStep].title}</h2>
            <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
            
            {getStepContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
