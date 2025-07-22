// components/Register.js
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../common/context/AuthProvider';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Helper function to determine password strength
const getPasswordStrength = (password) => {
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (password.length < 8) return { label: 'Too Short', level: 'text-red-500' };
  if (hasUpper && hasLower && hasNumber && hasSpecialChar) return { label: 'Strong', level: 'text-green-600' };
  if ((hasUpper || hasLower) && hasNumber && hasSpecialChar) return { label: 'Medium', level: 'text-yellow-600' };
  return { label: 'Weak', level: 'text-red-500' };
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain a special character')
      .required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError('');

      const result = await register(values);
      if (result.success) {
        navigate('/login', { state: { registrationSuccess: true } });
      } else {
        setError(result.error);
      }
      setIsSubmitting(false);
    },
  });

  const passwordStrength = getPasswordStrength(formik.values.password);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img alt="minimint" src="src/assets/logo.png" className="mx-auto h-20 w-auto" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Registration</h2>
      </div>

      {/* Form Container */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="block w-full rounded-md px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
              {formik.values.password && (
                <p className={`text-xs mt-1 ${passwordStrength.level}`}>
                  Password Strength: {passwordStrength.label}
                  {passwordStrength.label !== 'Strong' && (
                    <span className="ml-2 text-gray-500">(Try mixing uppercase, lowercase & special characters)</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={!formik.isValid || !formik.dirty || isSubmitting}
              className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                (!formik.isValid || !formik.dirty || isSubmitting) ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        {/* Login Redirect */}
        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}