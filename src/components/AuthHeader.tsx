import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, Loader2 } from 'lucide-react'

export default function AuthHeader() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [email, setEmail] = useState('')
    const [showLogin, setShowLogin] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setIsLoading(false)
        }

        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Magic Link 이메일 로그인 요청
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            }
        })

        if (error) {
            alert(error.message)
        } else {
            alert('로그인 링크를 이메일로 전송했습니다! 메일함을 확인해주세요.')
            setShowLogin(false)
        }
        setIsLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    if (isLoading) return <div className="absolute top-4 right-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>

    return (
        <div className="absolute top-4 right-4">
            {user ? (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 hidden sm:inline-block">{user.email}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline-block">로그아웃</span>
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <button
                        onClick={() => setShowLogin(!showLogin)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-medium rounded-lg shadow-md transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        로그인
                    </button>

                    {showLogin && (
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <h3 className="font-semibold text-slate-800 mb-2">이메일로 시작하기 (매직링크)</h3>
                            <p className="text-xs text-slate-500 mb-4">비밀번호 없이 이메일 인증만으로 간편하게 로그인하세요.</p>
                            <form onSubmit={handleLogin} className="flex flex-col gap-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                                >
                                    로그인 링크 받기
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
