"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight, ShieldCheck, Loader2, KeyRound } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

type Step = 'email' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    })

    if (error) {
      setError(error.message === 'Signups not allowed for otp'
        ? 'This email is not authorized. Contact the administrator.'
        : error.message
      )
    } else {
      setMessage('A 6-digit code has been sent to your email.')
      setStep('otp')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setError('Invalid or expired code. Please try again.')
    }
    setLoading(false)
  }

  const handleGuestLogin = () => {
    localStorage.setItem('guest_session', 'true')
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-zinc-950 font-sans">
      {/* Brutalist Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Simplified Header */}

        {/* Sharp Card */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-all">
          
          {step === 'email' ? (
            <div className="space-y-8">
              <div className="space-y-1">
                        <div className="mb-12 border-l-4 border-black dark:border-white pl-6">
          <h1 className="text-4xl font-black text-black dark:text-white tracking-tighter uppercase leading-none">
            Authorized<br />Access
          </h1>
        </div>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-black dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Input Authorized Email</Label>
                  <Input
                    type="email"
                    placeholder="ADMIN@SYSTEM.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-50 dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 h-12 text-sm rounded-none focus:ring-0 focus:border-black dark:focus:border-white transition-none uppercase font-bold"
                  />
                </div>

                {error && (
                  <div className="text-xs text-white bg-black dark:bg-white dark:text-black px-4 py-2 font-bold uppercase">
                    Error: {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full h-12 text-sm font-black bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none transition-none uppercase tracking-widest"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Login
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-200"></span></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400">OR</span></div>
                </div>

                <Button
                  type="button"
                  onClick={handleGuestLogin}
                  variant="outline"
                  className="w-full h-12 text-[11px] font-bold border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white rounded-none transition-all uppercase tracking-widest"
                >
                  Continue as Guest
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-lg font-black uppercase text-black dark:text-white">Verification</h2>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">Code sent to: {email}</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-black dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Passcode: 6-Digits</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    className="bg-zinc-50 dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 text-black dark:text-white placeholder:text-zinc-400 h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-none focus:ring-0 focus:border-black dark:focus:border-white transition-none"
                  />
                </div>

                {message && (
                  <div className="text-xs text-black border-2 border-black dark:border-white dark:text-white px-4 py-2 font-bold uppercase flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    {message}
                  </div>
                )}

                {error && (
                  <div className="text-xs text-white bg-black dark:bg-white dark:text-black px-4 py-2 font-bold uppercase">
                    Error: {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 text-sm font-black bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none transition-none uppercase tracking-widest"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Access Dashboard
                    </span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp(''); setError(''); setMessage(''); }}
                  className="w-full text-[10px] text-zinc-500 hover:text-black dark:hover:text-white transition-none uppercase font-black tracking-widest underline underline-offset-4"
                >
                  Cancel Login
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 flex justify-between items-end">
          <div className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter leading-none">
            Secure<br />Environment
          </div>
          <div className="flex flex-col items-end gap-4">
            <ThemeToggle />
            <div className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter text-right leading-none">
              Supabase Auth<br />Verified Session
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
