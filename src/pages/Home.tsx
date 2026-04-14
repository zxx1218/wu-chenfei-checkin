import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold gradient-text mb-2">小梨的日常</h1>
          <p className="text-muted-foreground">选择要查看的记录~</p>
        </header>

        <div className="space-y-4">
          <Link
            to="/bump"
            className="block bg-card rounded-3xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">🩹</span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">每日一碰</h2>
                <p className="text-sm text-muted-foreground">记录每天的磕碰情况</p>
              </div>
            </div>
          </Link>

          <Link
            to="/milktea"
            className="block bg-card rounded-3xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl group-hover:scale-110 transition-transform">🧋</span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">奶茶记录</h2>
                <p className="text-sm text-muted-foreground">记录每天的奶茶消费</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
