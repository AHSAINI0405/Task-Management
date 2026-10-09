import { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { authApi } from '../../api/auth.api.js';

export default function CaptchaBox({
  captchaToken,
  setCaptchaToken,
  captchaAnswer,
  setCaptchaAnswer,
  error,
}) {
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    try {
      setLoading(true);
      const res = await authApi.getCaptcha();
      setSvg(res.data.data.captchaSvg);
      setCaptchaToken(res.data.data.captchaToken);
      setCaptchaAnswer('');
    } catch (err) {
      console.error('Failed to load captcha:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Security Verification <span className="text-red-500">*</span>
      </label>

      <div className="flex items-center gap-2.5">
        {/* Captcha SVG Preview */}
        <div
          className="flex-shrink-0 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 shadow-inner"
          style={{ width: '160px', height: '48px', lineHeight: 0 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {/* Refresh button */}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading}
          title="Get new captcha code"
          className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 transition flex-shrink-0 shadow-sm disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Captcha Answer Input */}
        <input
          type="text"
          maxLength={6}
          placeholder="Enter code"
          value={captchaAnswer}
          onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
          className="input-base text-sm uppercase tracking-widest font-mono font-bold text-center h-11"
          required
        />
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <p className="text-[11px] text-slate-400">
        Type the characters shown in the image above (not case-sensitive).
      </p>
    </div>
  );
}
