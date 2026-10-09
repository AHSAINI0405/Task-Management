import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/auth.api.js';
import CaptchaBox from '../../components/common/CaptchaBox.jsx';
import Button from '../../components/ui/Button.jsx';

export default function LoginPage() {
  const { loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Step 1: Email & Captcha -> Step 2: OTP Entry
  const [step, setStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  // Captcha state
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Loading & resend timer
  const [sendingOtp, setSendingOtp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Request Login OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!captchaAnswer.trim()) {
      setCaptchaError('Please solve the security captcha');
      return;
    }
    setCaptchaError('');

    try {
      setSendingOtp(true);
      await authApi.sendLoginOtp({
        email: email.trim().toLowerCase(),
        captchaToken,
        captchaAnswer: captchaAnswer.trim(),
      });
      toast.success('Login code sent to your email!');
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send login code';
      toast.error(msg);
      // Clear captcha answer so user solves new one on retry
      setCaptchaAnswer('');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Login OTP
  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit login code');
      return;
    }

    try {
      setLoggingIn(true);
      await loginWithOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired login code';
      toast.error(msg);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="card w-full max-w-md p-8 shadow-xl border border-slate-200 dark:border-slate-800">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl mb-3 shadow-sm">
            J
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {step === 1 ? 'Welcome Back' : 'Enter login code'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 1
              ? 'Sign in securely with email OTP and Captcha'
              : `We sent a 6-digit login code to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          /* Step 1: Email & Captcha */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base pl-9 text-sm"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Captcha challenge */}
            <CaptchaBox
              captchaToken={captchaToken}
              setCaptchaToken={setCaptchaToken}
              captchaAnswer={captchaAnswer}
              setCaptchaAnswer={setCaptchaAnswer}
              error={captchaError}
            />

            <Button
              type="submit"
              loading={sendingOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 mt-2"
            >
              <span>Send Login Code</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          /* Step 2: OTP Entry */
          <form onSubmit={handleVerifyLogin} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-300">
                <p className="font-semibold">Login code sent!</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">
                  Check your inbox at <strong>{email}</strong> for the 6-digit code.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enter 6-Digit Login Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-base pl-9 text-center text-lg tracking-widest font-mono font-bold"
                  autoFocus
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <span>Verify &amp; Sign In</span>
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                ← Change Email
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendTimer > 0 || sendingOtp}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-slate-200 dark:border-slate-800 mt-6 pt-5 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
