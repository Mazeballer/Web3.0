'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  EyeOff,
  Shield,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Star,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',

    // Identity Verification
    idType: '',
    idNumber: '',
    dateOfBirth: '',
    nationality: '',

    // Address Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',

    // Agreements
    agreeToTerms: false,
    agreeToKYC: false,
    agreeToMarketing: false,
  });
  const router = useRouter();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return { minLength, hasUpper, hasLower, hasNumber, hasSpecial };
  };

  const passwordStrength = validatePassword(formData.password);
  const passwordScore = Object.values(passwordStrength).filter(Boolean).length;

  const handleNext = () => {
    if (step === 1) {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.phoneNumber
      ) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (passwordScore < 4) {
        setError('Please create a stronger password');
        return;
      }
    }

    if (step === 2) {
      if (
        !formData.idType ||
        !formData.idNumber ||
        !formData.dateOfBirth ||
        !formData.nationality
      ) {
        setError('Please complete all identity verification fields');
        return;
      }
    }

    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.agreeToTerms || !formData.agreeToKYC) {
      setError('Please agree to the terms and KYC requirements');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Set authentication token
      localStorage.setItem('auth_token', 'new_user_token_123');
      localStorage.setItem(
        'user_data',
        JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          creditScore: 650,
          verified: false,
          kycStatus: 'pending',
        })
      );

      toast({
        title: 'Account Created!',
        description:
          'Welcome to DeFi Lending. Your account is pending verification.',
      });

      setStep(4);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Account Created!
            </CardTitle>
            <CardDescription className="text-slate-300">
              Your identity verification is being processed
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Initial Credit Score</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-white font-bold">650</span>
                </div>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-slate-400 mt-2">
                Complete verification to unlock full lending features
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-white font-semibold">Verification Status:</h3>
              <div className="space-y-2">
                <div className="flex items-center text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-sm">Account created</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <div className="w-4 h-4 border-2 border-yellow-400 rounded-full mr-2 flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm">
                    Identity verification (24-48 hours)
                  </span>
                </div>
                <div className="flex items-center text-slate-300">
                  <div className="w-4 h-4 border-2 border-slate-400 rounded-full mr-2" />
                  <span className="text-sm">Connect wallet</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <div className="w-4 h-4 border-2 border-slate-400 rounded-full mr-2" />
                  <span className="text-sm">Start lending/borrowing</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-200 text-sm">
                <strong>Important:</strong> You'll receive an email once your
                identity is verified. This usually takes 24-48 hours.
              </p>
            </div>

            <Button
              onClick={() => router.push('/app')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Continue to Dashboard
            </Button>

            <div className="text-center text-sm text-slate-400">
              Need help?{' '}
              <Link
                href="/support"
                className="text-blue-400 hover:text-blue-300"
              >
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] opacity-5" />

      <Card className="w-full max-w-lg relative backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Create DeFi Account
          </CardTitle>
          <CardDescription className="text-slate-300">
            Step {step} of 3 -{' '}
            {step === 1
              ? 'Personal Information'
              : step === 2
              ? 'Identity Verification'
              : 'Address & Agreements'}
          </CardDescription>
          <Progress value={(step / 3) * 100} className="h-2 mt-4" />
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-500/10 border-red-500/20"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-200">
                    First Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-200">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-200">
                  Phone Number *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Password strength
                      </span>
                      <span className="text-xs text-slate-400">
                        {passwordScore}/5
                      </span>
                    </div>
                    <Progress
                      value={(passwordScore / 5) * 100}
                      className="h-1"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Continue to Identity Verification
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-blue-200 text-sm">
                  <strong>Identity Verification Required:</strong> To comply
                  with financial regulations, we need to verify your identity.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idType" className="text-slate-200">
                  ID Document Type *
                </Label>
                <Select
                  value={formData.idType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, idType: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">
                      Driver's License
                    </SelectItem>
                    <SelectItem value="national_id">
                      National ID Card
                    </SelectItem>
                    <SelectItem value="state_id">State ID Card</SelectItem>
                    <SelectItem value="ic">Identity Card (IC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-slate-200">
                  ID/IC Number *
                </Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="idNumber"
                    placeholder="Enter your ID/IC number"
                    value={formData.idNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        idNumber: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-slate-200">
                  Date of Birth *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="pl-10 bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality" className="text-slate-200">
                  Nationality *
                </Label>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, nationality: value }))
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="de">Germany</SelectItem>
                    <SelectItem value="fr">France</SelectItem>
                    <SelectItem value="jp">Japan</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="sg">Singapore</SelectItem>
                    <SelectItem value="my">Malaysia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-200">
                    Street Address *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="address"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-200">
                      City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-slate-200">
                      State/Province *
                    </Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-slate-200">
                      ZIP/Postal Code *
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-slate-200">
                      Country *
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, country: value }))
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="sg">Singapore</SelectItem>
                        <SelectItem value="my">Malaysia</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeToTerms: checked as boolean,
                        }))
                      }
                      className="border-white/20 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="terms" className="text-sm text-slate-300">
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="kyc"
                      checked={formData.agreeToKYC}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeToKYC: checked as boolean,
                        }))
                      }
                      className="border-white/20 data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="kyc" className="text-sm text-slate-300">
                      I consent to identity verification and KYC procedures
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketing"
                      checked={formData.agreeToMarketing}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeToMarketing: checked as boolean,
                        }))
                      }
                      className="border-white/20 data-[state=checked]:bg-blue-600"
                    />
                    <Label
                      htmlFor="marketing"
                      className="text-sm text-slate-300"
                    >
                      I want to receive updates and marketing communications
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {step < 3 && (
            <div className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
