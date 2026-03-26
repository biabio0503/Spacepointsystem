import Link from 'next/link';
import { ChevronLeft, Github, Mail, User, BookOpen, Users, MapPin } from 'lucide-react';

async function getGithubProfile(username: string) {
    try {
        const res = await fetch(`https://api.github.com/users/${username}`, {
            next: { revalidate: 3600 * 24 } // 24시간마다 캐시 갱신
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        return null;
    }
}

export default async function DeveloperPage() {
    const profile = await getGithubProfile('jaehoya');
    const fallbackEmail = "devbabho@gmail.com";
    const emailToUse = profile?.email || fallbackEmail;

    return (
        <div className="flex flex-col min-h-[100dvh] bg-neutral-950 text-neutral-50 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950" />

            {/* Header */}
            <div className="relative p-6 pt-12 flex items-center justify-between border-b border-neutral-800/50 bg-neutral-950/50 backdrop-blur-md z-10">
                <Link
                    href="/settings"
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-lg font-medium text-neutral-200">개발자 소개</h1>
                <div className="w-10" />
            </div>

            {/* Content */}
            <main className="relative flex-1 p-6 z-10 overflow-y-auto pb-20 scrollbar-hide">
                <div className="max-w-md mx-auto space-y-6 mt-4">

                    {/* Profile Section */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px] shadow-lg">
                            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-neutral-400" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{profile?.name || 'jaehoya'}</h2>
                            <p className="text-neutral-400 font-medium">@{profile?.login || 'jaehoya'}</p>
                        </div>

                        {/* Bio & Location */}
                        <div className="space-y-2 flex flex-col items-center">
                            {profile?.bio && (
                                <p className="text-sm text-neutral-300 whitespace-pre-line max-w-[280px]">{profile.bio}</p>
                            )}
                            {profile?.location && (
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-900/50 px-3 py-1.5 rounded-full border border-neutral-800 mt-2">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{profile.location}</span>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Description */}
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                        <p className="text-neutral-100 leading-relaxed text-center text-sm font-medium">
                            <span className="text-white block mb-2 text-base font-semibold">안녕하세요, 프론트엔드 개발자 이재호입니다. 🙇</span>
                            <span className="block text-neutral-400 mb-3">서울과학기술대학교 정보통신대학 컴퓨터공학과 24학번</span>
                            <span className="block mb-4">제42대 SPACE 학생복지위원회 마일리지 시스템 제작을 맡게 되었습니다.</span>
                            <span className="block ">부족한 실력이지만 제 노력이 학생복지위원회와 학교에</span>
                            <span className="block ">도움이 된다면 좋겠습니다. 감사합니다.</span>
                        </p>
                    </div>

                    {/* Links Section */}
                    <div className="space-y-3 pt-2">
                        <a
                            href={`https://github.com/${profile?.login || 'jaehoya'}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#24292e] flex items-center justify-center">
                                <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-white">GitHub 방문하기</div>
                                <div className="text-xs text-neutral-400">{`github.com/${profile?.login || 'jaehoya'}`}</div>
                            </div>
                        </a>

                        {emailToUse && (
                            <a
                                href={`mailto:${emailToUse}`}
                                className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-colors group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-white">이메일 보내기</div>
                                    <div className="text-xs text-neutral-400">{emailToUse}</div>
                                </div>
                            </a>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
