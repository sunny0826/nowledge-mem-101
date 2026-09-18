export const CommunityTweet = ({ id, author, handle, locale = "en" }) => {
  const mount = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const host = mount.current;
    let disposed = false;
    let generation = 0;
    let timer;

    // Share the official loader across posts and client-side page navigation.
    if (!window.__communityXWidgets) {
      window.__communityXWidgets = new Promise((resolve, reject) => {
        if (window.twttr?.widgets) {
          resolve(window.twttr);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        const timeout = setTimeout(() => {
          script.remove();
          reject(new Error("X widgets timed out"));
        }, 15000);
        script.onload = () => {
          clearTimeout(timeout);
          if (window.twttr?.widgets) resolve(window.twttr);
          else reject(new Error("X widgets unavailable"));
        };
        script.onerror = () => {
          clearTimeout(timeout);
          script.remove();
          reject(new Error("X widgets unavailable"));
        };
        document.head.appendChild(script);
      });
      window.__communityXWidgets.catch(() => {
        delete window.__communityXWidgets;
      });
    }
    const widgets = window.__communityXWidgets;
    let theme = document.documentElement.classList.contains("dark") ? "dark" : "light";

    const render = () => {
      const version = ++generation;
      clearTimeout(timer);
      setStatus("loading");
      // A fresh target prevents a late response from restoring an older theme.
      const target = document.createElement("div");
      host.replaceChildren(target);
      const current = () => !disposed && generation === version;
      timer = setTimeout(() => {
        if (current()) setStatus("unavailable");
      }, 20000);
      widgets.then((twitter) => {
        if (!current()) return;
        return twitter.widgets.createTweet(id, target, {
          theme,
          lang: locale === "zh" ? "zh-cn" : "en",
          dnt: true,
          width: 550,
        });
      }).then((element) => {
        if (!current()) return;
        clearTimeout(timer);
        setStatus(element ? "ready" : "unavailable");
      }).catch(() => {
        if (!current()) return;
        clearTimeout(timer);
        setStatus("unavailable");
      });
    };

    render();
    const observer = new MutationObserver(() => {
      const next = document.documentElement.classList.contains("dark") ? "dark" : "light";
      if (next !== theme) {
        theme = next;
        render();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      disposed = true;
      clearTimeout(timer);
      observer.disconnect();
      host.replaceChildren();
    };
  }, [id, locale]);

  return (
    <div className="community-tweet">
      <div ref={mount} className="community-tweet-embed" />
      {status !== "ready" && (
        <div className="community-tweet-fallback">
          <span className="community-tweet-author">{author} <span>@{handle}</span></span>
          <p role="status">{status === "loading"
            ? (locale === "zh" ? "正在加载 X 原帖…" : "Loading the original X post…")
            : (locale === "zh" ? "暂时无法加载，可前往 X 阅读原帖。" : "This post could not load. Read the original on X.")}</p>
          <a href={`https://x.com/${handle}/status/${id}`} target="_blank" rel="noopener noreferrer">
            {locale === "zh" ? "在 X 查看原帖" : "View original on X"} ↗
          </a>
        </div>
      )}
    </div>
  );
};
