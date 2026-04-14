import { Link } from 'react-router-dom';

const floatingEmojis = ['🌸', '✨', '💫', '🍃', '🌷', '💖', '⭐', '🌼'];

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Floating decorations */}
      {floatingEmojis.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-2xl opacity-40 pointer-events-none select-none animate-home-float"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top: `${5 + (i * 17) % 70}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        >
          {emoji}
        </span>
      ))}

      <div className="container max-w-md mx-auto px-4 relative z-10">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-block mb-4 animate-home-bounce">
            <span className="text-6xl">🍐</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">小梨的日常</h1>
          <p className="text-muted-foreground text-lg">选择要查看的记录~</p>
          <div className="flex justify-center gap-1 mt-3">
            {['🌸', '🌸', '🌸'].map((e, i) => (
              <span key={i} className="text-sm opacity-60 animate-home-wiggle" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
            ))}
          </div>
        </header>

        {/* Nav cards */}
        <div className="space-y-5">
          <Link
            to="/bump"
            className="block bg-card rounded-3xl p-6 shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:animate-home-wiggle">
                <span className="text-3xl">🩹</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">每日一碰</h2>
                <p className="text-sm text-muted-foreground">记录每天的磕碰情况</p>
              </div>
              <span className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 text-xl">→</span>
            </div>
          </Link>

          <Link
            to="/milktea"
            className="block bg-card rounded-3xl p-6 shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:animate-home-wiggle">
                <span className="text-3xl">🧋</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">奶茶记录</h2>
                <p className="text-sm text-muted-foreground">记录每天的奶茶消费</p>
              </div>
              <span className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 text-xl">→</span>
            </div>
          </Link>
        </div>

        {/* Footer decoration */}
        <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
          <p className="text-xs text-muted-foreground/60">made with 💖 for 小梨</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
