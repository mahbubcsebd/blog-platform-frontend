'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, isAuthenticated } = useAuth();

  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumberOrSpecial: false,
    passwordsMatch: false,
  });

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate password requirements
  useEffect(() => {
    const { password, confirmPassword } = formData;

    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumberOrSpecial: /[\d\W]/.test(password),
      passwordsMatch: password.length > 0 && password === confirmPassword,
    });
  }, [formData.password, formData.confirmPassword]);

  // Check if form is valid
  const isFormValid = () => {
    const {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumberOrSpecial,
      passwordsMatch,
    } = passwordValidation;
    const { firstName, lastName, email, username, password, confirmPassword } =
      formData;

    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      username.trim() &&
      password &&
      confirmPassword &&
      minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumberOrSpecial &&
      passwordsMatch
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Client-side validation
    if (!isFormValid()) {
      if (!passwordValidation.passwordsMatch) {
        setError('Passwords do not match');
      } else {
        setError('Please fill all fields and meet password requirements');
      }
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);

      if (result.success) {
        setSuccess(true);

        // Small delay to show success message, then redirect
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password requirement item component
  const PasswordRequirement = ({ isValid, text }) => (
    <li
      className={`flex items-center space-x-2 transition-colors duration-200 ${
        isValid ? 'text-green-600' : 'text-gray-500'
      }`}
    >
      <div
        className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${
          isValid ? 'bg-green-100' : 'bg-gray-100'
        }`}
      >
        {isValid ? (
          <Check className="w-3 h-3 text-green-600" />
        ) : (
          <X className="w-3 h-3 text-gray-400" />
        )}
      </div>
      <span className="text-xs">{text}</span>
    </li>
  );

  // Show loading spinner if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join BlogHub
          </h1>
          <p className="text-gray-600">
            Create your account and start sharing your stories
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-900">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Create your account to get started
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 font-medium">
                    Account created successfully! Redirecting...
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && !success && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                      disabled={loading}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="h-11 pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      disabled={loading}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="h-11 pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-11 pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="yourusername"
                    required
                    disabled={loading}
                    value={formData.username}
                    onChange={handleInputChange}
                    className="h-11 pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-11 pl-10 pr-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    required
                    disabled={loading}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`h-11 pl-10 pr-12 transition-colors ${
                      formData.confirmPassword &&
                      !passwordValidation.passwordsMatch
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password mismatch warning */}
                {formData.confirmPassword &&
                  !passwordValidation.passwordsMatch && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Passwords do not match</span>
                    </p>
                  )}
              </div>

              {/* Dynamic Password Requirements */}
              {formData.password && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Password Requirements:
                  </p>
                  <ul className="space-y-2">
                    <PasswordRequirement
                      isValid={passwordValidation.minLength}
                      text="At least 8 characters"
                    />
                    <PasswordRequirement
                      isValid={passwordValidation.hasUppercase}
                      text="One uppercase letter (A-Z)"
                    />
                    <PasswordRequirement
                      isValid={passwordValidation.hasLowercase}
                      text="One lowercase letter (a-z)"
                    />
                    <PasswordRequirement
                      isValid={passwordValidation.hasNumberOrSpecial}
                      text="One number or special character"
                    />
                    {formData.confirmPassword && (
                      <PasswordRequirement
                        isValid={passwordValidation.passwordsMatch}
                        text="Passwords match"
                      />
                    )}
                  </ul>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className={`w-full h-11 font-medium shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={loading || !isFormValid()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/sign-in"
                    className="font-medium text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
